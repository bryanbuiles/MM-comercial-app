import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/components/auth/login-component/login-component').then((c) => c.LoginComponent),
    },
    {
        path: 'home',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./layout/header/header-component/header-component').then((c) => c.HeaderComponent),
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/components/home-component/home-component').then((c) => c.HomeComponent),
            },
            {
                path: 'cotizacion',
                loadComponent: () => import('./features/components/quote-container-component/quote-container-component').then((c) => c.QuoteContainerComponent)
            }
        ],
    },
    {
        path: '**',
        redirectTo: ''
    }

];
