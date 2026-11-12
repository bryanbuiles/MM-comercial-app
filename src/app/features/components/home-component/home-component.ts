import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { LocalStorageEnum } from '@shared/models/enums';
import type { User } from '@shared/models/user-interface';
import { LocalStorageService } from '@shared/services/local-storage-service';
import { CardDashboardComponent } from '../card-dashboard-component/card-dashboard-component';
import { DASHBOARD_CARDS } from './dashboard-cards.constant';

@Component({
  selector: 'app-home-component',
  imports: [CardDashboardComponent],
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly localStorageService = inject(LocalStorageService);

  private readonly userData = signal<User | null>(
    this.localStorageService.getItem<User>(LocalStorageEnum.USER),
  );

  readonly cards = DASHBOARD_CARDS;

  readonly saludoNombre = computed(() => {
    const name = this.userData()?.name?.trim();
    if (!name) {
      return 'Usuario';
    }
    const first = name.split(/\s+/).find((part) => part.length > 0);
    return first ?? name;
  });
}
