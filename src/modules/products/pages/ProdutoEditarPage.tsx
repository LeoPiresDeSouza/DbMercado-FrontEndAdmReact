import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usuarioTemModuloProduto } from '../../../shared/constants/produtoModulo';
import { useModulosUsuarioStore } from '../../../shared/stores/modulosUsuarioStore';
import { useNotificationCenterStore } from '../../../shared/stores/notificationCenterStore';
import { resolveLocalizedErrorMessage } from '../../../shared/utils/resolveLocalizedErrorMessage';
import ProdutoForm from '../components/ProdutoForm';
import { atualizarProduto, obterProdutoPorId } from '../services/produtoService';
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
        <p className="text-sm text-neutral-600">{t('modules.productsAdmin.loadingModules')}</p>
      </div>
    );
  }

  if (!podeVer) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6">
        <p className="text-sm text-neutral-600">{t('modules.productsAdmin.noAccess')}</p>
      </div>
    );
  }

  if (!idValid) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6">
        <p className="text-sm text-neutral-600">{t('modules.productsAdmin.invalidId')}</p>
        <Link to="/admin/produtos" className="text-sm font-medium text-sky-700 hover:underline">
          {t('modules.productsAdmin.backToList')}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6">
        <p className="text-sm text-neutral-600">{t('modules.productsAdmin.loadingProduct')}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6">
        <p className="max-w-md text-center text-sm text-red-700">{loadError}</p>
        <Link to="/admin/produtos" className="text-sm font-medium text-sky-700 hover:underline">
          {t('modules.productsAdmin.backToList')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/admin/produtos"
              className="mb-2 inline-block text-sm font-medium text-sky-700 hover:text-sky-900 hover:underline"
            >
              ← {t('modules.productsAdmin.backToList')}
            </Link>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 md:text-2xl">
              {t('modules.productsAdmin.formTitleEdit', { id })}
            </h1>
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
          <ProdutoForm values={values} onChange={patch} errors={errors} disabled={submitting} />

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-neutral-200 pt-8 sm:flex-row sm:justify-end">
            <Link
              to="/admin/produtos"
              className="inline-flex items-center justify-center rounded-md border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
            >
              {t('modules.productsAdmin.cancel')}
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-md bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? t('modules.productsAdmin.saving') : t('modules.productsAdmin.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProdutoEditarPage;
