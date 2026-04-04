import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategoriaArvore, resolverCaminho } from '../hooks/useCategoriaArvore';
import type { CategoriaTreeNode } from '../types/categoriaTypes';

type Props = {
  value: number | null;
  onChange: (id: number | null) => void;
  erro?: string;
  disabled?: boolean;
};

/**
 * Percorre a árvore e retorna a lista de IDs do caminho raiz → nó alvo.
 * Ex.: para o nó "Cola" (L4) retorna [idAlimentos, idBebidas, idRefrigerantes, idCola].
 */
function resolverIdsCaminho(arvore: CategoriaTreeNode[], id: number): number[] {
  const resultado: number[] = [];

  function buscar(nos: CategoriaTreeNode[]): boolean {
    for (const no of nos) {
      if (no.id === id) {
        resultado.push(no.id);
        return true;
      }
      if (buscar(no.subcategorias)) {
        resultado.unshift(no.id);
        return true;
      }
    }
    return false;
  }

  buscar(arvore);
  return resultado;
}

/** Encontra um nó pelo ID na árvore (busca em profundidade). */
function encontrarNo(
  arvore: CategoriaTreeNode[],
  id: number | null,
): CategoriaTreeNode | null {
  if (id === null) return null;
  for (const no of arvore) {
    if (no.id === id) return no;
    const encontrado = encontrarNo(no.subcategorias, id);
    if (encontrado) return encontrado;
  }
  return null;
}

