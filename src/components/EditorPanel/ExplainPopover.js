/**
 * explain popover menu
 */
import React from 'react';
import {observer} from 'mobx-react';
import {Button, Menu, MenuItem, Popover, Position, Tooltip} from '@blueprintjs/core';

const sendQueryCommand = (param) => {

}

const ExplainMenu = () => {
  return (<Menu>
    <MenuItem text="queryPlanner"/>
    <MenuItem text="executionStats"/>
    <MenuItem text="allPlansExecution"/>
  </Menu>);
}

export default observer(({editorToolbar}) => (
  <Popover content={<ExplainMenu/>} position={Position.BOTTOM_RIGHT}>
    <Tooltip content="Explain" position={Position.RIGHT}>
      <Button className="pt-icon-help pt-intent-primary explainPlanButton"
              disabled={editorToolbar.noActiveProfile}/>
    </Tooltip>
  </Popover>
));



