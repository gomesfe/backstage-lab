import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@backstage/ui/css/styles.css';
// Depois do CSS da BUI, para sobrescrever os tokens dela com os do Atlas.
import './modules/theme/bui-tokens.css';
// Design system do Atlas, gerado a partir do repositório atlas-design-system
// (`yarn ds:sync`). Depois dos anteriores, para vencer o reset deles.
import './modules/theme/atlas.css';

ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());
