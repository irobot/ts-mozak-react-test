import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import App from './components/app/App';
import registerServiceWorker from './registerServiceWorker';
import {store} from './redux/store';
import './index.css';

ReactDOM.render(
  (
    <Provider store={store}>
      <App />
    </Provider>
  ),
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
