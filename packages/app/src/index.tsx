import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@backstage/ui/css/styles.css';
// Depois do CSS da BUI, para sobrescrever os tokens dela com os do Atlas.
import './modules/theme/bui-tokens.css';

ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());
