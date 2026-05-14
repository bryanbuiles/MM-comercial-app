import type { CardDashboard } from '@shared/models/card-dashboard-interface';

export const DASHBOARD_CARDS = [
  {
    title: 'Generador de cotizaciones',
    icon: 'file-text',
    description:
      'Crea cotizaciones personalizadas para tus clientes de forma rápida y profesional.',
    buttonName: 'Ir al generador',
    router: null,
    colorTheme: 'success',
  },
  {
    title: 'Gestor de Usuarios',
    icon: 'users',
    description: 'Administra los usuarios del sistema, sus roles y permisos de acceso.',
    buttonName: 'Gestionar usuarios',
    router: null,
    colorTheme: 'secondary',
  },
  {
    title: 'Gestor de Empresas',
    icon: 'building-2',
    description: 'Gestiona la información de las empresas y sus datos fiscales.',
    buttonName: 'Gestionar empresas',
    router: null,
    colorTheme: 'info',
  },
  {
    title: 'Gestor de Productos',
    icon: 'package',
    description: 'Administra tu catálogo de productos, precios, categorías y existencias.',
    buttonName: 'Gestionar productos',
    router: null,
    colorTheme: 'warning',
  },
  {
    title: 'Histórico de cotizaciones y facturas',
    icon: 'history',
    description: 'Consulta el historial de cotizaciones y facturas generadas.',
    buttonName: 'Ver historial',
    router: null,
    colorTheme: 'error',
  },
] as const satisfies readonly CardDashboard[];
