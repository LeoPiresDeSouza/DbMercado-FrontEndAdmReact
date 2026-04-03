import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usuarioTemModuloProduto } from '../../../shared/constants/produtoModulo';
import { useModulosUsuarioStore } from '../../../shared/stores/modulosUsuarioStore';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import ProdutoForm from '../components/ProdutoForm';
import {
  atualizarProduto,
  listarOrigensGeograficasProduto,
  listarTiposEmbalagemProduto,
  listarUnidadesComercializacaoProduto,
  listarUnidadesDimensaoProduto,
  listarUnidadesMedidaProduto,
  listarUnidadesPesoProduto,
  obterProdutoPorId,
  type ProdutoFormOpcoesCatalogo,
  type ProdutoUnidadeMedidaOpcao,
} from '../services/produtoService';
import { createEmptyProdutoFormValues, type ProdutoFormValues } from '../types/produtoFormValues';
import { produtoDetalheToFormValues, produtoFormValuesToUpsert } from '../utils/produtoFormMappers';
import { validateProdutoForm } from '../utils/validateProdutoForm';

function ProdutoEditarPage(): React.ReactElement {
  const { t } = useTranslation('common');
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const modulos = useModulosUsuarioStore((s) => s.modulos);
  const addNotification = useNotificationCenterStore((s) => s.add);

  const id = idParam ? Number(idParam) : NaN;
  const idValid = Number.isInteger(id) && id > 0;

  const [values, setValues] = useState(createEmptyProdutoFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [opcoesCatalogo, setOpcoesCatalogo] = useState<ProdutoFormOpcoesCatalogo>({
    comercializacao: [],
    medidaFisica: [],
    tipoEmbalagem: [],
    dimensao: [],
    peso: [],
  });
  const [opcoesCatalogoCarregando, setOpcoesCatalogoCarregando] = useState(false);
  const [origensGeograficas, setOrigensGeograficas] = useState<ProdutoUnidadeMedidaOpcao[]>([]);
  const [origensGeograficasCarregando, setOrigensGeograficasCarregando] = useState(false);

  const podeVer = modulos !== null && usuarioTemModuloProduto(modulos);
  const carregandoModulos = modulos === null;

  useEffect(() => {
    if (!idValid || !podeVer) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void obterProdutoPorId(id)
      .then((p) => {
        if (!cancelled) {
          setValues(produtoDetalheToFormValues(p));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(resolveLocalizedErrorMessage(err, t));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, idValid, podeVer, t]);

  useEffect(() => {
    if (!podeVer) {
      return;
    }
    let cancelled = false;
    setOpcoesCatalogoCarregando(true);
    setOrigensGeograficasCarregando(true);
    void Promise.all([
      listarUnidadesComercializacaoProduto(),
      listarUnidadesMedidaProduto(),
      listarTiposEmbalagemProduto(),
      listarUnidadesDimensaoProduto(),
      listarUnidadesPesoProduto(),
      listarOrigensGeograficasProduto(),
    ])
      .then(([com, fis, emb, dim, peso, origens]) => {
        if (!cancelled) {
          setOpcoesCatalogo({
            comercializacao: com,
            medidaFisica: fis,
            tipoEmbalagem: emb,
            dimensao: dim,
            peso,
          });
          setOrigensGeograficas(origens);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOpcoesCatalogo({
            comercializacao: [],
            medidaFisica: [],
            tipoEmbalagem: [],
            dimensao: [],
            peso: [],
          });
          setOrigensGeograficas([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setOpcoesCatalogoCarregando(false);
          setOrigensGeograficasCarregando(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [podeVer]);

  const patch = useCallback((p: Partial<ProdutoFormValues>) => {
    setValues((s) => ({ ...s, ...p }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!idValid) {
        return;
      }
      const v = validateProdutoForm(values, t);
      setErrors(v);
      if (Object.keys(v).length > 0) {
        return;
      }
      setSubmitting(true);
      try {
        await atualizarProduto(id, produtoFormValuesToUpsert(values));
        addNotification({
          title: t('modules.productsAdmin.updateOkTitle'),
          body: t('modules.productsAdmin.updateOkBody'),
          severity: 'success',
        });
        navigate('/admin/produtos');
      } catch (error: unknown) {
        addNotification({
          title: t('modules.productsAdmin.updateErrorTitle'),
          body: resolveLocalizedErrorMessage(error, t),
          severity: 'error',
        });
      } finally {
        setSubmitting(false);
      }
    },
    [addNotification, id, idValid, navigate, t, values]
  );

  if (carregandoModulos) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6">
        <p className="text-sm text-[#718096]">{t('modules.productsAdmin.loadingModules')}</p>
      </div>
    );
  }

  if (!podeVer) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6">
        <p className="text-sm text-[#718096]">{t('modules.productsAdmin.noAccess')}</p>
      </div>
    );
  }

  if (!idValid) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-[#718096]">{t('modules.productsAdmin.invalidId')}</p>
        <Link
          to="/admin/produtos"
          className="text-sm font-medium text-[#0D6EFD] hover:text-[#0B5ED7] hover:underline"
        >
          {t('modules.productsAdmin.backToList')}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6">
        <p className="text-sm text-[#718096]">{t('modules.productsAdmin.loadingProduct')}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6">
        <p className="max-w-md text-center text-sm text-[#DC3545]">{loadError}</p>
        <Link
          to="/admin/produtos"
          className="text-sm font-medium text-[#0D6EFD] hover:text-[#0B5ED7] hover:underline"
        >
          {t('modules.productsAdmin.backToList')}
        </Link>
      </div>
    );
  }

  const formTitle = t('modules.productsAdmin.formTitleEdit', { id });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/admin/produtos"
              className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#0D6EFD] transition-colors hover:text-[#0B5ED7] hover:underline"
            >
              <ArrowLeft size={16} aria-hidden />
              {t('modules.productsAdmin.backToList')}
            </Link>
            <h1 className="text-2xl font-bold text-white">{formTitle}</h1>
            <p className="mt-0.5 text-sm text-[#718096]">{t('modules.productsAdmin.subtitle')}</p>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col">
          <div className="sticky top-0 z-10 mb-6 flex flex-col gap-4 rounded-xl border border-[#2D3748] bg-[rgba(20,27,45,0.95)] px-6 py-4 shadow-md backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white">{formTitle}</h2>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Link
                to="/admin/produtos"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[#2D3748] bg-[#141B2D] px-5 py-2.5 text-sm font-medium text-[#ADB5BD] shadow-sm transition-all hover:border-[#4A5568] hover:text-white focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.3)]"
              >
                {t('modules.productsAdmin.cancel')}
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0D6EFD] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0B5ED7] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? t('modules.productsAdmin.saving') : t('modules.productsAdmin.save')}
              </button>
            </div>
          </div>

          <ProdutoForm
            values={values}
            onChange={patch}
            errors={errors}
            disabled={submitting || loading}
            opcoesCatalogo={opcoesCatalogo}
            opcoesCatalogoCarregando={opcoesCatalogoCarregando}
            origensGeograficasOpcoes={origensGeograficas}
            origensGeograficasCarregando={origensGeograficasCarregando}
          />
        </form>
      </div>
    </div>
  );
}

export default ProdutoEditarPage;
