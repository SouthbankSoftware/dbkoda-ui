/**
 * @flow
 *
 * @Author: Chris Trott <christrott>
 * @Date:   2018-04-16T14:56:12+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-26T16:12:32+10:00
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
import React from 'react';
import { inject, observer } from 'mobx-react';
import { NavPanes } from '#/common/Constants';
import MenuItem from '#/common/MenuItem.jsx';
import EditorIcon from '~/styles/icons/home-icon.svg';
import ProfileIcon from '~/styles/icons/connection-icon.svg';
import PerformanceIcon from '~/styles/icons/performance-icon-2.svg';
import ProfilingIcon from '~/styles/icons/profiling-icon-2.svg';
import TopCommandsIcon from '~/styles/icons/top-commands-icon.svg';

import './Panel.scss';

type NavPane = string;

type Props = {
  store: *,
  api: *,
  drawer: { activeNavPane: NavPane },
  menuItems: *
};

type State = {
  menuItems: *
};

@inject(allStores => ({
  store: allStores.store,
  drawer: allStores.store.drawer
}))
@observer
export default class SideNav extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      menuItems: []
    };
    if (props.menuItems) {
      this.state.menuItems = props.menuItems;
    }
  }
  isItemSelected = (itemName: NavPane) => {
    return this.props.drawer.activeNavPane == itemName;
  };

  changeMenuSelected = (itemName: NavPane) => {
    this.props.store.setActiveNavPane(itemName);
  };

  render() {
    const checkMenuItem = itemName => {
      const idx = _.findIndex(this.state.menuItems, item => {
        return item === itemName;
      });
      return idx >= 0;
    };
    return (
      <div className="sideNav">
        {checkMenuItem(NavPanes.EDITOR) && (
          <MenuItem
            name={NavPanes.EDITOR}
            isSelected={this.isItemSelected}
            changeMenu={this.changeMenuSelected}
          >
            <EditorIcon className="dbKodaSVG" />
          </MenuItem>
        )}
        {checkMenuItem(NavPanes.PROFILE) && (
          <MenuItem
            name={NavPanes.PROFILE}
            isSelected={this.isItemSelected}
            changeMenu={this.changeMenuSelected}
          >
            <ProfileIcon className="dbKodaSVG" />
          </MenuItem>
        )}
        {checkMenuItem(NavPanes.PERFORMANCE) && (
          <MenuItem
            name={NavPanes.PERFORMANCE}
            isSelected={this.isItemSelected}
            changeMenu={this.changeMenuSelected}
          >
            <PerformanceIcon className="dbKodaSVG" />
          </MenuItem>
        )}
        {checkMenuItem(NavPanes.TOP_COMMANDS) && (
          <MenuItem
            name={NavPanes.TOP_COMMANDS}
            isSelected={this.isItemSelected}
            changeMenu={this.changeMenuSelected}
          >
            <TopCommandsIcon className="dbKodaSVG" />
          </MenuItem>
        )}
        {checkMenuItem(NavPanes.PROFILING) && (
          <MenuItem
            name={NavPanes.PROFILING}
            isSelected={this.isItemSelected}
            changeMenu={this.changeMenuSelected}
          >
            <ProfilingIcon className="dbKodaSVG" />
          </MenuItem>
        )}
      </div>
    );
  }
}
