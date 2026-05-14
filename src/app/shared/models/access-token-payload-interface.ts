/** Claims del cuerpo del access token JWT (post-decode). */
export interface AccessTokenPayload {
  sub: string;
  name: string;
  role: 'USER' | 'ADMIN';
  uid: number;
  iss?: string;
  exp?: number;
  iat?: number;
}
