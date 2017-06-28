/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-30T16:55:50+10:00
 */

import Store from '~/stores/global';
import React from 'react';
import ReactDOM from 'react-dom';
import mobx, { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import { AppContainer } from 'react-hot-loader';
import { Broker, EventType } from './helpers/broker';
import App from './components/App';

useStrict(true);

let store;

Broker.once(EventType.APP_READY, () => {
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
});

store = new Store();

window.store = store;
window.mobx = mobx;
