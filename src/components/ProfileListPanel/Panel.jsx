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

/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-15 13:33:53
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-06-13T16:37:15+10:00
*/

/* eslint-disable react/no-string-refs */
/* eslint-disable react/prop-types */
import React from 'react';
import { inject, observer } from 'mobx-react';
import DBKodaIcon from '../../styles/icons/dbkoda-logo.svg';
import { terminalTypes } from '~/api/Terminal';
import { ContextMenuTarget, Menu, MenuItem, Intent } from '@blueprintjs/core';
import Toolbar from './Toolbar.jsx';
import ListView from './ListView.jsx';
import './styles.scss';

@inject('store', 'api')
@observer
@ContextMenuTarget
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderContextMenu(event) {
    const menuItems = [];
    menuItems.push(
      <div key={menuItems.length} className="menuItemWrapper">
        <MenuItem
          className="profileListContextMenu newLocalTerminal"
          onClick={() => {
            const { addTerminal } = this.props.api;
            addTerminal(terminalTypes.local);
          }}
          text={globalString('profile/menu/newLocalTerminal')}
          intent={Intent.NONE}
          iconName="pt-icon-new-text-box"
        />
      </div>
    );

    return <Menu className="profilePanelContextMenu">{menuItems}</Menu>;
  }

  render() {
    return (
      <div className="pt-dark profileListPanel">
        <Toolbar ref="toolbar" />
        <DBKodaIcon className="dbKodaLogo" width={20} height={20} />
        <ListView />
      </div>
    );
  }
}
