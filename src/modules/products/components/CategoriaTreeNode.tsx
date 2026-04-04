import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CategoriaTreeNode as TNode } from '../types/categoriaTypes';
import '../../../shared/styles/productFacetNav.css';

const depthClass = (nivel: number): string => {
  const i = Math.min(Math.max(nivel, 0), 3);
  return ['product-facet-tree-item__btn--d1', 'product-facet-tree-item__btn--d2', 'product-facet-tree-item__btn--d3', 'product-facet-tree-item__btn--d4'][i];
};

interface Props {
  node: TNode;
  selectedId: number | null;
  onSelect: (node: TNode) => void;
  nivel?: number;
}

export function CategoriaTreeNodeItem({
  node,
  selectedId,
  onSelect,
  nivel = 0,
}: Props): React.ReactElement {
  const [expandido, setExpandido] = useState(nivel < 1);
  const temFilhas = node.subcategorias.length > 0;
  const selecionado = selectedId === node.id;

  const handleClick = (): void => {
    onSelect(node);
    if (temFilhas) {
      setExpandido((v) => !v);
    }
  };

  const depth = depthClass(nivel);

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        className={[
          'product-facet-tree-item__btn',
          depth,
          selecionado ? 'product-facet-tree-item__btn--selected' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className="product-facet-tree-item__chevron-slot">
          {temFilhas ? (
            expandido ? (
              <ChevronDown size={10} className="product-facet-tree-item__chevron" aria-hidden />
            ) : (
              <ChevronRight size={10} className="product-facet-tree-item__chevron" aria-hidden />
            )
          ) : (
            <span className="product-facet-tree-item__dot" aria-hidden />
          )}
        </span>

        <span className="product-facet-tree-item__label">{node.nome}</span>
      </button>

      {temFilhas && expandido ? (
        <ul className="product-facet-tree">
          {node.subcategorias.map((filha) => (
            <CategoriaTreeNodeItem
              key={filha.id}
              node={filha}
              selectedId={selectedId}
              onSelect={onSelect}
              nivel={nivel + 1}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
