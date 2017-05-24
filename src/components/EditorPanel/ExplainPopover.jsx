/**
 * @Author: joey
 * @Date:   2017-05-01T11:45:01+10:00
 * @Email:  joey@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T12:51:07+10:00
 */
/**
 * explain popover menu
 */
import React from 'react';
import {observer} from 'mobx-react';
import {
  AnchorButton,
  Intent,
  Menu,
  MenuItem,
  Popover,
  Position,
  Tooltip
} from '@blueprintjs/core';
import {action} from 'mobx';
import {Broker, EventType} from '../../helpers/broker/index';
import ExplainIcon from '../../styles/icons/explain-query-icon.svg';

const QUERY_PLANNER = 'queryPlanner';
const EXECUTION_STATS = 'executionStats';
const ALL_PLANS_EXECUTION = 'allPlansExecution';

/**
 * set executing explain state
 */
const sendQueryCommand = action((param) => {
  const event = EventType.EXECUTION_EXPLAIN_EVENT;
  console.log('send explain query event ', param);
  Broker.emit(event, param);
});

/**
 * define the explain popup menu items
 *
 * @param editorPanel
 */
const ExplainMenu = ({editorToolbar}) => {
  let menu;
  if (editorToolbar.noActiveProfile) {
    menu = null;
  } else {
    menu = (
      <Menu>
        <MenuItem
          className="queryPlannerButton"
          text={globalString('editor/toolbar/explainQuery')}
          onClick={() => sendQueryCommand(QUERY_PLANNER)} />
        <MenuItem
          className="executionStatsButton"
          text={globalString('editor/toolbar/explainExecutionStats')}
          onClick={() => sendQueryCommand(EXECUTION_STATS)} />
        <MenuItem
          className="allPlansExecutionButton"
          text={globalString('editor/toolbar/explainAllPlans')}
          onClick={() => sendQueryCommand(ALL_PLANS_EXECUTION)} />
      </Menu>
    );
  }
  return menu;
};

/**
 * define the popup explain component
 */
export default observer(({editorToolbar}) => (
  <Popover
    className="explainPopover"
    content={<ExplainMenu editorToolbar ={
    editorToolbar
  } />}
    position={Position.BOTTOM_RIGHT}>
    <Tooltip
      content={globalString('editor/toolbar/explainTooltip')}
      intent={Intent.PRIMARY}
      hoverOpenDelay={1000}
      tooltipClassName="pt-dark"
      position={Position.BOTTOM}>
      <AnchorButton
        className="pt-intent-primary explainPlanButton"
        loading={editorToolbar.isActiveExecuting}
        disabled={editorToolbar.noActiveProfile}>
        <ExplainIcon width={20} height={20} />
      </AnchorButton>
    </Tooltip>
  </Popover>
));
