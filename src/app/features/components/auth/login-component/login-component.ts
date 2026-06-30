import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/services/auth-service';

@Component({
  selector: 'app-login-component',
  imports: [ReactiveFormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Dispara CD (OnPush) cuando solo cambia `touched` sin `valueChanges`. */
  onControlBlur(): void { }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.form.valid || this.loading()) {
      return;
    }

    const { email, password } = this.form.getRawValue();

    this.loading.set(true);
    this.dismissError();

    this.authService
      .login(email, password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigateByUrl(this.resolvePostLoginUrl(), { replaceUrl: true });
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(this.mapLoginError(err));
          this.loading.set(false);
        },
      });
  }

  dismissError(): void {
    this.error.set(null);
  }

  private resolvePostLoginUrl(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')) {
      return returnUrl;
    }
    return '/home';
  }

  private mapLoginError(err: HttpErrorResponse): string {
    if (err.status === 401 || err.status === 403) {
      return 'Credenciales incorrectas. Verificá tu correo y contraseña.';
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Revisá tu conexión.';
    }
    return 'Ocurrió un error al iniciar sesión. Intentá nuevamente.';
  }
}
