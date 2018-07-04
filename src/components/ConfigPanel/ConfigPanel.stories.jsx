/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-23T11:55:14+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-04T16:44:16+10:00
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

import _ from 'lodash';
import 'regenerator-runtime/runtime';
import * as React from 'react';
import { Provider } from 'mobx-react';
import * as mobx from 'mobx';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
// import { withKnobs, text, number, select, boolean, array } from '@storybook/addon-knobs';
// import { action } from '@storybook/addon-actions';
// mimicking the same css env as in app
import 'normalize.css/normalize.css';
import '~/styles/global.scss';
import '#/App.scss';
import { Broker, EventType } from '~/helpers/broker';
import Store from '~/stores/global';
import { en as globalStrings } from '~/messages/en.json';
import ConfigEntry from './ConfigEntry';

const store = new Store();
global.store = store;
global.mobx = mobx;
global.globalString = (path: string) => {
  return _.get(globalStrings, path.split('/'));
};
let storeLoaded = false;

class LOADER extends React.Component<*, *> {
  componentDidMount() {
    Broker.once(EventType.APP_READY, () => {
      storeLoaded = true;
      this.forceUpdate();
    });
  }

  render() {
    if (storeLoaded) {
      return <ConfigEntry />;
    }

    return null;
  }
}

storiesOf('ConfigEntry', module)
  .addDecorator(withKnobs)
  .add('normal', () => (
    <Provider
      store={store}
      api={store.api}
      configStore={store.configStore}
      profileStore={store.profileStore}
    >
      <LOADER />
    </Provider>
  ));
