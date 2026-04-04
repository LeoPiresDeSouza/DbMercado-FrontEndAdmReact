import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderTree, Key, Maximize2, Package, Plus, Ruler, Tag } from 'lucide-react';
import type { ProdutoFormOpcoesCatalogo, ProdutoUnidadeMedidaOpcao } from '../services/produtoService';
import type { ProdutoFormValues } from '../types/produtoFormValues';
import { ProductMediaStudio } from '../media/components/ProductMediaStudio';
import { CategoriaCascadeSelect } from './CategoriaCascadeSelect';

const inputBase =
  'h-10 w-full rounded-md border px-3 py-2 text-sm text-white shadow-sm transition-colors placeholder:text-[#718096] focus:outline-none focus:ring-2 focus:ring-offset-0';
const inputNormal = `${inputBase} border-[#2D3748] bg-[#141B2D] focus:border-[#0D6EFD] focus:ring-[rgba(13,110,253,0.45)]`;
const inputError = `${inputBase} border-[#DC3545] bg-[#141B2D] focus:border-[#DC3545] focus:ring-[rgba(220,53,69,0.3)]`;

/** Label acima do campo: mesma tipografia e espaçamento em todo o formulário. */
const labelClass = 'mb-1.5 block text-sm font-medium leading-snug text-[#ADB5BD]';

/** Coluna de campo: evita overflow e mantém label + controle alinhados. */
const fieldCol = 'flex min-w-0 flex-col';

const sectionFieldset =
  'min-w-0 rounded-xl border border-[#2D3748] bg-[#141B2D] p-6 shadow-sm md:p-8';

/**
 * O `<legend>` visível fica colado à borda do `<fieldset>` na maioria dos browsers (ignora padding-top).
 * Mantemos um legend só para acessibilidade e o título real é um bloco dentro do padding do fieldset.
 */
/** Teste visual: título + ícone em laranja (fundo escuro). */
const sectionHeadingClass =
  'flex w-full items-center gap-2 border-b border-orange-500/25 pb-4 text-xs font-semibold uppercase tracking-widest text-orange-400';

/** Espaço entre o título da secção e o primeiro campo. */
const sectionBodyStack = 'mt-8 flex flex-col gap-6';

const subgroupTitleClass = 'mb-5 text-xs font-medium uppercase tracking-wide text-[#718096]';

function SectionLegend({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <>
      <legend className="sr-only">{children}</legend>
      <div className={sectionHeadingClass} aria-hidden="true">
        <Icon size={16} className="shrink-0" />
        <span>{children}</span>
      </div>
    </>
  );
}

function opcoesSelectComValorAtual(
  opcoes: ProdutoUnidadeMedidaOpcao[],
  valorAtual: string
): ProdutoUnidadeMedidaOpcao[] {
  const codigos = new Set(opcoes.map((o) => o.codigo));
  const atual = valorAtual.trim();
  const extra: ProdutoUnidadeMedidaOpcao[] =
    atual && !codigos.has(atual) ? [{ codigo: atual, rotulo: atual }] : [];
  return [...extra, ...opcoes];
}

/** Evita "0 — 0 — …" quando o valor do parâmetro já vem como "0 — descrição" (em dash, en-dash ou hífen). */
function rotuloExibicaoOpcaoCatalogo(codigo: string, rotulo: string): string {
  const c = codigo.trim();
  const r = rotulo.trim();
  if (!r || r === c) {
    return c;
  }
  const esc = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (new RegExp(`^${esc}\\s*[\\u2014\\u2013\\-]\\s*`).test(r)) {
    return r;
  }
  return `${c} — ${r}`;
}

