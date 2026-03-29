import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  type CellValueChangedEvent,
  type GridApi,
  type GridReadyEvent,
  themeQuartz,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import { authService } from '../../auth/services/authService';
import { usuarioTemModuloProduto } from '../../../shared/constants/produtoModulo';
import { useModulosUsuarioStore } from '../../../shared/stores/modulosUsuarioStore';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import { createProdutoGridColumnDefs } from '../grid/produtoGridColDefs';
import {
  atualizarCamposBasicosProduto,
  criarProduto,
  excluirProduto,
  listarProdutosResumo,
  type CampoBasicoEditavel,
  type ProdutoResumo,
  type ProdutoUpsertPayload,
} from '../services/produtoService';
import './ProductsPage.css';

function isCampoBasico(field: string | undefined): field is CampoBasicoEditavel {
  return field === 'nome' || field === 'marca' || field === 'unidadeMedida';
}

function ProductsPage(): React.ReactElement {
  const { t } = useTranslation('common');
  const modulos = useModulosUsuarioStore((s) => s.modulos);
  const addNotification = useNotificationCenterStore((s) => s.add);
  const gridApiRef = useRef<GridApi<ProdutoResumo> | null>(null);

  const [rows, setRows] = useState<ProdutoResumo[]>([]);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [creating, setCreating] = useState(false);

  const [novo, setNovo] = useState({
    nome: '',
    descricao: '',
    marca: '',
    modelo: '',
    gtin: '',
    unidadeMedida: 'UN',
    origemTipo: 'NACIONAL',
    paisOrigem: '',
    ncm: '',
    cest: '',
    origemIcms: '0',
    alturaEmb: '1',
    larguraEmb: '1',
    comprimentoEmb: '1',
    pesoEmb: '1',
    incluirDimProduto: false,
    alturaP: '0',
    larguraP: '0',
    comprimentoP: '0',
    skuCodigo: 'PADRAO',
    skuAtivo: true,
  });

  const podeVerProdutos = modulos !== null && usuarioTemModuloProduto(modulos);
  const carregandoModulos = modulos === null;

  const reloadGrid = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      return;
    }
    setLoadingGrid(true);
    try {
      const data = await listarProdutosResumo();
      setRows(data);
    } catch (error: unknown) {
      addNotification({
        title: t('modules.productsAdmin.loadErrorTitle'),
        body: resolveLocalizedErrorMessage(error, t),
        severity: 'error',
      });
    } finally {
      setLoadingGrid(false);
    }
  }, [addNotification, t]);

  useEffect(() => {
    if (podeVerProdutos) {
      void reloadGrid();
    }
  }, [podeVerProdutos, reloadGrid]);

  const columnDefs = useMemo(() => createProdutoGridColumnDefs(), []);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      floatingFilter: true,
    }),
    []
  );

  const onGridReady = useCallback((e: GridReadyEvent<ProdutoResumo>) => {
    gridApiRef.current = e.api;
  }, []);

  const onCellValueChanged = useCallback(
    async (e: CellValueChangedEvent<ProdutoResumo>) => {
      if (!e.data || e.oldValue === e.newValue) {
        return;
      }
      const field = e.colDef.field;
      if (!isCampoBasico(field)) {
        return;
      }
      try {
        await atualizarCamposBasicosProduto(e.data.id, field, e.newValue);
      } catch (error: unknown) {
        addNotification({
          title: t('modules.productsAdmin.saveErrorTitle'),
          body: resolveLocalizedErrorMessage(error, t),
          severity: 'error',
        });
        await reloadGrid();
      }
    },
    [addNotification, reloadGrid, t]
  );

  const handleExcluirSelecionados = useCallback(async () => {
    const api = gridApiRef.current;
    if (!api) {
      return;
    }
    const selected = api.getSelectedRows() as ProdutoResumo[];
    if (selected.length === 0) {
      addNotification({
        title: t('modules.productsAdmin.deleteNoneTitle'),
        body: t('modules.productsAdmin.deleteNoneBody'),
        severity: 'info',
      });
      return;
    }
    try {
      for (const row of selected) {
        await excluirProduto(row.id);
      }
      addNotification({
        title: t('modules.productsAdmin.deleteOkTitle'),
        body: t('modules.productsAdmin.deleteOkBody', { count: selected.length }),
        severity: 'success',
      });
      await reloadGrid();
      api.deselectAll();
    } catch (error: unknown) {
      addNotification({
        title: t('modules.productsAdmin.deleteErrorTitle'),
        body: resolveLocalizedErrorMessage(error, t),
        severity: 'error',
      });
      await reloadGrid();
    }
  }, [addNotification, reloadGrid, t]);

  const montarPayloadNovo = useCallback((): ProdutoUpsertPayload => {
    const emb = {
      altura: Number(novo.alturaEmb.replace(',', '.')),
      largura: Number(novo.larguraEmb.replace(',', '.')),
      comprimento: Number(novo.comprimentoEmb.replace(',', '.')),
      peso: Number(novo.pesoEmb.replace(',', '.')),
    };
    const payload: ProdutoUpsertPayload = {
      nome: novo.nome.trim(),
      descricao: novo.descricao.trim() || null,
      marca: novo.marca.trim() || null,
      modelo: novo.modelo.trim() || null,
      gtin: novo.gtin.trim() || null,
      unidadeMedida: novo.unidadeMedida.trim(),
      origemGeografica: {
        tipo: novo.origemTipo.trim(),
        paisOrigem: novo.paisOrigem.trim() || null,
      },
      dadosFiscais: {
        ncm: novo.ncm.trim(),
        cest: novo.cest.trim() || null,
        origem: novo.origemIcms.trim(),
      },
      dimensaoEmbalagem: emb,
      skus: [{ codigo: novo.skuCodigo.trim(), ativo: novo.skuAtivo }],
    };
    if (novo.incluirDimProduto) {
      payload.dimensaoProduto = {
        altura: Number(novo.alturaP.replace(',', '.')),
        largura: Number(novo.larguraP.replace(',', '.')),
        comprimento: Number(novo.comprimentoP.replace(',', '.')),
      };
    }
    return payload;
  }, [novo]);

  const handleCriar = useCallback(async () => {
    setCreating(true);
    try {
      await criarProduto(montarPayloadNovo());
      addNotification({
        title: t('modules.productsAdmin.createOkTitle'),
        body: t('modules.productsAdmin.createOkBody'),
        severity: 'success',
      });
      await reloadGrid();
    } catch (error: unknown) {
      addNotification({
        title: t('modules.productsAdmin.createErrorTitle'),
        body: resolveLocalizedErrorMessage(error, t),
        severity: 'error',
      });
    } finally {
      setCreating(false);
    }
  }, [addNotification, montarPayloadNovo, reloadGrid, t]);

  if (carregandoModulos) {
    return (
      <div className="products-page products-page--state">
        <p className="products-page__state-msg">{t('modules.productsAdmin.loadingModules')}</p>
      </div>
    );
  }

  if (!podeVerProdutos) {
    return (
      <div className="products-page products-page--state">
        <p className="products-page__state-msg">{t('modules.productsAdmin.noAccess')}</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <header className="products-page__header">
        <h1 className="products-page__title">{t('modules.productsAdmin.title')}</h1>
        <p className="products-page__subtitle">{t('modules.productsAdmin.subtitle')}</p>
      </header>

      <section className="products-page__create" aria-labelledby="products-new-heading">
        <h2 id="products-new-heading" className="products-page__section-title">
          {t('modules.productsAdmin.newSection')}
        </h2>
        <div className="products-page__form-grid">
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldNome')}</span>
            <input
              value={novo.nome}
              onChange={(e) => setNovo((s) => ({ ...s, nome: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldDescricao')}</span>
            <input
              value={novo.descricao}
              onChange={(e) => setNovo((s) => ({ ...s, descricao: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldUnidade')}</span>
            <input
              value={novo.unidadeMedida}
              onChange={(e) => setNovo((s) => ({ ...s, unidadeMedida: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldMarca')}</span>
            <input
              value={novo.marca}
              onChange={(e) => setNovo((s) => ({ ...s, marca: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldModelo')}</span>
            <input
              value={novo.modelo}
              onChange={(e) => setNovo((s) => ({ ...s, modelo: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldGtin')}</span>
            <input
              value={novo.gtin}
              onChange={(e) => setNovo((s) => ({ ...s, gtin: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldOrigemTipo')}</span>
            <input
              value={novo.origemTipo}
              onChange={(e) => setNovo((s) => ({ ...s, origemTipo: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldPaisOrigem')}</span>
            <input
              value={novo.paisOrigem}
              onChange={(e) => setNovo((s) => ({ ...s, paisOrigem: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldNcm')}</span>
            <input
              value={novo.ncm}
              onChange={(e) => setNovo((s) => ({ ...s, ncm: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldCest')}</span>
            <input
              value={novo.cest}
              onChange={(e) => setNovo((s) => ({ ...s, cest: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldOrigemIcms')}</span>
            <input
              value={novo.origemIcms}
              onChange={(e) => setNovo((s) => ({ ...s, origemIcms: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldEmbAltura')}</span>
            <input
              value={novo.alturaEmb}
              onChange={(e) => setNovo((s) => ({ ...s, alturaEmb: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldEmbLargura')}</span>
            <input
              value={novo.larguraEmb}
              onChange={(e) => setNovo((s) => ({ ...s, larguraEmb: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldEmbComprimento')}</span>
            <input
              value={novo.comprimentoEmb}
              onChange={(e) => setNovo((s) => ({ ...s, comprimentoEmb: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldEmbPeso')}</span>
            <input
              value={novo.pesoEmb}
              onChange={(e) => setNovo((s) => ({ ...s, pesoEmb: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field products-page__field--check">
            <input
              type="checkbox"
              checked={novo.incluirDimProduto}
              onChange={(e) => setNovo((s) => ({ ...s, incluirDimProduto: e.target.checked }))}
            />
            <span>{t('modules.productsAdmin.fieldDimProdutoToggle')}</span>
          </label>
          {novo.incluirDimProduto ? (
            <>
              <label className="products-page__field">
                <span>{t('modules.productsAdmin.fieldDimPAltura')}</span>
                <input
                  value={novo.alturaP}
                  onChange={(e) => setNovo((s) => ({ ...s, alturaP: e.target.value }))}
                  autoComplete="off"
                />
              </label>
              <label className="products-page__field">
                <span>{t('modules.productsAdmin.fieldDimPLargura')}</span>
                <input
                  value={novo.larguraP}
                  onChange={(e) => setNovo((s) => ({ ...s, larguraP: e.target.value }))}
                  autoComplete="off"
                />
              </label>
              <label className="products-page__field">
                <span>{t('modules.productsAdmin.fieldDimPComprimento')}</span>
                <input
                  value={novo.comprimentoP}
                  onChange={(e) => setNovo((s) => ({ ...s, comprimentoP: e.target.value }))}
                  autoComplete="off"
                />
              </label>
            </>
          ) : null}
          <label className="products-page__field">
            <span>{t('modules.productsAdmin.fieldSkuCodigo')}</span>
            <input
              value={novo.skuCodigo}
              onChange={(e) => setNovo((s) => ({ ...s, skuCodigo: e.target.value }))}
              autoComplete="off"
            />
          </label>
          <label className="products-page__field products-page__field--check">
            <input
              type="checkbox"
              checked={novo.skuAtivo}
              onChange={(e) => setNovo((s) => ({ ...s, skuAtivo: e.target.checked }))}
            />
            <span>{t('modules.productsAdmin.fieldSkuAtivo')}</span>
          </label>
        </div>
        <div className="products-page__actions">
          <button type="button" className="products-page__btn products-page__btn--primary" disabled={creating} onClick={() => void handleCriar()}>
            {creating ? t('modules.productsAdmin.creating') : t('modules.productsAdmin.create')}
          </button>
        </div>
      </section>

      <section className="products-page__grid-section" aria-label={t('modules.productsAdmin.gridAria')}>
        <div className="products-page__toolbar">
          <button type="button" className="products-page__btn" disabled={loadingGrid} onClick={() => void reloadGrid()}>
            {loadingGrid ? t('modules.productsAdmin.refreshing') : t('modules.productsAdmin.refresh')}
          </button>
          <button type="button" className="products-page__btn products-page__btn--danger" onClick={() => void handleExcluirSelecionados()}>
            {t('modules.productsAdmin.deleteSelected')}
          </button>
        </div>
        {!loadingGrid && rows.length === 0 ? (
          <p className="products-page__grid-empty" role="status">
            {t('modules.productsAdmin.emptyGrid')}
          </p>
        ) : null}
        <div className="products-page__ag-root" style={{ height: 520, width: '100%' }}>
          <AgGridReact<ProdutoResumo>
            modules={[AllCommunityModule]}
            theme={themeQuartz}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowData={rows}
            getRowId={(p) => String(p.data?.id ?? '')}
            onGridReady={onGridReady}
            onCellValueChanged={onCellValueChanged}
            rowSelection={{
              mode: 'multiRow',
              checkboxes: true,
              headerCheckbox: true,
              enableClickSelection: true,
            }}
            singleClickEdit
            stopEditingWhenCellsLoseFocus
          />
        </div>
      </section>
    </div>
  );
}

export default ProductsPage;
