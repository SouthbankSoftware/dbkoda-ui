import {Button, Menu, MenuItem, MenuDivider, Popover, Position} from "@blueprintjs/core";
import React from 'react';

export const BlueprintDemo = () => {
  const menu = (
    <Menu className="pt-dark">
      <MenuItem text="New"/>
      <MenuItem text="Open"/>
      <MenuItem text="Save"/>
      <MenuDivider />
      <MenuItem text="Settings..."/>
    </Menu>
  );

  return <Popover content={menu} position={Position.BOTTOM_RIGHT}>
    <Button text="Actions"/>
  </Popover>


}