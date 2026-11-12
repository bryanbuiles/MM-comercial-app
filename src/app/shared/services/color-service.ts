import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '@env/environment';
import { Color } from '@shared/models/color-interface';

@Service()
export class ColorService {

    private readonly http = inject(HttpClient);

    getAllColors() {
        return this.http.get<Color[]>(`${environment.apiUrl}/colors`);
    }
}
