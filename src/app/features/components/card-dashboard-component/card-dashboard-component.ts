import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideArrowRight,
  LucideBuilding2,
  LucideFileText,
  LucideHistory,
  LucidePackage,
  LucideUsers,
} from '@lucide/angular';
import type { CardDashboard, CardDashboardColorTheme } from '@shared/models/card-dashboard-interface';

const ICON_BOX_BY_THEME: Record<CardDashboardColorTheme, string> = {
  success: 'rounded-2xl bg-success/10 p-3 text-success shrink-0',
  secondary: 'rounded-2xl bg-secondary/10 p-3 text-secondary shrink-0',
  info: 'rounded-2xl bg-info/10 p-3 text-info shrink-0',
  warning: 'rounded-2xl bg-warning/10 p-3 text-warning shrink-0',
  error: 'rounded-2xl bg-error/10 p-3 text-error shrink-0',
};

const BUTTON_BY_THEME: Record<CardDashboardColorTheme, string> = {
  success: 'btn btn-soft btn-success btn-sm sm:btn-md gap-2',
  secondary: 'btn btn-soft btn-secondary btn-sm sm:btn-md gap-2',
  info: 'btn btn-soft btn-info btn-sm sm:btn-md gap-2',
  warning: 'btn btn-soft btn-warning btn-sm sm:btn-md gap-2',
  error: 'btn btn-soft btn-error btn-sm sm:btn-md gap-2',
};

@Component({
  selector: 'app-card-dashboard-component',
  imports: [
    LucideArrowRight,
    LucideBuilding2,
    LucideFileText,
    LucideHistory,
    LucidePackage,
    LucideUsers,
  ],
  templateUrl: './card-dashboard-component.html',
  styleUrl: './card-dashboard-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardDashboardComponent {
  private readonly router = inject(Router);
  readonly dataCard = input.required<CardDashboard>();

  readonly iconBoxClass = computed(() => ICON_BOX_BY_THEME[this.dataCard().colorTheme]);
  readonly buttonClass = computed(() => BUTTON_BY_THEME[this.dataCard().colorTheme]);

  readonly hasRoute = computed(() => {
    const route = this.dataCard().router;
    return route !== null && route.length > 0;
  });

  onClickButton(): void {
    const path = this.dataCard().router;
    if (path === null || path === '') {
      return;
    }
    void this.router.navigateByUrl(path);
  }
}
