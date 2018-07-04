/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-23T11:55:14+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-03T16:22:48+10:00
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

import * as React from 'react';
import { Provider, observer, inject } from 'mobx-react';
import { observable } from 'mobx';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, number, select, boolean, array } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
// mimicking the same css env as in app
import 'normalize.css/normalize.css';
import '~/styles/global.scss';
import '#/App.scss';
import ConfigStore from '~/stores/config';
import ConfigEntry from './ConfigEntry';

global.PATHS = {
  configPath: '/test/path/config.yml'
};
const store = observable({
  configPanel: {
    currentMenu: 'Home',
    // $FlowFixMe
    changes: observable.map(null),
    // $FlowFixMe
    errors: observable.map(null)
  }
});
const configStore = new ConfigStore();

@inject(({ store, configStore }) => {
  return {
    store,
    configStore
  };
})
@observer
class LOADER extends React.Component<*, *> {
  componentDidMount() {
    const { configStore } = this.props;

    configStore.load();
  }

  render() {
    const { configStore } = this.props;

    if (configStore.config) {
      return <ConfigEntry />;
    }

    return null;
  }
}

storiesOf('ConfigEntry', module)
  .addDecorator(withKnobs)
  .add('normal', () => (
    <Provider store={store} configStore={configStore}>
      <LOADER />
    </Provider>
  ));
