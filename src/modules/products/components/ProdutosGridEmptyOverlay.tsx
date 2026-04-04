import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';

/** Overlay “sem linhas” do catálogo (AG Grid `noRowsOverlayComponent`). */
export function ProdutosGridEmptyOverlay(): React.ReactElement {
  const { t } = useTranslation('common');
  return (
    <div className="produtos-grid-empty-overlay flex max-h-none flex-col items-center justify-center px-4 py-10 text-center">
      <Package size={48} className="mb-4 text-[#2D3748]" aria-hidden />
      <p className="text-base font-medium text-[#ADB5BD]">{t('modules.productsAdmin.emptyStateTitle')}</p>
      <p className="mt-1 max-w-md text-sm text-[#718096]">{t('modules.productsAdmin.emptyStateHint')}</p>
      <Link
        to="/admin/produtos/novo"
        className="relative z-10 mt-6 inline-flex cursor-pointer items-center gap-2 rounded-md bg-[#0D6EFD] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0B5ED7] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[rgba(13,110,253,0.45)]"
      >
        <Plus size={16} aria-hidden />
        {t('modules.productsAdmin.toolbarNewProduct')}
      </Link>
    </div>
  );
}
