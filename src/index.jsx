import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';
import {Provider} from 'mobx-react';
import {useStrict} from 'mobx';
import Store from './store';

useStrict(true);

const store = new Store();

const render = (Component) => ReactDOM.render(
  <Provider store={store}>
    <Component/>
  </Provider>, document.getElementById('root'));

render(App);
