/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-03-01T13:48:11+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-03-01T16:49:37+11:00
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
import { inject, observer } from 'mobx-react';
import { PerformancePanel } from '#/PerformancePanel';

import 'normalize.css/normalize.css';
import '@blueprintjs/core/dist/blueprint.css';
import '@blueprintjs/table/dist/table.css';
import '~/styles/global.scss';
import '~/styles/fonts/index.css';
import '#/App.scss';

 @inject(allStores => ({
   store: allStores.store
 }))
 @observer
class PerformanceWindow extends React.Component {
  performancePanelVisible = true;
  constructor() {
    super();
    document.addEventListener('visibilitychange', this._handleAppVisibility, false);
  }
  render() {
    const { store } = this.props;

    return (
      <div>
        {store.performancePanel && this.performancePanelVisible ? (
          <PerformancePanel
            performancePanel={store.performancePanel}
            onClose={null}
          />
        ) : (
          <div><span>Loading Performance Panel...</span></div>
        )}
      </div>
    );
  }
  _handleAppVisibility() {
    if (document.hidden) {
      console.log('App is Hidden!!!');
      this.performancePanelVisible = false;
    } else {
      console.log('App is Visible!!!');
      this.performancePanelVisible = true;
    }
  }
}

export default PerformanceWindow;
