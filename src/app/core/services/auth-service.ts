import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import type { AccessTokenPayload } from '@shared/models/access-token-payload-interface';
import { LoginResponse } from '@shared/models/auth-interface';
import { LocalStorageEnum } from '@shared/models/enums';
import { mapAccessTokenPayloadToUser } from '@shared/models/map-access-token-payload-to-user';
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
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
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
}
