/**
 * Decodifica el payload (2.º segmento) de un JWT con base64url → JSON.
 * No valida firma ni expiración.
 */
export function decodeJwtPayload<T>(token: string): T {
  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Token JWT inválido: faltan segmentos.');
  }
  const segment = parts[1];
  let base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const remainder = base64.length % 4;
  if (remainder === 2) {
    base64 += '==';
  } else if (remainder === 3) {
    base64 += '=';
  } else if (remainder === 1) {
    throw new Error('Token JWT inválido: segmento de payload corrupto.');
  }
  const json = atob(base64);
  return JSON.parse(json) as T;
}
