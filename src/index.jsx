import React from 'react';
import ReactDOM from 'react-dom';
import {useStrict} from 'mobx';
import {Provider} from 'mobx-react';
import App from './components/App.jsx';
import Store from './store';

useStrict(true);

const store = new Store();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>, document.getElementById('root'));

