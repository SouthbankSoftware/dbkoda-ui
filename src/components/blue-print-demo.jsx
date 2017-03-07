import {Menu, MenuItem, MenuDivider, Popover, Button, Position} from "@blueprintjs/core";
import React from "react";
import {connectionService} from "../feathers";

export const BlueprintDemo = () => {

  const menu = (
    <Menu className="pt-dark">
      <MenuItem text="New" onClick={() => {
        connectionService().create({}, {query: {url: 'mongodb://dbenvy:DBEnvy2016@ec2-13-54-17-227.ap-southeast-2.compute.amazonaws.com'}})
          .then(r => {
            console.log('response', r);
          })
          .catch(err => {
            console.err(err);
          });
      }}/>
      <MenuItem text="Run..."/>
      <MenuItem text="Save"/>
      <MenuDivider />
      <MenuItem text="Settings..."/>
    </Menu>
  );

  return <Popover content={menu} position={Position.BOTTOM_RIGHT}>
    <Button text="Actions"/>
  </Popover>


}