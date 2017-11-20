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
 * @Author: chris
 * @Date:   2017-09-27T10:39:11+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-10-06T12:06:38+11:00
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
import { AnchorButton, Tooltip, Intent, Position } from '@blueprintjs/core';

@inject(allStores => ({
  store: allStores.store,
}))
@observer
export default class MenuItem extends React.Component {
  render() {
    const itemClass = this.props.isSelected(this.props.name) ? 'menuItem selected' : 'menuItem';
    return (
      <div className={itemClass}>
        <Tooltip
          intent={Intent.PRIMARY}
          hoverOpenDelay={1000}
          content={this.props.name}
          tooltipClassName="pt-dark"
          position={Position.TOP}
        >
          <AnchorButton
            className={`menuItem${this.props.name}`}
            onClick={() => this.props.changeMenu(this.props.name)}
          >
            {this.props.children}
          </AnchorButton>
        </Tooltip>
      </div>
    );
  }
}
