// Entry: the DSH module loader contract plus the shared factory scope.
// Build with: node build-client.mjs   (writes ../client.js)
window.__ModuleLoader__.load({
  id: '@local/dsh-life-planner',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'life-planner';

/*__INCLUDES__*/
  },
});