export function CategoriaCascadeSelect({
  value,
  onChange,
  erro,
  disabled,
}: Props): React.ReactElement {
  const { t } = useTranslation('common');
  const { data: arvore = [], isLoading } = useCategoriaArvore();

  /** IDs selecionados em cada nível, derivados de `value` + `arvore`. */
  const sels = useMemo<[number | null, number | null, number | null, number | null]>(() => {
    if (value === null) return [null, null, null, null];
    const path = resolverIdsCaminho(arvore, value);
    return [path[0] ?? null, path[1] ?? null, path[2] ?? null, path[3] ?? null];
  }, [arvore, value]);

  /** Caminho de nomes da raiz até a seleção atual (para exibição). */
  const caminho = useMemo<string[]>(() => {
    if (value === null) return [];
    return resolverCaminho(arvore, value);
  }, [arvore, value]);

  const noL1 = encontrarNo(arvore, sels[0]);
  const noL2 = encontrarNo(arvore, sels[1]);
  const noL3 = encontrarNo(arvore, sels[2]);

  const opcoesL2 = noL1?.subcategorias ?? [];
  const opcoesL3 = noL2?.subcategorias ?? [];
  const opcoesL4 = noL3?.subcategorias ?? [];

  const selectClass = [
    'h-10 w-full rounded-md border px-3 py-2 text-sm text-white shadow-sm',
    'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-60',
    erro
      ? 'border-[#DC3545] bg-[#141B2D] focus:border-[#DC3545] focus:ring-[rgba(220,53,69,0.3)]'
      : 'border-[#2D3748] bg-[#141B2D] focus:border-[#0D6EFD] focus:ring-[rgba(13,110,253,0.45)]',
  ].join(' ');

  const labelClass = 'mb-1.5 block text-sm font-medium leading-snug text-[#ADB5BD]';
  const fieldCol = 'flex min-w-0 flex-col';

  /**
   * Ao mudar o nível N:
   * - valor vazio → reverter para o ID do nível pai (ou null para L1)
   * - valor preenchido → propagar o novo ID diretamente ao formulário
   */
  const handleChange = (nivel: 0 | 1 | 2 | 3, idStr: string) => {
    if (!idStr) {
      onChange(nivel === 0 ? null : (sels[nivel - 1] as number));
    } else {
      onChange(Number(idStr));
    }
  };

  const placeholderL1 = isLoading
    ? t('modules.productsAdmin.categoriaCarregando')
    : t('modules.productsAdmin.categoriaSelecionePlaceholder');

  const placeholderSub = t('modules.productsAdmin.categoriaSelecionePlaceholder');

  return (
    <div className="flex flex-col gap-6">
      {/* Caminho atual (breadcrumb textual) */}
      {caminho.length > 0 && (
        <p className="text-xs text-[#718096]" aria-live="polite">
          {caminho.join(' › ')}
        </p>
      )}

      {/* Nível 1 */}
      <div className={fieldCol}>
        <label htmlFor="pf-cat-l1" className={labelClass}>
          {t('modules.productsAdmin.fieldCategoriaL1')}
        </label>
        <select
          id="pf-cat-l1"
          className={selectClass}
          value={sels[0] !== null ? String(sels[0]) : ''}
          disabled={disabled || isLoading}
          onChange={(e) => handleChange(0, e.target.value)}
        >
          <option value="">{placeholderL1}</option>
          {arvore.map((no) => (
            <option key={no.id} value={String(no.id)}>
              {no.nome}
            </option>
          ))}
        </select>
        {erro && (
          <p className="mt-1.5 min-h-[1.1rem] text-xs text-[#DC3545]">{erro}</p>
        )}
      </div>

      {/* Nível 2: aparece se L1 selecionado e tem filhos */}
      {sels[0] !== null && opcoesL2.length > 0 && (
        <div className={fieldCol}>
          <label htmlFor="pf-cat-l2" className={labelClass}>
            {t('modules.productsAdmin.fieldCategoriaSubcategoria')}
          </label>
          <select
            id="pf-cat-l2"
            className={selectClass.replace('border-[#DC3545]', 'border-[#2D3748]').replace(
              'focus:border-[#DC3545] focus:ring-[rgba(220,53,69,0.3)]',
              'focus:border-[#0D6EFD] focus:ring-[rgba(13,110,253,0.45)]',
            )}
            value={sels[1] !== null ? String(sels[1]) : ''}
            disabled={disabled}
            onChange={(e) => handleChange(1, e.target.value)}
          >
            <option value="">{placeholderSub}</option>
            {opcoesL2.map((no) => (
              <option key={no.id} value={String(no.id)}>
                {no.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Nível 3: aparece se L2 selecionado e tem filhos */}
      {sels[1] !== null && opcoesL3.length > 0 && (
        <div className={fieldCol}>
          <label htmlFor="pf-cat-l3" className={labelClass}>
            {t('modules.productsAdmin.fieldCategoriaSubcategoria')}
          </label>
          <select
            id="pf-cat-l3"
            className={selectClass.replace('border-[#DC3545]', 'border-[#2D3748]').replace(
              'focus:border-[#DC3545] focus:ring-[rgba(220,53,69,0.3)]',
              'focus:border-[#0D6EFD] focus:ring-[rgba(13,110,253,0.45)]',
            )}
            value={sels[2] !== null ? String(sels[2]) : ''}
            disabled={disabled}
            onChange={(e) => handleChange(2, e.target.value)}
          >
            <option value="">{placeholderSub}</option>
            {opcoesL3.map((no) => (
              <option key={no.id} value={String(no.id)}>
                {no.nome}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Nível 4: aparece se L3 selecionado e tem filhos */}
      {sels[2] !== null && opcoesL4.length > 0 && (
        <div className={fieldCol}>
          <label htmlFor="pf-cat-l4" className={labelClass}>
            {t('modules.productsAdmin.fieldCategoriaSubcategoria')}
          </label>
          <select
            id="pf-cat-l4"
            className={selectClass.replace('border-[#DC3545]', 'border-[#2D3748]').replace(
              'focus:border-[#DC3545] focus:ring-[rgba(220,53,69,0.3)]',
              'focus:border-[#0D6EFD] focus:ring-[rgba(13,110,253,0.45)]',
            )}
            value={sels[3] !== null ? String(sels[3]) : ''}
            disabled={disabled}
            onChange={(e) => handleChange(3, e.target.value)}
          >
            <option value="">{placeholderSub}</option>
            {opcoesL4.map((no) => (
              <option key={no.id} value={String(no.id)}>
                {no.nome}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
