/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-04-30T22:45:22+10:00
 */

import Store from '~/stores/global';
import React from 'react';
import ReactDOM from 'react-dom';
import mobx, { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import { AppContainer } from 'react-hot-loader';
import App from './components/App';

useStrict(true);

const store = new Store();

window.store = store;
window.mobx = mobx;

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