export type ProdutoFormProps = {
  values: ProdutoFormValues;
  onChange: (patch: Partial<ProdutoFormValues>) => void;
  errors: Record<string, string>;
  disabled?: boolean;
  opcoesCatalogo: ProdutoFormOpcoesCatalogo;
  opcoesCatalogoCarregando?: boolean;
  /** Opções vindas de `dbParametro` (produto / origemGeografica). */
  origensGeograficasOpcoes: ProdutoUnidadeMedidaOpcao[];
  origensGeograficasCarregando?: boolean;
  /** Opções vindas de `dbParametro` (produto / origemIcms). */
  origensIcmsOpcoes: ProdutoUnidadeMedidaOpcao[];
  origensIcmsCarregando?: boolean;
  /** Identificador do produto em edição; omitir ou `null` no cadastro novo (estúdio de mídia). */
  produtoId?: number | null;
};

function FieldError({ message }: { message?: string }): React.ReactElement | null {
  if (!message) {
    return null;
  }
  return <p className="mt-1.5 min-h-[1.1rem] text-xs text-[#DC3545]">{message}</p>;
}

/** `fieldset:disabled` reduz opacidade no browser; mantém legível no DS escuro. */
function cnFieldset(base: string): string {
  return `${base} disabled:opacity-60`;
}

