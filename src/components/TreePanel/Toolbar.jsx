/**
* @Author: Wahaj Shamim <wahaj>
* @Date:   2017-03-07T12:00:43+11:00
* @Email:  wahaj@southbanksoftware.com
* @Last modified by:   wahaj
* @Last modified time: 2017-03-08T14:34:00+11:00
*/

import React from 'react';
import { Button, Menu, MenuItem, MenuDivider, Popover, Position } from '@blueprintjs/core';

export default class TreeToolbar extends React.Component {
  render() {
    const menu = (
      <Menu className="pt-dark">
        <MenuItem text="New" />
        <MenuItem text="Open" />
        <MenuItem text="Save" />
        <MenuDivider />
        <MenuItem text="Settings..." />
      </Menu>
    );
    return (
      <nav className="pt-navbar pt-dark .modifier">
        <div className="pt-navbar-group pt-align-left">
          <div className="pt-navbar-heading">DBEnvy</div>
          <input className="pt-input" placeholder="Search..." type="text" />
        </div>
        <div className="pt-navbar-group pt-align-right">
          <Popover content={menu} position={Position.BOTTOM_RIGHT}>
            <Button text="Actions" />
          </Popover>
        </div>
      </nav>
    );
  }
}
