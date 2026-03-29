const fs = require('fs');
const map = require('@svg-maps/world').default;

const paths = map.locations.map(l => ({
  code: l.id.toUpperCase(),
  name: l.name,
  d: l.path
}));

fs.writeFileSync('public/assets/world-paths.json', JSON.stringify(paths));
console.log('Done mapping.');
