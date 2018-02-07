/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-13T10:36:10+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-12T02:44:26+11:00
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
import Config from '~/stores/config';
import Profiles from '~/stores/profiles';
import DataCenter from '~/api/DataCenter';
import React from 'react';
import ReactDOM from 'react-dom';
import mobx, { useStrict } from 'mobx';
import { Provider } from 'mobx-react';
import { AppContainer } from 'react-hot-loader';
import { Broker, EventType } from './helpers/broker';

// Patching Blueprint JS' ContextMenuTarget to always use light theme
//
// which is a better alternative to old hack:
// HACK workaround for https://github.com/palantir/blueprint/issues/1539
// setTimeout(() => {
//   document.querySelector('.pt-popover.pt-minimal.pt-dark').classList.remove('pt-dark');
// });
const _ = require('lodash');
const blueprintJs = require('@blueprintjs/core');

const { ContextMenu } = blueprintJs;

console.log(blueprintJs.ContextMenuTarget.toString());

blueprintJs.ContextMenuTarget = function ContextMenuTarget(constructor) {
  const { render, onContextMenuClose } = constructor.prototype;

  // patching classes like this requires preserving function context
  // tslint:disable-next-line only-arrow-functions
  constructor.prototype.render = function() {
    const _this = this;
    /* tslint:disable:no-invalid-this */
    const element = render.call(this);
    if (element == null) {
      // always return `element` in case caller is distinguishing between `null` and `undefined`
      return element;
    }
    const oldOnContextMenu = element.props.onContextMenu;
    const onContextMenu = function(e) {
      // support nested menus (inner menu target would have called preventDefault())
      if (e.defaultPrevented) {
        return;
      }
      if (_.isFunction(_this.renderContextMenu)) {
        const menu = _this.renderContextMenu(e);
        if (menu != null) {
          const darkTheme = false;
          e.preventDefault();
          ContextMenu.show(
            menu,
            { left: e.clientX, top: e.clientY },
            onContextMenuClose,
            darkTheme
          );
        }
      }
      if (_.isFunction(oldOnContextMenu)) {
        oldOnContextMenu(e);
      }
    };
    return React.cloneElement(element, { onContextMenu });
    /* tslint:enable:no-invalid-this */
  };
};

const App = require('./components/App').default;

const Globalize = require('globalize'); // doesn't work well with import

global.globalString = (path, ...params) =>
  Globalize.messageFormatter(path)(...params);
global.globalNumber = (value, config) =>
  Globalize.numberFormatter(config)(value);

useStrict(true);

const rootEl = document.getElementById('root');

let store;
let api;
let config;
let profileStore;

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
          api={api}
          config={config}
          profileStore={profileStore}
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
  config.load();
  profileStore.load();
  if (IS_ELECTRON) {
    ipcRenderer.send(EventType.APP_READY);
  }
});

Broker.once(EventType.APP_CRASHED, () => {
  console.error('Woah...App Crashed !!!!!!!');
  if (IS_ELECTRON) {
    // make a backup of the old stateStore
    store
      .backup()
      .then(() => {
        store = new Store(true);
        api = new DataCenter(store);
        config = new Config();
        profileStore = new Profiles();
        store.setProfileStore(profileStore); // TODO: remove this dependency
        store.setAPI(api); // TODO: Remove this line after complete migration to API
        store.saveSync();
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

window.addEventListener('beforeunload', event => {
  let shouldUnmount = true;

  if (IS_ELECTRON) {
    const { remote } = window.require('electron');
    const { dialog } = remote;
    const currentWindow = remote.getCurrentWindow();

    if (!UAT && store.hasUnsavedEditorTabs()) {
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
config = new Config();
profileStore = new Profiles();
api = new DataCenter(store, config, profileStore);
store.setProfileStore(profileStore);
store.setAPI(api); // TODO: Remove this line after complete migration to API
window.api = api;
window.store = store;
window.config = config;
window.profileStore = profileStore;
window.mobx = mobx;
