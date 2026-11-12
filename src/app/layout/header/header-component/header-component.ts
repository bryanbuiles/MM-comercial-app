import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth-service';
import { LucideChevronDown, LucideLogOut, LucideUser } from '@lucide/angular';
import { LocalStorageEnum } from '@shared/models/enums';
import type { User } from '@shared/models/user-interface';
import { LocalStorageService } from '@shared/services/local-storage-service';

@Component({
  selector: 'app-header-component',
  imports: [RouterOutlet, RouterLink, LucideChevronDown, LucideUser, LucideLogOut],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class HeaderComponent {
  private readonly localStorage = inject(LocalStorageService);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly user = signal<User | null>(this.localStorage.getItem<User>(LocalStorageEnum.USER));

  readonly displayName = computed(() => this.user()?.name ?? 'Usuario');

  readonly roleLabel = computed(() => {
    const role = this.user()?.role;
    if (role === 'ADMIN') return 'Administrador';
    return 'Usuario';
  });

  readonly initials = computed(() => {
    const name = this.user()?.name?.trim();
    if (!name) return 'MM';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]?.charAt(0);
      const b = parts[1]?.charAt(0);
      if (a && b) {
        return (a + b).toUpperCase();
      }
    }
    return name.slice(0, 2).toUpperCase();
  });

  logout(): void {
    this.auth.logout();
    this.user.set(null);
    void this.router.navigate(['/']);
  }
}
