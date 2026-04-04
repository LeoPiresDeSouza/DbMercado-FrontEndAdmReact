import React from 'react';
import { Check, ChevronLeft, ChevronRight, Globe, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCategoriaArvore } from '../hooks/useCategoriaArvore';
import type { CategoriaTreeNode, ProdutoFiltrosAtivos } from '../types/categoriaTypes';
import { CategoriaTreeNodeItem } from './CategoriaTreeNode';
import '../../../shared/styles/productFacetNav.css';

interface Props {
  filtros: ProdutoFiltrosAtivos;
  onFiltroCategoria: (node: CategoriaTreeNode | null) => void;
  onFiltroOrigem: (origem: string | null) => void;
  recolhido: boolean;
  onToggleRecolhido: () => void;
}

export function CategoriaFacetPanel({
  filtros,
  onFiltroCategoria,
  onFiltroOrigem,
  recolhido,
  onToggleRecolhido,
}: Props): React.ReactElement {
  const { t } = useTranslation('common');
  const { data: arvore = [], isLoading } = useCategoriaArvore();

  const handleSelectCategoria = (node: CategoriaTreeNode): void => {
    if (filtros.categoriaId === node.id) {
      onFiltroCategoria(null);
    } else {
      onFiltroCategoria(node);
    }
  };

  const todasSelecionado = filtros.categoriaId === null;

  if (recolhido) {
    return (
      <aside
        className="product-facet-sidebar--rail relative z-20 flex w-10 shrink-0 flex-col items-center pt-4"
        aria-label={t('modules.productsAdmin.facetTitle')}
      >
        <button
          type="button"
          onClick={onToggleRecolhido}
          title={t('modules.productsAdmin.facetExpand')}
          className="product-facet-sidebar__icon-btn"
        >
          <ChevronRight size={16} aria-hidden />
        </button>
      </aside>
    );
  }

  const opcoesOrigem: Array<{ value: string | null; labelKey: string }> = [
    { value: null, labelKey: 'modules.productsAdmin.facetOriginAll' },
    { value: 'NACIONAL', labelKey: 'modules.productsAdmin.facetOriginNational' },
    { value: 'IMPORTADO', labelKey: 'modules.productsAdmin.facetOriginImported' },
  ];

  return (
    <aside
      className="product-facet-sidebar relative z-20 flex w-56 shrink-0 flex-col overflow-hidden"
      aria-label={t('modules.productsAdmin.facetTitle')}
    >
      <div className="product-facet-sidebar__header">
        <span className="product-facet-sidebar__title">{t('modules.productsAdmin.facetTitle')}</span>
        <button
          type="button"
          onClick={onToggleRecolhido}
          title={t('modules.productsAdmin.facetCollapse')}
          className="product-facet-sidebar__icon-btn"
        >
          <ChevronLeft size={14} aria-hidden />
        </button>
      </div>

      <div className="product-facet-sidebar__body">
        <section>
          <div className="product-facet-sidebar__section-head">
            <Tag size={10} className="shrink-0 text-[#4A5568]" aria-hidden />
            <span className="product-facet-sidebar__section-label">{t('modules.productsAdmin.facetCategory')}</span>
          </div>

          {isLoading ? (
            <div className="product-facet-sidebar__loading">{t('modules.productsAdmin.facetLoading')}</div>
          ) : (
            <ul className="product-facet-sidebar__list">
              <li>
                <button
                  type="button"
                  onClick={() => onFiltroCategoria(null)}
                  className={['product-facet-sidebar__all', todasSelecionado ? 'product-facet-sidebar__all--active' : ''].filter(Boolean).join(' ')}
                >
                  {todasSelecionado ? (
                    <Check size={12} className="product-facet-sidebar__all-check" aria-hidden strokeWidth={2.5} />
                  ) : (
                    <span className="product-facet-sidebar__all-spacer" aria-hidden />
                  )}
                  {t('modules.productsAdmin.facetAllCategories')}
                </button>
              </li>

              {arvore.map((raiz) => (
                <CategoriaTreeNodeItem
                  key={raiz.id}
                  node={raiz}
                  selectedId={filtros.categoriaId}
                  onSelect={handleSelectCategoria}
                  nivel={0}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="product-facet-sidebar__section-divider">
          <div className="product-facet-sidebar__section-head">
            <Globe size={10} className="shrink-0 text-[#4A5568]" aria-hidden />
            <span className="product-facet-sidebar__section-label">{t('modules.productsAdmin.facetOrigin')}</span>
          </div>

          <ul className="product-facet-origin__list">
            {opcoesOrigem.map((opt) => {
              const ativo = filtros.origem === opt.value;
              return (
                <li key={opt.value ?? 'all'}>
                  <button
                    type="button"
                    onClick={() => onFiltroOrigem(opt.value)}
                    className={['product-facet-origin__btn', ativo ? 'product-facet-origin__btn--active' : ''].filter(Boolean).join(' ')}
                  >
                    <span className="product-facet-origin__dot" aria-hidden />
                    {t(opt.labelKey)}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </aside>
  );
}
