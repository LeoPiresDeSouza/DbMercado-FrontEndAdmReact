import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ProdutoFormValues } from '../types/produtoFormValues';

const inputBase =
  'w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
const inputNormal = `${inputBase} border-neutral-300 focus:border-sky-600 focus:ring-sky-500/25`;
const inputError = `${inputBase} border-red-500 focus:border-red-600 focus:ring-red-500/25`;

/** Label acima do campo: mesma tipografia e espaçamento em todo o formulário. */
const labelClass = 'mb-1.5 block text-sm font-medium leading-snug text-neutral-700';

/** Coluna de campo: evita overflow e mantém label + controle alinhados. */
const fieldCol = 'flex min-w-0 flex-col';

const sectionFieldset =
  'min-w-0 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm ring-1 ring-neutral-100 md:p-6';

const sectionLegend =
  'mb-5 block w-full border-b border-neutral-200 pb-2.5 text-xs font-semibold uppercase tracking-wide text-neutral-500';

export type ProdutoFormProps = {
  values: ProdutoFormValues;
  onChange: (patch: Partial<ProdutoFormValues>) => void;
  errors: Record<string, string>;
  disabled?: boolean;
};

function FieldError({ message }: { message?: string }): React.ReactElement | null {
  if (!message) {
    return null;
  }
  return <p className="mt-1.5 min-h-[1.25rem] text-sm leading-tight text-red-600">{message}</p>;
}

function ProdutoForm(props: ProdutoFormProps): React.ReactElement {
  const { values, onChange, errors, disabled } = props;
  const { t } = useTranslation('common');
  const p = (name: keyof ProdutoFormValues) => (errors[name as string] ? inputError : inputNormal);

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
    <div className="flex flex-col gap-6">
      {/* Identificação: texto completo + bloco único de atributos comerciais */}
      <fieldset disabled={disabled} className={sectionFieldset}>
        <legend className={sectionLegend}>{t('modules.productsAdmin.sectionIdentificacao')}</legend>

        <div className="flex flex-col gap-6">
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

          <div className="border-t border-neutral-100 pt-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-400">
              {t('modules.productsAdmin.subgroupComercial')}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                <label htmlFor="pf-un" className={labelClass}>
                  {t('modules.productsAdmin.fieldUnidade')}
                </label>
                <input
                  id="pf-un"
                  type="text"
                  autoComplete="off"
                  className={p('unidadeMedida')}
                  value={values.unidadeMedida}
                  onChange={(e) => onChange({ unidadeMedida: e.target.value })}
                />
                <FieldError message={errors.unidadeMedida} />
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
            </div>
          </div>
        </div>
      </fieldset>

      {/* Fiscal: origem geográfica + bloco de códigos fiscais na mesma linha em desktop */}
      <fieldset disabled={disabled} className={sectionFieldset}>
        <legend className={sectionLegend}>{t('modules.productsAdmin.sectionFiscalOrigem')}</legend>

        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-400">
              {t('modules.productsAdmin.subgroupOrigemGeografica')}
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className={fieldCol}>
                <label htmlFor="pf-origem" className={labelClass}>
                  {t('modules.productsAdmin.fieldOrigemTipo')}
                </label>
                <input
                  id="pf-origem"
                  type="text"
                  autoComplete="off"
                  className={p('origemTipo')}
                  value={values.origemTipo}
                  onChange={(e) => onChange({ origemTipo: e.target.value })}
                />
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

          <div className="border-t border-neutral-100 pt-6">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-neutral-400">
              {t('modules.productsAdmin.subgroupFiscal')}
            </p>
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
                <input
                  id="pf-icms"
                  type="text"
                  autoComplete="off"
                  className={p('origemIcms')}
                  value={values.origemIcms}
                  onChange={(e) => onChange({ origemIcms: e.target.value })}
                />
                <FieldError message={errors.origemIcms} />
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Embalagem: quatro medidas sempre na mesma grade em desktop */}
      <fieldset disabled={disabled} className={sectionFieldset}>
        <legend className={sectionLegend}>{t('modules.productsAdmin.sectionEmbalagem')}</legend>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      </fieldset>

      {/* Dimensão do produto */}
      <fieldset disabled={disabled} className={sectionFieldset}>
        <legend className={sectionLegend}>{t('modules.productsAdmin.sectionDimensaoProduto')}</legend>

        <div className="flex flex-col gap-6">
          <div className={`flex flex-wrap items-center gap-3 rounded-md border border-neutral-100 bg-neutral-50/80 px-4 py-3`}>
            <input
              id="pf-dim-toggle"
              type="checkbox"
              className="h-4 w-4 shrink-0 rounded border-neutral-300 text-sky-600 focus:ring-sky-500"
              checked={values.incluirDimProduto}
              onChange={(e) => onChange({ incluirDimProduto: e.target.checked })}
            />
            <label htmlFor="pf-dim-toggle" className={`${labelClass} mb-0 cursor-pointer`}>
              {t('modules.productsAdmin.fieldDimProdutoToggle')}
            </label>
          </div>

          {values.incluirDimProduto ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
            </div>
          ) : null}
        </div>
      </fieldset>

      {/* SKUs */}
      <fieldset disabled={disabled} className={sectionFieldset}>
        <legend className={sectionLegend}>{t('modules.productsAdmin.sectionSkus')}</legend>

        <div className="flex flex-col gap-6">
          <FieldError message={errors.skus} />

          <ul className="flex flex-col gap-6">
            {values.skus.map((s, i) => (
              <li
                key={i}
                className="rounded-lg border border-neutral-200 bg-neutral-50/60 p-5 ring-1 ring-neutral-100"
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
                    <div className="flex h-[2.375rem] items-center gap-2.5">
                      <input
                        id={`pf-sku-a-${i}`}
                        type="checkbox"
                        className="h-4 w-4 shrink-0 rounded border-neutral-300 text-sky-600 focus:ring-sky-500"
                        checked={s.ativo}
                        onChange={(e) => setSku(i, { ativo: e.target.checked })}
                      />
                      <label htmlFor={`pf-sku-a-${i}`} className="cursor-pointer text-sm font-medium leading-snug text-neutral-700">
                        {t('modules.productsAdmin.fieldSkuAtivo')}
                      </label>
                    </div>
                    <span className="mt-1.5 min-h-[1.25rem]" aria-hidden />
                  </div>

                  <div className="flex shrink-0 flex-col md:w-auto">
                    <span className="mb-1.5 min-h-[1.25rem]" aria-hidden />
                    <div className="flex h-[2.375rem] items-center">
                      <button
                        type="button"
                        className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
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
            className="w-full rounded-md border border-dashed border-neutral-300 bg-neutral-50/50 px-4 py-3 text-sm font-medium text-neutral-700 hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-900 sm:w-auto sm:self-start"
            onClick={addSku}
          >
            {t('modules.productsAdmin.addSku')}
          </button>
        </div>
      </fieldset>
    </div>
  );
}

export default ProdutoForm;
