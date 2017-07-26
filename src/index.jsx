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
  * @Author: Wahaj Shamim <wahaj>
  * @Date:   2017-07-13T10:36:10+10:00
  * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-07-25T16:49:18+10:00
  */


import Store from '~/stores/global';
import DataCenter from '~/api/datacenter';
import React from 'react';
import ReactDOM from 'react-dom';
import mobx, { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import { AppContainer } from 'react-hot-loader';
import { Broker, EventType } from './helpers/broker';
import App from './components/App';

useStrict(true);

const rootEl = document.getElementById('root');

let store;
let api;
let bAppRendered = false;

Broker.once(EventType.APP_READY, () => {
  const render = (Component) => {
    ReactDOM.render(
      <AppContainer>
        <Provider store={store} api={api}>
          <Component />
        </Provider>
      </AppContainer>,
      rootEl
    );
  };

  render(App);

  const renderWithCleanStore = () => {
    if (!bAppRendered) {
      console.log('Recovering with clean state store.');
      store = new Store();
      api = new DataCenter(store);
      store.setAPI(api);    // TODO: Remove this line after complete migration to API
      render(App);
    }
  };

  renderWithCleanStore();

  // Hot Module Replacement API
  if (module.hot) {
    module.hot.accept('./components/App', () => {
      render(App);
    });
  }
});

Broker.once(EventType.APP_RENDERED, () => {
  console.log('App Rendered successfully !!!!!!!');
  bAppRendered = true;
});

window.addEventListener('beforeunload', (event) => {
  let shouldUnmount = true;

  if (IS_ELECTRON) {
    const remote = window.require('electron').remote;
    const { dialog } = remote;
    const currentWindow = remote.getCurrentWindow();

    if (
      !remote.getGlobal('UAT') &&
      store.hasUnsavedEditorTabs()
    ) {
      const response = dialog.showMessageBox(currentWindow, {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message:
          'You have unsaved editor tabs. Are you sure you want to continue?'
      });

      if (response === 1) {
        // if 'No' is clicked

        // cancel window unload
        event.returnValue = false;
        // cancel our own unload logics
        shouldUnmount = false;
      }
    }
  }

  if (shouldUnmount) {
    store.closeConnection();
    ReactDOM.unmountComponentAtNode(rootEl);
  }

  // save store anyway
  store.saveSync();
});

store = new Store();
api = new DataCenter(store);
store.setAPI(api);    // TODO: Remove this line after complete migration to API
window.api = api;
window.store = store;
window.mobx = mobx;
