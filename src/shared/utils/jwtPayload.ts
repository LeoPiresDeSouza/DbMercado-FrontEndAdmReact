/** Claim `ClaimTypes.Name` no JWT emitido pela API .NET (UserName no Identity). */
const JWT_CLAIM_NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name';

/** Claim `ClaimTypes.NameIdentifier` — ID do usuário no Identity (`AspNetUsers.Id`), alinhado ao hub de chat. */
const JWT_CLAIM_NAME_IDENTIFIER =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) {
      return null;
    }
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isLikelyOpaqueUserId(value: string): boolean {
  if (/^[0-9a-f-]{36}$/i.test(value)) {
    return true;
  }
  if (/^\d{10,}$/.test(value)) {
    return true;
  }
  return false;
}

/**
 * Identificador para `GET /api/Modulo/modulosUsuario?usuario=` — deve coincidir com o **nome de usuário**
 * do Identity (`UserManager.FindByNameAsync`). Preferimos o claim Name; depois e-mail / unique_name.
 */
export function readIdentityFromAccessToken(token: string | null): string | null {
  if (!token) {
    return null;
  }
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }
  const candidates: unknown[] = [
    payload[JWT_CLAIM_NAME],
    payload.name,
    payload.email,
    payload.unique_name,
    payload.preferred_username,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0 && !isLikelyOpaqueUserId(c)) {
      return c;
    }
  }
  const sub = payload.sub;
  if (typeof sub === 'string' && sub.length > 0) {
    return sub;
  }
  return null;
}

/**
 * ID do usuário no ASP.NET Identity (claim NameIdentifier ou `sub`), para comparar com `senderId` no chat.
 */
export function readUserIdFromAccessToken(token: string | null): string | null {
  if (!token) {
    return null;
  }
  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null;
  }
  const idClaim = payload[JWT_CLAIM_NAME_IDENTIFIER];
  if (typeof idClaim === 'string' && idClaim.length > 0) {
    return idClaim;
  }
  const sub = payload.sub;
  if (typeof sub === 'string' && sub.length > 0) {
    return sub;
  }
  return null;
}
