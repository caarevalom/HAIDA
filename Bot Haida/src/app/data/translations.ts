import { Zap, Activity, Terminal, LayoutDashboard, Globe, MessageSquare, Bot } from 'lucide-react';

export type Language = 'en' | 'es';

export const translations = {
  en: {
    system: {
      online: 'HAIDA v3.1 Operational',
      offline: 'System Offline',
      version: 'v3.1.0 Production',
      gridActive: 'QA AUTOMATION ACTIVE',
      secure: 'ENTERPRISE SECURE',
      id: 'HAIDA-QA-001',
      established: 'QA PLATFORM 2026',
    },
    hero: {
      titleLine1: 'HAIDA',
      titleLine2: 'QA AUTOMATION',
      subtitle: 'Enterprise QA Testing Platform.\\nAI-Powered Test Automation & Monitoring.',
    },
    sections: {
      capabilities: 'Platform Capabilities',
      commands: 'Command Reference',
      base: 'Base Commands',
      projects: 'Project Management',
      executions: 'Test Execution',
      reports: 'Reports & Analytics',
      alerts: 'Alerts & Subscriptions',
      ai: 'AI & Productivity',
      admin: 'Admin & Diagnostics',
    },
    cards: {
      automation: { title: 'QA Automation', subtitle: 'Test Engine' },
      monitoring: { title: 'Monitoring', subtitle: 'Live Health' },
      reports: { title: 'Reports', subtitle: 'Analytics' },
    },
    footer: {
      privacy: 'Privacy Policy',
      legal: 'Terms & Conditions',
      status: 'Platform Status',
      company: 'HAIDA QA Platform',
    },
    aria: {
      toggleTheme: 'Toggle Color Theme',
      toggleLang: 'Switch Language',
    },
    commands: {
      base: {
        Start: 'Start',
        Help: 'Help',
        Status: 'Status',
        Health: 'Health',
        Version: 'Version',
        Whoami: 'Who Am I',
        Link: 'Link Account',
        Unlink: 'Unlink',
        Ping: 'Ping',
      },
      projects: {
        Projects: 'Projects',
        Project: 'Project Detail',
        ProjectCreate: 'Create Project',
        ProjectArchive: 'Archive Project',
      },
      executions: {
        Runs: 'Test Runs',
        Run: 'Execute Run',
        RunStatus: 'Run Status',
        CancelRun: 'Cancel Run',
        Rerun: 'Re-run',
      },
      reports: {
        Reports: 'Reports',
        Report: 'Report Detail',
        LastReport: 'Last Report',
      },
      alerts: {
        Subscribe: 'Subscribe',
        Unsubscribe: 'Unsubscribe',
        Subscriptions: 'Subscriptions',
        Alerts: 'Toggle Alerts',
      },
      ai: {
        Chat: 'AI Chat',
        Perplexity: 'Perplexity',
      },
      admin: {
        WebhookInfo: 'Webhook Info',
        SetWebhook: 'Set Webhook',
        Metrics: 'Metrics',
        DB: 'Database Check',
      },
    },
    drawer: {
      button: 'About HAIDA',
      title: 'HAIDA QA Platform',
      desc: 'Enterprise-grade QA Automation platform powered by AI. Integrated test design, execution, and monitoring.',
      brandMode: 'Platform Overview',
      brandModeDesc: 'HAIDA provides comprehensive QA testing capabilities with AI-assisted test generation, real-time monitoring, and detailed reporting aligned with ISTQB standards.',
      interactive: 'Command Interface',
      interactiveDesc: 'Use the command cards to interact with the HAIDA bot on Telegram. Copy commands to your clipboard for quick execution.',
      miniapps: 'Test Designer',
      miniappsDesc: 'AI-powered test design interface for creating automated test suites.',
      close: 'Close'
    }
  },
  es: {
    system: {
      online: 'HAIDA v3.1 Operativo',
      offline: 'Sistema Offline',
      version: 'v3.1.0 Producción',
      gridActive: 'AUTOMATIZACIÓN QA ACTIVA',
      secure: 'ENTERPRISE SEGURO',
      id: 'HAIDA-QA-001',
      established: 'PLATAFORMA QA 2026',
    },
    hero: {
      titleLine1: 'HAIDA',
      titleLine2: 'QA AUTOMATION',
      subtitle: 'Plataforma Enterprise de QA Testing.\\nAutomatización de Pruebas con IA y Monitoreo.',
    },
    sections: {
      capabilities: 'Capacidades de Plataforma',
      commands: 'Referencia de Comandos',
      base: 'Comandos Base',
      projects: 'Gestión de Proyectos',
      executions: 'Ejecución de Tests',
      reports: 'Reportes y Analítica',
      alerts: 'Alertas y Suscripciones',
      ai: 'IA y Productividad',
      admin: 'Admin y Diagnóstico',
    },
    cards: {
      automation: { title: 'QA Automation', subtitle: 'Motor de Tests' },
      monitoring: { title: 'Monitoreo', subtitle: 'Salud en Vivo' },
      reports: { title: 'Reportes', subtitle: 'Analítica' },
    },
    footer: {
      privacy: 'Política Privacidad',
      legal: 'Términos y Condiciones',
      status: 'Estado Plataforma',
      company: 'Plataforma QA HAIDA',
    },
    aria: {
      toggleTheme: 'Cambiar Tema de Color',
      toggleLang: 'Cambiar Idioma',
    },
    commands: {
      base: {
        Start: 'Inicio',
        Help: 'Ayuda',
        Status: 'Estado',
        Health: 'Salud',
        Version: 'Versión',
        Whoami: 'Quién Soy',
        Link: 'Vincular Cuenta',
        Unlink: 'Desvincular',
        Ping: 'Ping',
      },
      projects: {
        Projects: 'Proyectos',
        Project: 'Detalle Proyecto',
        ProjectCreate: 'Crear Proyecto',
        ProjectArchive: 'Archivar Proyecto',
      },
      executions: {
        Runs: 'Ejecuciones',
        Run: 'Ejecutar Suite',
        RunStatus: 'Estado Ejecución',
        CancelRun: 'Cancelar',
        Rerun: 'Re-ejecutar',
      },
      reports: {
        Reports: 'Reportes',
        Report: 'Detalle Reporte',
        LastReport: 'Último Reporte',
      },
      alerts: {
        Subscribe: 'Suscribirse',
        Unsubscribe: 'Desuscribirse',
        Subscriptions: 'Suscripciones',
        Alerts: 'Toggle Alertas',
      },
      ai: {
        Chat: 'Chat IA',
        Perplexity: 'Perplexity',
      },
      admin: {
        WebhookInfo: 'Info Webhook',
        SetWebhook: 'Config Webhook',
        Metrics: 'Métricas',
        DB: 'Check Base Datos',
      },
    },
    drawer: {
      button: 'Sobre HAIDA',
      title: 'Plataforma QA HAIDA',
      desc: 'Plataforma de Automatización QA de nivel empresarial con IA. Diseño, ejecución y monitoreo de tests integrados.',
      brandMode: 'Vista General',
      brandModeDesc: 'HAIDA ofrece capacidades completas de testing QA con generación de tests asistida por IA, monitoreo en tiempo real y reportería detallada alineada con estándares ISTQB.',
      interactive: 'Interfaz de Comandos',
      interactiveDesc: 'Usa las tarjetas de comandos para interactuar con el bot HAIDA en Telegram. Copia comandos al portapapeles para ejecución rápida.',
      miniapps: 'Diseñador de Tests',
      miniappsDesc: 'Interfaz de diseño de tests con IA para crear suites automatizadas.',
      close: 'Cerrar'
    }
  }
};