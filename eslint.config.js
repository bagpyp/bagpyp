const nextVitals = require('eslint-config-next/core-web-vitals');

module.exports = [
  ...nextVitals,
  {
    rules: {
      // Next.js 16 enables React compiler lint rules that are very noisy
      // in this existing codebase. Keep them off for now so linting stays usable.
      'react-hooks/static-components': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/refs': 'off',
    },
  },
];
