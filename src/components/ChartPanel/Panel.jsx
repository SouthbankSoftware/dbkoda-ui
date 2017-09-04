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

import React from 'react';
import SplitPane from 'react-split-pane';
import DataTree from './DataTree';
import BarChart from './BarChart';
import './Panel.scss';

export default class ChartPanel extends React.Component {
  static defaultProps = {};

  static PropTypes = {
    data: React.PropTypes.object.isRequired,
  };

  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (
      <div className="ChartPanel">
        <SplitPane
          className="SplitPane"
          split="vertical"
          defaultSize={250}
          minSize={50}
          maxSize={1000}
          pane2Style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <DataTree />
          <BarChart />
        </SplitPane>
      </div>
    );
  }
}
