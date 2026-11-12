import type { AccessTokenPayload } from './access-token-payload-interface';
import type { User } from './user-interface';

export function mapAccessTokenPayloadToUser(payload: AccessTokenPayload): User {
  const email = payload.sub || payload.iss;
  if (!email) {
    throw new Error('Token JWT inválido: falta sub o iss para el correo.');
  }
  return {
    id: payload.uid,
    name: payload.name,
    email,
    role: payload.role,
  };
}
