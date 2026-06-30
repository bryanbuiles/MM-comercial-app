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
            import('./layout/header/header-component/header-component').then((m) => m.HeaderComponent),
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./features/components/home-component/home-component').then((m) => m.HomeComponent),
            },
        ],
    },
    {
        path: '**',
        redirectTo: ''
    }

];
