/**
* @Last modified by:   wahaj
* @Last modified time: 2017-03-14T16:15:18+11:00
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import Store from '~/stores/global';
import App from './components/App.jsx';

useStrict(true);

const store = new Store();

window.stores = store;

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
