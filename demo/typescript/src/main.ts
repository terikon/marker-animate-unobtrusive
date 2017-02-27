import { MarkerMoveSlidingApp } from './markermove-sliding';

export function main() {
  var app = new MarkerMoveSlidingApp();
}

// support async tag or hmr
switch (document.readyState) {
  case 'interactive':
  case 'complete':
    main();
    break;
  case 'loading':
  default:
    document.addEventListener('DOMContentLoaded', () => main());
}
