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
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import { AnchorButton, Tooltip, Intent, Position } from '@blueprintjs/core';
import ApplicationIcon from '~/styles/icons/menu-application-icon.svg';
import PathsIcon from '~/styles/icons/menu-paths-icon.svg';

@inject(allStores => ({
  store: allStores.store
}))
@observer
export default class Menu extends React.Component {
  getItemClass(itemText) {
    return (this.props.selectedMenu === itemText) ?
      `menuItem${itemText} selected` :
      `menuItem${itemText}`;
  }

  @action
  changeMenuSelected(menuName, e) {
    this.props.store.configPage.selectedMenu = menuName;
  }

  render() {
    return (
      <div className="configMenu">
        <Tooltip
          intent={Intent.PRIMARY}
          hoverOpenDelay={1000}
          content="Application"
          tooltipClassName="pt-dark"
          position={Position.TOP}
        >
          <AnchorButton className={this.getItemClass('Application')} onClick={(e) => this.changeMenuSelected('Application')}>
            <ApplicationIcon className="dbKodaSVG" width={20} height={20} />
          </AnchorButton>
        </Tooltip>
        <Tooltip
          intent={Intent.PRIMARY}
          hoverOpenDelay={1000}
          content="Paths"
          tooltipClassName="pt-dark"
          position={Position.TOP}
        >
          <AnchorButton className={this.getItemClass('Paths')} onClick={(e) => this.changeMenuSelected('Paths')}>
            <PathsIcon className="dbKodaSVG" width={20} height={20} />
          </AnchorButton>
        </Tooltip>
      </div>
    );
  }
}
