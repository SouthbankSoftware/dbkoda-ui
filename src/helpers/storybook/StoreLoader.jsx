/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-07-06T09:49:11+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-10T15:31:02+10:00
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
import { Provider, observer } from 'mobx-react';
import * as mobx from 'mobx';
import { configure, observable } from 'mobx';
import { Broker, EventType } from '~/helpers/broker';
import Store from '~/stores/global';

configure({ enforceActions: true });

if (!global.mobx) {
  global.mobx = mobx;
}

const storeLoaded = observable.box(false);

if (!global.store) {
  global.store = new Store();
  Broker.once(EventType.APP_READY, () => {
    storeLoaded.set(true);
  });
} else {
  storeLoaded.set(true);
}

@observer
export default class StoreLoader extends React.Component<*, *> {
  componentDidMount() {}

  render() {
    if (storeLoaded.get()) {
      return (
        <Provider
          store={global.store}
          api={global.store.api}
          configStore={global.store.configStore}
          profileStore={global.store.profileStore}
        >
          {this.props.children}
        </Provider>
      );
    }

    return <div>Loading...</div>;
  }
}
