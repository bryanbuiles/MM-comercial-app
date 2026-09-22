import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@env/environment';
import { UserPLus } from '@shared/models/user-interface';

@Service()
export class UserService {

private readonly http = inject(HttpClient);

getUserById(id: number) {
    return this.http.get<UserPLus>(`${environment.apiUrl}/users/${id}`);
}

}
