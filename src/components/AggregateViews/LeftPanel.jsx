/**
 * @Author: Michael Harrison
 * @Date:   2017-07-19 11:17:46
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-30T00:22:23+10:00
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
import EnhancedSplitPane from '#/common/EnhancedSplitPane';
import Palette from './Palette';
import Details from './Details';
import './style.scss';

@inject(allStores => ({
  store: allStores.store
}))
@observer
export default class LeftPanel extends React.Component {
  splitPane2Style = {
    display: 'flex',
    flexDirection: 'column'
  };

  render() {
    return (
      <div className="aggregateLeftPanel">
        <EnhancedSplitPane
          className="LeftSplitPane"
          split="horizontal"
          defaultSize={300}
          minSize={250}
          maxSize={1000}
          pane2Style={this.splitPane2Style}
        >
          <Palette />
          <Details />
        </EnhancedSplitPane>
      </div>
    );
  }
}
