/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-08T16:37:54+11:00
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import Store from '~/stores/global';
import App from './components/App.jsx';

useStrict(true);

const store = new Store();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);
