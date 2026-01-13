export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nueva funcionalidad
        'fix', // Corrección de bugs
        'docs', // Cambios en documentación
        'style', // Formato de código (no afecta funcionalidad)
        'refactor', // Refactorización de código
        'perf', // Mejoras de rendimiento
        'test', // Añadir o corregir tests
        'build', // Cambios en sistema de build
        'ci', // Cambios en CI/CD
        'chore', // Tareas de mantenimiento
        'revert', // Revertir commits anteriores
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
