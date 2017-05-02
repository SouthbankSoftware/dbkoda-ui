/**
 * @Author: chris
 * @Date:   2017-05-01T11:45:01+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-01T13:55:54+10:00
 */

/**
 * explain popover menu
 */
import React from 'react';
import {observer} from 'mobx-react';
import {AnchorButton, Intent, Menu, MenuItem, Popover, Position, Tooltip} from '@blueprintjs/core';
import {action} from 'mobx';

const QUERY_PLANNER = 'queryPlanner';
const EXECUTION_STATS = 'executionStats';
const ALL_PLANS_EXECUTION = 'allPlansExecution';

/**
 * set executing explain state
 */
const sendQueryCommand = action((editorPanel, param) => {
  editorPanel.executingExplain = param;
});

/**
 * define the explain popup menu items
 *
 * @param editorPanel
 */
const ExplainMenu = ({editorPanel, editorToolbar}) => {
  let menu;
  if (editorToolbar.noActiveProfile) {
    menu = null;
  } else {
    menu = (<Menu>
      <MenuItem className="queryPlannerButton" text="queryPlanner"
        onClick={() => sendQueryCommand(editorPanel, QUERY_PLANNER)} />
      <MenuItem className="executionStatsButton" text="executionStats" onClick={() => sendQueryCommand(editorPanel, EXECUTION_STATS)} />
      <MenuItem className="allPlansExecutionButton" text="allPlansExecution" onClick={() => sendQueryCommand(editorPanel, ALL_PLANS_EXECUTION)} />
    </Menu>);
  }
  return menu;
};

/**
 * define the popup explain component
 */
export default observer(({editorToolbar, editorPanel}) => (
  <Popover className="explainPopover" content={<ExplainMenu editorPanel={editorPanel} editorToolbar={editorToolbar} />}
    position={Position.BOTTOM_RIGHT}>
    <Tooltip content="Explain"
      intent={Intent.PRIMARY}
      hoverOpenDelay={1000}
      tooltipClassName="pt-dark"
      position={Position.BOTTOM}>
      <AnchorButton className="pt-icon-help pt-intent-primary explainPlanButton"
        loading={editorToolbar.isActiveExecuting}
        disabled={editorToolbar.noActiveProfile} />
    </Tooltip>
  </Popover>
));
