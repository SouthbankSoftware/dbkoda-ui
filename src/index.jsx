/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-04-24T18:19:48+10:00
 */

import Store from '~/stores/global';
import React from 'react';
import ReactDOM from 'react-dom';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import { AppContainer } from 'react-hot-loader';
import App from './components/App';

useStrict(true);

const store = new Store();

window.stores = store;

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <Component />
      </Provider>
    </AppContainer>,
    document.getElementById('root')
  );
};

render(App);

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./components/App', () => {
    render(App);
  });
}
