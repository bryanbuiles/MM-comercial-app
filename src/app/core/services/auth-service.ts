import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { LoginResponse } from '@models/auth-interface';

const TOKEN_KEY = 'mm.auth.token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {


  private readonly http = inject(HttpClient);


  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password }, { observe: 'response' });
  }
}
