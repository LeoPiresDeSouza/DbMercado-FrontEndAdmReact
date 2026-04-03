import { LicenseManager } from 'ag-grid-enterprise';

/**
 * Licença AG Grid Enterprise (evita watermark em produção).
 * Defina em `.env.local`: `VITE_AG_GRID_LICENSE_KEY=<sua chave>`
 */
const licenseKey = import.meta.env.VITE_AG_GRID_LICENSE_KEY;
if (typeof licenseKey === 'string' && licenseKey.trim().length > 0) {
  LicenseManager.setLicenseKey(licenseKey.trim());
}
