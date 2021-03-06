/**
 * @Author: chris
 * @Date:   2017-09-27T10:39:11+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-14T13:53:18+11:00
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
import { action } from 'mobx';
import { inject, observer } from 'mobx-react';
import MenuItem from '#/common/MenuItem';
import PasswordStoreIcon from '~/styles/icons/lock-icon.svg';
import HomeSectionIcon from '~/styles/icons/color/home-icon.svg';
import PathsSectionIcon from '~/styles/icons/color/folder-icon.svg';
import ApplicationSectionIcon from '~/styles/icons/color/settings-icon.svg';
import ShortcutsSectionIcon from '~/styles/icons/color/keys-icon.svg';
import PerformanceSectionIcon from '~/styles/icons/color/performance-icon.svg';
import EditorSectionIcon from '~/styles/icons/color/editor-icon.svg';
// import FeaturesSectionIcon from '~/styles/icons/color/new-icon.svg';

@inject(allStores => ({
  store: allStores.store
}))
@observer
export default class Menu extends React.Component {
  @action.bound
  isItemSelected(itemName) {
    return this.props.selectedMenu === itemName;
  }

  @action.bound
  changeMenuSelected(menuName) {
    this.props.store.configPage.selectedMenu = menuName;
  }

  render() {
    return (
      <div className="configMenu">
        <MenuItem name="Home" isSelected={this.isItemSelected} changeMenu={this.changeMenuSelected}>
          <HomeSectionIcon className="dbKodaSVG" width={20} height={20} />
        </MenuItem>
        <MenuItem
          name="Application"
          isSelected={this.isItemSelected}
          changeMenu={this.changeMenuSelected}
        >
          <ApplicationSectionIcon className="dbKodaSVG" width={20} height={20} />
        </MenuItem>
        <MenuItem
          name="Paths"
          isSelected={this.isItemSelected}
          changeMenu={this.changeMenuSelected}
        >
          <PathsSectionIcon className="dbKodaSVG" width={20} height={20} />
        </MenuItem>
        <MenuItem
          name="Performance"
          isSelected={this.isItemSelected}
          changeMenu={this.changeMenuSelected}
        >
          <PerformanceSectionIcon className="dbKodaSVG" width={20} height={20} />
        </MenuItem>
        <MenuItem
          name="Editor"
          isSelected={this.isItemSelected}
          changeMenu={this.changeMenuSelected}
        >
          <EditorSectionIcon className="dbKodaSVG" width={20} height={20} />
        </MenuItem>
        <MenuItem
          name="PasswordStore"
          isSelected={this.isItemSelected}
          changeMenu={this.changeMenuSelected}
        >
          <PasswordStoreIcon className="dbKodaSVG" width={20} height={20} />
        </MenuItem>
        <MenuItem
          name="Shortcuts"
          isSelected={this.isItemSelected}
          changeMenu={this.changeMenuSelected}
        >
          <ShortcutsSectionIcon className="dbKodaSVG" width={20} height={20} />
        </MenuItem>
        {/* @TODO -> Re add this section once we have appropriate content.
        <MenuItem
          name="UserGuide"
          isSelected={this.isItemSelected}
          changeMenu={this.changeMenuSelected}
        >
          <FeaturesSectionIcon className="dbKodaSVG" width={20} height={20} />
        </MenuItem> */}
      </div>
    );
  }
}
