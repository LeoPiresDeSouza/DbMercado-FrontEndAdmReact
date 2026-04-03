import React from 'react';
import { ChevronRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProdutoFiltrosAtivos } from '../types/categoriaTypes';
import './productFacetNav.css';

interface Props {
  filtros: ProdutoFiltrosAtivos;
  onRemoverCategoria: () => void;
  onRemoverOrigem: () => void;
  onLimparTodos: () => void;
}

export function FiltrosAtivosChips({
  filtros,
  onRemoverCategoria,
  onRemoverOrigem,
  onLimparTodos,
}: Props): React.ReactElement | null {
  const { t } = useTranslation('common');
  const temFiltros = filtros.categoriaId !== null || filtros.origem !== null;

  if (!temFiltros) {
    return null;
  }

  const segmentosCategoria =
    filtros.categoriaCaminho.length > 0 ? filtros.categoriaCaminho : [filtros.categoriaNome ?? ''];

  return (
    <div className="product-facet-chips">
      <span className="product-facet-chips__label">{t('modules.productsAdmin.activeFiltersLabel')}</span>

      {filtros.categoriaId !== null ? (
        <span className="product-facet-chips__chip product-facet-chips__chip--cat">
          <span className="product-facet-chips__path">
            {segmentosCategoria.filter(Boolean).map((segmento, i) => (
              <React.Fragment key={`${segmento}-${i}`}>
                {i > 0 ? (
                  <ChevronRight size={8} className="product-facet-chips__sep" aria-hidden strokeWidth={2.5} />
                ) : null}
                <span className="truncate">{segmento}</span>
              </React.Fragment>
            ))}
          </span>
          <button
            type="button"
            onClick={onRemoverCategoria}
            className="product-facet-chips__remove"
            aria-label={t('modules.productsAdmin.removeCategoryFilterAria')}
          >
            <X size={10} aria-hidden strokeWidth={2} />
          </button>
        </span>
      ) : null}

      {filtros.origem !== null ? (
        <span className="product-facet-chips__chip product-facet-chips__chip--origin">
          {filtros.origem === 'NACIONAL'
            ? t('modules.productsAdmin.facetOriginNational')
            : t('modules.productsAdmin.facetOriginImported')}
          <button
            type="button"
            onClick={onRemoverOrigem}
            className="product-facet-chips__remove"
            aria-label={t('modules.productsAdmin.removeOriginFilterAria')}
          >
            <X size={10} aria-hidden strokeWidth={2} />
          </button>
        </span>
      ) : null}

      <span className="product-facet-chips__divider" aria-hidden>
        |
      </span>
      <button type="button" onClick={onLimparTodos} className="product-facet-chips__clear">
        {t('modules.productsAdmin.clearAllFilters')}
      </button>
    </div>
  );
}
