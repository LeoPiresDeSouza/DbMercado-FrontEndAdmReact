/** Valores de `nomeNormalizado` no backend que liberam o menu/tela de produtos (comparação sem diferenciar maiúsculas). */
export const NOMES_MODULO_PRODUTO = ['PRODUTO', 'PRODUTOS', 'PRODUCT', 'PRODUCTS'] as const;

export function usuarioTemModuloProduto(
  modulos: Array<{ nomeNormalizado: string }> | null
): boolean {
  if (modulos === null) {
    return false;
  }
  const chaves = new Set(NOMES_MODULO_PRODUTO.map((n) => n.toUpperCase()));
  return modulos.some((m) => chaves.has(m.nomeNormalizado.trim().toUpperCase()));
}
