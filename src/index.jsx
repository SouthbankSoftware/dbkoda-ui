/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-04-21T16:36:03+10:00
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import Store from '~/stores/global';
import { AppContainer } from 'react-hot-loader';
import App from './components/App';
// import TestApp from './components/TestApp';

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
