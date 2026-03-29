import { LicenseManager } from 'ag-grid-enterprise';

/**
 * Licença AG Grid Enterprise (evita watermark em produção).
 * Defina em `.env.local`: `REACT_APP_AG_GRID_LICENSE_KEY=<sua chave>`
 */
const licenseKey = process.env.REACT_APP_AG_GRID_LICENSE_KEY;
if (typeof licenseKey === 'string' && licenseKey.trim().length > 0) {
  LicenseManager.setLicenseKey(licenseKey.trim());
}
