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
 *
 *
 * @Author: mike
 * @Date:   2017-09-13 15:21:01
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-09-13 15:21:05
 */

import React from 'react';
import { AnchorButton, Intent, Position, Tooltip } from '@blueprintjs/core'; // eslint-disable-line
import './style.scss';

export default class Toolbar extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
  }

  render() {
    return (
      <div className="toolbarWrapper">
        <AnchorButton
          className="pt-button pt-intent-primary expandAllButton"
          onClick={this.props.expandAll}
        >
          Expand All
        </AnchorButton>
        <AnchorButton
          className="pt-button pt-intent-primary collapseAllButton"
          onClick={this.props.collapseAll}
        >
          Collapse All
        </AnchorButton>
      </div>
    );
  }
}
