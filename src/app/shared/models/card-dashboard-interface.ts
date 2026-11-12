export type CardDashboardIcon = 'file-text' | 'users' | 'building-2' | 'package' | 'history';

export type CardDashboardColorTheme = 'success' | 'secondary' | 'info' | 'warning' | 'error';

export interface CardDashboard {
  title: string;
  icon: CardDashboardIcon;
  description: string;
  buttonName: string;
  router: string | null;
  colorTheme: CardDashboardColorTheme;
}
