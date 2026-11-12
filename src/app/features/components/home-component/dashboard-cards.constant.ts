import type { CardDashboard } from '@shared/models/card-dashboard-interface';

export const DASHBOARD_CARDS = [
  {
    title: 'Generador de cotizaciones',
    icon: 'file-text',
    description:
      'Crea cotizaciones personalizadas para tus clientes de forma rápida y profesional.',
    buttonName: 'Ir al generador',
    router: '/home/cotizacion',
    colorTheme: 'success',
  },
  {
    title: 'Gestor de Usuarios',
    icon: 'users',
    description: 'Administra los usuarios del sistema, sus roles y permisos de acceso.',
    buttonName: 'Gestionar usuarios',
    router: '/home',
    colorTheme: 'secondary',
  },
  {
    title: 'Gestor de Empresas',
    icon: 'building-2',
    description: 'Gestiona la información de las empresas.',
    buttonName: 'Gestionar empresas',
    router: '/home',
    colorTheme: 'info',
  },
  {
    title: 'Gestor de Productos',
    icon: 'package',
    description: 'Administra tu catálogo de productos y precios.',
    buttonName: 'Gestionar productos',
    router: '/home',
    colorTheme: 'warning',
  },
  {
    title: 'Histórico de facturas',
    icon: 'history',
    description: 'Consulta el historial de facturas generadas.',
    buttonName: 'Ver historial',
    router: '/home',
    colorTheme: 'error',
  },
] as const satisfies readonly CardDashboard[];
