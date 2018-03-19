/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-13T10:36:10+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-02-28T12:57:16+11:00
 *
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

import Store from '~/stores/global';
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

const electron = window.require('electron');
const { ipcRenderer } = electron;

const renderApp = () => {
  if (store) {
    console.log('Last Store Version:', store.version);
    console.log('Last Ping:', store.dateLastPinged);
  }
  const render = Component => {
    ReactDOM.render(
      <AppContainer>
        <Provider
          store={store}
          api={store.api}
          config={store.config}
          profileStore={store.profileStore}
        >
          <Component />
        </Provider>
      </AppContainer>,
      rootEl
    );
  };

  render(App);

  // if any exception happens in non-byo mode, code beyond this point won't get executed

  if (process.env.NODE_ENV === 'development') {
    // Hot Module Replacement API
    if (module.hot) {
      module.hot.accept('./components/App', () => {
        render(App);
      });
    }

    // developers should see the red screen of death ASAP
    if (IS_ELECTRON) {
      ipcRenderer.send(EventType.APP_READY);
    }
  }
};

Broker.once(EventType.APP_READY, renderApp);

Broker.once(EventType.APP_RENDERED, () => {
  if (IS_ELECTRON) {
    ipcRenderer.send(EventType.APP_READY);
  }
});

Broker.once(EventType.APP_CRASHED, () => {
  logToMain('error', 'App window crashed!');
  console.error('App window crashed');
  if (IS_ELECTRON) {
    // make a backup of the old stateStore
    store
      .backup()
      .then(() => {
        store = new Store(true);
        store.saveSync();
        // try to reload once
        ipcRenderer.send(EventType.APP_CRASHED);
      })
      .catch(err => {
        const { remote } = window.require('electron');
        const { dialog } = remote;
        const currentWindow = remote.getCurrentWindow();

        dialog.showMessageBox(currentWindow, {
          title: 'Error',
          buttons: ['OK'],
          message: err.message
        });
      });
  }
});

if (IS_ELECTRON) {
  const { ipcRenderer } = window.require('electron');

  ipcRenderer.on('shouldShowConfirmationDialog', () => {
    ipcRenderer.send(
      'shouldShowConfirmationDialog-reply',
      store.hasUnsavedEditorTabs()
    );
  });

  ipcRenderer.on('windowClosing', () => {
    logToMain('notice', 'executing app closing logic...');

    Broker.emit(EventType.WINDOW_CLOSING);

    // TODO: verify this logic
    // store.closeConnection();
  });
}

// NOTE: we cannot use this to show confirmation dialog because of this bug:
// https://github.com/electron/electron/issues/9966
window.onbeforeunload = () => {
  logToMain('notice', 'executing app refreshing logic...');

  Broker.emit(EventType.WINDOW_REFRESHING);
  store.api && store.api.deleteProfileFromDrill({ removeAll: true });
  ReactDOM.unmountComponentAtNode(rootEl);

  // save store anyway
  store.saveSync();
};

store = new Store();
window.store = store;
window.mobx = mobx;