function ProdutoForm(props: ProdutoFormProps): React.ReactElement {
  const {
    values,
    onChange,
    errors,
    disabled,
    opcoesCatalogo,
    opcoesCatalogoCarregando,
    origensGeograficasOpcoes,
    origensGeograficasCarregando,
    origensIcmsOpcoes,
    origensIcmsCarregando,
    produtoId = null,
  } = props;
  const { t } = useTranslation('common');
  const p = (name: keyof ProdutoFormValues) => (errors[name as string] ? inputError : inputNormal);

  const opcoesCom = useMemo(
    () => opcoesSelectComValorAtual(opcoesCatalogo.comercializacao, values.unidadeComercializacao),
    [opcoesCatalogo.comercializacao, values.unidadeComercializacao]
  );
  const opcoesFis = useMemo(
    () => opcoesSelectComValorAtual(opcoesCatalogo.medidaFisica, values.unidadeMedidaFisica),
    [opcoesCatalogo.medidaFisica, values.unidadeMedidaFisica]
  );
  const opcoesEmbTipo = useMemo(
    () => opcoesSelectComValorAtual(opcoesCatalogo.tipoEmbalagem, values.tipoEmbalagem),
    [opcoesCatalogo.tipoEmbalagem, values.tipoEmbalagem]
  );
  const opcoesDim = useMemo(() => opcoesCatalogo.dimensao, [opcoesCatalogo.dimensao]);
  const opcoesPeso = useMemo(() => opcoesCatalogo.peso, [opcoesCatalogo.peso]);
  const opcoesDimEmb = useMemo(
    () => opcoesSelectComValorAtual(opcoesDim, values.unidadeDimensaoEmb),
    [opcoesDim, values.unidadeDimensaoEmb]
  );
  const opcoesPesoEmbSel = useMemo(
    () => opcoesSelectComValorAtual(opcoesPeso, values.unidadePesoEmb),
    [opcoesPeso, values.unidadePesoEmb]
  );
  const opcoesDimP = useMemo(
    () => opcoesSelectComValorAtual(opcoesDim, values.unidadeDimensaoP),
    [opcoesDim, values.unidadeDimensaoP]
  );
  const opcoesPesoProdSel = useMemo(
    () => opcoesSelectComValorAtual(opcoesPeso, values.unidadePesoP),
    [opcoesPeso, values.unidadePesoP]
  );
  const opcoesOrigemIcms = useMemo(
    () => opcoesSelectComValorAtual(origensIcmsOpcoes, values.origemIcms),
    [origensIcmsOpcoes, values.origemIcms]
  );

  const setSku = (index: number, patch: Partial<{ codigo: string; ativo: boolean }>) => {
    const next = values.skus.map((s, i) => (i === index ? { ...s, ...patch } : s));
    onChange({ skus: next });
  };

  const addSku = () => {
    onChange({ skus: [...values.skus, { codigo: '', ativo: true }] });
  };

  const removeSku = (index: number) => {
    if (values.skus.length <= 1) {
      return;
    }
    onChange({ skus: values.skus.filter((_, i) => i !== index) });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Identificação: texto completo + bloco único de atributos comerciais */}
      <fieldset disabled={disabled} className={cnFieldset(sectionFieldset)}>
        <SectionLegend icon={Package}>{t('modules.productsAdmin.sectionIdentificacao')}</SectionLegend>

        <div className={sectionBodyStack}>
          <div className={fieldCol}>
            <label htmlFor="pf-nome" className={labelClass}>
              {t('modules.productsAdmin.fieldNome')}
            </label>
            <input
              id="pf-nome"
              type="text"
              autoComplete="off"
              className={p('nome')}
              value={values.nome}
              onChange={(e) => onChange({ nome: e.target.value })}
            />
            <FieldError message={errors.nome} />
          </div>

          <div className={fieldCol}>
            <label htmlFor="pf-desc" className={labelClass}>
              {t('modules.productsAdmin.fieldDescricao')}
            </label>
            <textarea
              id="pf-desc"
              rows={4}
              className={`${p('descricao')} min-h-[6rem] resize-y`}
              value={values.descricao}
              onChange={(e) => onChange({ descricao: e.target.value })}
            />
            <FieldError message={errors.descricao} />
          </div>

          <div className="border-t border-[#1E293B] pt-8">
            <p className={subgroupTitleClass}>{t('modules.productsAdmin.subgroupComercial')}</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className={fieldCol}>
                <label htmlFor="pf-marca" className={labelClass}>
                  {t('modules.productsAdmin.fieldMarca')}
                </label>
                <input
                  id="pf-marca"
                  type="text"
                  autoComplete="off"
                  className={p('marca')}
                  value={values.marca}
                  onChange={(e) => onChange({ marca: e.target.value })}
                />
                <FieldError message={errors.marca} />
              </div>
              <div className={fieldCol}>
                <label htmlFor="pf-modelo" className={labelClass}>
                  {t('modules.productsAdmin.fieldModelo')}
                </label>
                <input
                  id="pf-modelo"
                  type="text"
                  autoComplete="off"
                  className={p('modelo')}
                  value={values.modelo}
                  onChange={(e) => onChange({ modelo: e.target.value })}
                />
                <FieldError message={errors.modelo} />
              </div>
              <div className={fieldCol}>
                <label htmlFor="pf-gtin" className={labelClass}>
                  {t('modules.productsAdmin.fieldGtin')}
                </label>
                <input
                  id="pf-gtin"
                  type="text"
                  autoComplete="off"
                  className={p('gtin')}
                  value={values.gtin}
                  onChange={(e) => onChange({ gtin: e.target.value })}
                />
                <FieldError message={errors.gtin} />
              </div>
              <div className={fieldCol}>
                <label htmlFor="pf-uc" className={labelClass}>
                  {t('modules.productsAdmin.fieldUnidadeComercializacao')}
                </label>
                <select
                  id="pf-uc"
                  className={p('unidadeComercializacao')}
                  value={values.unidadeComercializacao}
                  disabled={disabled || opcoesCatalogoCarregando}
                  onChange={(e) => onChange({ unidadeComercializacao: e.target.value })}
                >
                  {opcoesCom.map((o) => (
                    <option key={o.codigo} value={o.codigo}>
                      {rotuloExibicaoOpcaoCatalogo(o.codigo, o.rotulo)}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.unidadeComercializacao} />
              </div>
              <div className={fieldCol}>
                <label htmlFor="pf-uf" className={labelClass}>
                  {t('modules.productsAdmin.fieldUnidadeMedidaFisica')}
                </label>
                <select
                  id="pf-uf"
                  className={p('unidadeMedidaFisica')}
                  value={values.unidadeMedidaFisica}
                  disabled={disabled || opcoesCatalogoCarregando}
                  onChange={(e) => onChange({ unidadeMedidaFisica: e.target.value })}
                >
                  {opcoesFis.map((o) => (
                    <option key={o.codigo} value={o.codigo}>
                      {rotuloExibicaoOpcaoCatalogo(o.codigo, o.rotulo)}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.unidadeMedidaFisica} />
              </div>
              <div className={fieldCol}>
                <label htmlFor="pf-te" className={labelClass}>
                  {t('modules.productsAdmin.fieldTipoEmbalagem')}
                </label>
                <select
                  id="pf-te"
                  className={p('tipoEmbalagem')}
                  value={values.tipoEmbalagem}
                  disabled={disabled || opcoesCatalogoCarregando}
                  onChange={(e) => onChange({ tipoEmbalagem: e.target.value })}
                >
                  {opcoesEmbTipo.map((o) => (
                    <option key={o.codigo} value={o.codigo}>
                      {rotuloExibicaoOpcaoCatalogo(o.codigo, o.rotulo)}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.tipoEmbalagem} />
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Categorização */}
      <fieldset disabled={disabled} className={cnFieldset(sectionFieldset)}>
        <SectionLegend icon={FolderTree}>
          {t('modules.productsAdmin.sectionCategorizacao')}
        </SectionLegend>
        <div className={sectionBodyStack}>
          <CategoriaCascadeSelect
            value={values.categoriaProdutoId}
            onChange={(id) => onChange({ categoriaProdutoId: id })}
            erro={errors.categoriaProdutoId}
            disabled={disabled}
          />
        </div>
      </fieldset>

      {/* Fiscal: origem geográfica + bloco de códigos fiscais na mesma linha em desktop */}
      <fieldset disabled={disabled} className={cnFieldset(sectionFieldset)}>
        <SectionLegend icon={Tag}>{t('modules.productsAdmin.sectionFiscalOrigem')}</SectionLegend>

        <div className={sectionBodyStack}>
          <div>
            <p className={subgroupTitleClass}>{t('modules.productsAdmin.subgroupOrigemGeografica')}</p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className={fieldCol}>
                <label htmlFor="pf-origem" className={labelClass}>
                  {t('modules.productsAdmin.fieldOrigemTipo')}
                </label>
                <select
                  id="pf-origem"
                  className={p('origemTipo')}
                  value={values.origemTipo}
                  disabled={disabled || origensGeograficasCarregando}
                  onChange={(e) => onChange({ origemTipo: e.target.value })}
                >
                  {origensGeograficasOpcoes.map((o) => (
                    <option key={o.codigo} value={o.codigo}>
                      {o.rotulo}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.origemTipo} />
              </div>
              <div className={fieldCol}>
                <label htmlFor="pf-pais" className={labelClass}>
                  {t('modules.productsAdmin.fieldPaisOrigem')}
                </label>
                <input
                  id="pf-pais"
                  type="text"
                  autoComplete="off"
                  className={p('paisOrigem')}
                  value={values.paisOrigem}
                  onChange={(e) => onChange({ paisOrigem: e.target.value })}
                />
                <FieldError message={errors.paisOrigem} />
              </div>
            </div>
          </div>

          <div className="border-t border-[#1E293B] pt-8">
            <p className={subgroupTitleClass}>{t('modules.productsAdmin.subgroupFiscal')}</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className={fieldCol}>
                <label htmlFor="pf-ncm" className={labelClass}>
                  {t('modules.productsAdmin.fieldNcm')}
                </label>
                <input
                  id="pf-ncm"
                  type="text"
                  autoComplete="off"
                  className={p('ncm')}
                  value={values.ncm}
                  onChange={(e) => onChange({ ncm: e.target.value })}
                />
                <FieldError message={errors.ncm} />
              </div>
              <div className={fieldCol}>
                <label htmlFor="pf-cest" className={labelClass}>
                  {t('modules.productsAdmin.fieldCest')}
                </label>
                <input
                  id="pf-cest"
                  type="text"
                  autoComplete="off"
                  className={p('cest')}
                  value={values.cest}
                  onChange={(e) => onChange({ cest: e.target.value })}
                />
                <FieldError message={errors.cest} />
              </div>
              <div className={fieldCol}>
                <label htmlFor="pf-icms" className={labelClass}>
                  {t('modules.productsAdmin.fieldOrigemIcms')}
                </label>
                <select
                  id="pf-icms"
                  className={p('origemIcms')}
                  value={values.origemIcms}
                  disabled={disabled || origensIcmsCarregando}
                  onChange={(e) => onChange({ origemIcms: e.target.value })}
                >
                  {opcoesOrigemIcms.map((o) => (
                    <option key={o.codigo} value={o.codigo}>
                      {rotuloExibicaoOpcaoCatalogo(o.codigo, o.rotulo)}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.origemIcms} />
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Embalagem: quatro medidas sempre na mesma grade em desktop */}
      <fieldset disabled={disabled} className={cnFieldset(sectionFieldset)}>
        <SectionLegend icon={Ruler}>{t('modules.productsAdmin.sectionEmbalagem')}</SectionLegend>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className={fieldCol}>
            <label htmlFor="pf-ea" className={labelClass}>
              {t('modules.productsAdmin.fieldEmbAltura')}
            </label>
            <input
              id="pf-ea"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              className={p('alturaEmb')}
              value={values.alturaEmb}
              onChange={(e) => onChange({ alturaEmb: e.target.value })}
            />
            <FieldError message={errors.alturaEmb} />
          </div>
          <div className={fieldCol}>
            <label htmlFor="pf-el" className={labelClass}>
              {t('modules.productsAdmin.fieldEmbLargura')}
            </label>
            <input
              id="pf-el"
              type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  className={p('larguraEmb')}
              value={values.larguraEmb}
              onChange={(e) => onChange({ larguraEmb: e.target.value })}
            />
            <FieldError message={errors.larguraEmb} />
          </div>
          <div className={fieldCol}>
            <label htmlFor="pf-ec" className={labelClass}>
              {t('modules.productsAdmin.fieldEmbComprimento')}
            </label>
            <input
              id="pf-ec"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              className={p('comprimentoEmb')}
              value={values.comprimentoEmb}
              onChange={(e) => onChange({ comprimentoEmb: e.target.value })}
            />
            <FieldError message={errors.comprimentoEmb} />
          </div>
          <div className={fieldCol}>
            <label htmlFor="pf-ep" className={labelClass}>
              {t('modules.productsAdmin.fieldEmbPeso')}
            </label>
            <input
              id="pf-ep"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              className={p('pesoEmb')}
              value={values.pesoEmb}
              onChange={(e) => onChange({ pesoEmb: e.target.value })}
            />
            <FieldError message={errors.pesoEmb} />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className={fieldCol}>
            <label htmlFor="pf-ued" className={labelClass}>
              {t('modules.productsAdmin.fieldUnidadeDimensaoEmb')}
            </label>
            <select
              id="pf-ued"
              className={p('unidadeDimensaoEmb')}
              value={values.unidadeDimensaoEmb}
              disabled={disabled || opcoesCatalogoCarregando}
              onChange={(e) => onChange({ unidadeDimensaoEmb: e.target.value })}
            >
              {opcoesDimEmb.map((o) => (
                <option key={o.codigo} value={o.codigo}>
                  {rotuloExibicaoOpcaoCatalogo(o.codigo, o.rotulo)}
                </option>
              ))}
            </select>
            <FieldError message={errors.unidadeDimensaoEmb} />
          </div>
          <div className={fieldCol}>
            <label htmlFor="pf-uep" className={labelClass}>
              {t('modules.productsAdmin.fieldUnidadePesoEmb')}
            </label>
            <select
              id="pf-uep"
              className={p('unidadePesoEmb')}
              value={values.unidadePesoEmb}
              disabled={disabled || opcoesCatalogoCarregando}
              onChange={(e) => onChange({ unidadePesoEmb: e.target.value })}
            >
              {opcoesPesoEmbSel.map((o) => (
                <option key={o.codigo} value={o.codigo}>
                  {rotuloExibicaoOpcaoCatalogo(o.codigo, o.rotulo)}
                </option>
              ))}
            </select>
            <FieldError message={errors.unidadePesoEmb} />
          </div>
        </div>
      </fieldset>

      {/* Dimensão do produto */}
      <fieldset disabled={disabled} className={cnFieldset(sectionFieldset)}>
        <SectionLegend icon={Maximize2}>{t('modules.productsAdmin.sectionDimensaoProduto')}</SectionLegend>

        <div className={sectionBodyStack}>
          <div
            className={`flex flex-wrap items-center gap-3 rounded-md border border-[#2D3748] bg-[#0F1419] px-4 py-3`}
          >
            <input
              id="pf-dim-toggle"
              type="checkbox"
              className="h-4 w-4 shrink-0 rounded border-[#2D3748] bg-[#141B2D] text-[#0D6EFD] focus:ring-2 focus:ring-[rgba(13,110,253,0.45)] focus:ring-offset-0 focus:ring-offset-transparent"
              checked={values.incluirDimProduto}
              onChange={(e) => onChange({ incluirDimProduto: e.target.checked })}
            />
            <label htmlFor="pf-dim-toggle" className={`${labelClass} mb-0 cursor-pointer`}>
              {t('modules.productsAdmin.fieldDimProdutoToggle')}
            </label>
          </div>

          {values.incluirDimProduto ? (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className={fieldCol}>
                  <label htmlFor="pf-da" className={labelClass}>
                    {t('modules.productsAdmin.fieldDimPAltura')}
                  </label>
                  <input
                    id="pf-da"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className={p('alturaP')}
                    value={values.alturaP}
                    onChange={(e) => onChange({ alturaP: e.target.value })}
                  />
                  <FieldError message={errors.alturaP} />
                </div>
                <div className={fieldCol}>
                  <label htmlFor="pf-dl" className={labelClass}>
                    {t('modules.productsAdmin.fieldDimPLargura')}
                  </label>
                  <input
                    id="pf-dl"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className={p('larguraP')}
                    value={values.larguraP}
                    onChange={(e) => onChange({ larguraP: e.target.value })}
                  />
                  <FieldError message={errors.larguraP} />
                </div>
                <div className={fieldCol}>
                  <label htmlFor="pf-dc" className={labelClass}>
                    {t('modules.productsAdmin.fieldDimPComprimento')}
                  </label>
                  <input
                    id="pf-dc"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className={p('comprimentoP')}
                    value={values.comprimentoP}
                    onChange={(e) => onChange({ comprimentoP: e.target.value })}
                  />
                  <FieldError message={errors.comprimentoP} />
                </div>
                <div className={fieldCol}>
                  <label htmlFor="pf-dp" className={labelClass}>
                    {t('modules.productsAdmin.fieldDimPPeso')}
                  </label>
                  <input
                    id="pf-dp"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    className={p('pesoP')}
                    value={values.pesoP}
                    onChange={(e) => onChange({ pesoP: e.target.value })}
                  />
                  <FieldError message={errors.pesoP} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className={fieldCol}>
                  <label htmlFor="pf-udp" className={labelClass}>
                    {t('modules.productsAdmin.fieldUnidadeDimensaoProd')}
                  </label>
                  <select
                    id="pf-udp"
                    className={p('unidadeDimensaoP')}
                    value={values.unidadeDimensaoP}
                    disabled={disabled || opcoesCatalogoCarregando}
                    onChange={(e) => onChange({ unidadeDimensaoP: e.target.value })}
                  >
                    {opcoesDimP.map((o) => (
                      <option key={o.codigo} value={o.codigo}>
                        {rotuloExibicaoOpcaoCatalogo(o.codigo, o.rotulo)}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.unidadeDimensaoP} />
                </div>
                <div className={fieldCol}>
                  <label htmlFor="pf-upp" className={labelClass}>
                    {t('modules.productsAdmin.fieldUnidadePesoProd')}
                  </label>
                  <select
                    id="pf-upp"
                    className={p('unidadePesoP')}
                    value={values.unidadePesoP}
                    disabled={disabled || opcoesCatalogoCarregando}
                    onChange={(e) => onChange({ unidadePesoP: e.target.value })}
                  >
                    {opcoesPesoProdSel.map((o) => (
                      <option key={o.codigo} value={o.codigo}>
                        {rotuloExibicaoOpcaoCatalogo(o.codigo, o.rotulo)}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.unidadePesoP} />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </fieldset>

      {/* SKUs */}
      <fieldset disabled={disabled} className={cnFieldset(sectionFieldset)}>
        <SectionLegend icon={Key}>{t('modules.productsAdmin.sectionSkus')}</SectionLegend>

        <div className={sectionBodyStack}>
          <FieldError message={errors.skus} />

          <ul className="flex flex-col gap-6">
            {values.skus.map((s, i) => (
              <li
                key={i}
                className="rounded-lg border border-[#2D3748] bg-[#0F1419] p-5 shadow-sm"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-6">
                  <div className={`min-w-0 flex-1 ${fieldCol}`}>
                    <label htmlFor={`pf-sku-c-${i}`} className={labelClass}>
                      {t('modules.productsAdmin.fieldSkuCodigo')}
                    </label>
                    <input
                      id={`pf-sku-c-${i}`}
                      type="text"
                      autoComplete="off"
                      className={errors[`skuCodigo_${i}`] ? inputError : inputNormal}
                      value={s.codigo}
                      onChange={(e) => setSku(i, { codigo: e.target.value })}
                    />
                    <FieldError message={errors[`skuCodigo_${i}`]} />
                  </div>

                  <div className="flex shrink-0 flex-col md:w-52">
                    <span className="mb-1.5 min-h-[1.25rem]" aria-hidden />
                    <div className="flex h-10 items-center gap-2.5">
                      <input
                        id={`pf-sku-a-${i}`}
                        type="checkbox"
                        className="h-4 w-4 shrink-0 rounded border-[#2D3748] bg-[#141B2D] text-[#0D6EFD] focus:ring-2 focus:ring-[rgba(13,110,253,0.45)] focus:ring-offset-0"
                        checked={s.ativo}
                        onChange={(e) => setSku(i, { ativo: e.target.checked })}
                      />
                      <label
                        htmlFor={`pf-sku-a-${i}`}
                        className="cursor-pointer text-sm font-medium leading-snug text-[#ADB5BD]"
                      >
                        {t('modules.productsAdmin.fieldSkuAtivo')}
                      </label>
                    </div>
                    <span className="mt-1.5 min-h-[1.25rem]" aria-hidden />
                  </div>

                  <div className="flex shrink-0 flex-col md:w-auto">
                    <span className="mb-1.5 min-h-[1.25rem]" aria-hidden />
                    <div className="flex h-10 items-center">
                      <button
                        type="button"
                        className="w-full rounded-md border border-[#2D3748] bg-[#141B2D] px-4 py-2 text-sm font-medium text-[#ADB5BD] shadow-sm transition-all hover:border-[#4A5568] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                        onClick={() => removeSku(i)}
                        disabled={values.skus.length <= 1}
                      >
                        {t('modules.productsAdmin.removeSku')}
                      </button>
                    </div>
                    <span className="mt-1.5 min-h-[1.25rem]" aria-hidden />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#2D3748] bg-transparent px-4 py-3 text-sm font-medium text-[#ADB5BD] shadow-sm transition-all hover:border-[#0D6EFD] hover:text-white sm:w-auto sm:self-start"
            onClick={addSku}
          >
            <Plus size={16} aria-hidden />
            {t('modules.productsAdmin.addSku')}
          </button>
        </div>
      </fieldset>

      <ProductMediaStudio produtoId={produtoId ?? null} disabled={disabled} />
    </div>
  );
}

export default ProdutoForm;
