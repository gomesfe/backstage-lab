import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './App';

// O CSS (BUI, tokens e design system do Atlas) é importado por `./atlas`.

ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());
