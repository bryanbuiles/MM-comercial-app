import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { INTERCEPTOR_ENABLED } from '@core/interceptors/token-interceptor';
import { environment } from '@env/environment';
import type { AccessTokenPayload } from '@shared/models/access-token-payload-interface';
import { LoginResponse } from '@shared/models/auth-interface';
import { LocalStorageEnum } from '@shared/models/enums';
import { mapAccessTokenPayloadToUser } from '@shared/models/map-access-token-payload-to-user';
import { User } from '@shared/models/user-interface';
import { LocalStorageService } from '@shared/services/local-storage-service';
import { decodeJwtPayload } from '@shared/utils/jwt-decode';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {


  private readonly http = inject(HttpClient);
  private readonly localStoreService = inject(LocalStorageService);



  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password },
      { context: new HttpContext().set(INTERCEPTOR_ENABLED, false) }
    )
      .pipe(tap((response) => {
        this.localStoreService.setItem(LocalStorageEnum.TOKEN, response.accessToken);
        const payload = decodeJwtPayload<AccessTokenPayload>(response.accessToken);
        const user = mapAccessTokenPayloadToUser(payload);
        this.localStoreService.setItem(LocalStorageEnum.USER, user);
      }));
  }

  logout(): void {
    this.localStoreService.removeItem(LocalStorageEnum.TOKEN);
    this.localStoreService.removeItem(LocalStorageEnum.USER);
  }

  isAuthenticated() {
    const token = this.localStoreService.getItem(LocalStorageEnum.TOKEN) as string;
    const user = this.localStoreService.getItem(LocalStorageEnum.USER) as User;
    // 1. Sin credenciales → login
    if (!token || !user) {
      this.logout();
      return false;
    }

    try {
      const payload = decodeJwtPayload<AccessTokenPayload>(token);

      // 2. Token expirado (decodeJwtPayload no valida exp)
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        this.logout();
        return false;
      }

      // 3. Token no corresponde al usuario guardado
      if (payload.sub !== user.email) {
        this.logout();
        return false;
      }
      return true; // sesión OK
    } catch {
      this.logout();
      return false;
    }
  }

}
