/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-26T13:19:02+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-22T15:21:07+11:00
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

import React from 'react';
import ReactDOM from 'react-dom';
import * as mobx from 'mobx';
import { configure } from 'mobx';
import { Provider } from 'mobx-react';
import { AppContainer } from 'react-hot-loader';
import Store from '~/window/stores/performance';
import PerformanceWindow from '~/window/PerformanceWindow';

configure({ enforceActions: true });

const rootEl = document.getElementById('root');

const store = new Store();

ReactDOM.render(
  <AppContainer>
    <Provider store={store} api={store.api} config={store.config} profileStore={store.profileStore}>
      <PerformanceWindow />
    </Provider>
  </AppContainer>,
  rootEl
);

window.store = store;
window.mobx = mobx;
