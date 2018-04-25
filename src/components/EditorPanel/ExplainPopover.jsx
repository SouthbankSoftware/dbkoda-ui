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
import { observer } from 'mobx-react';
import {
  AnchorButton,
  Intent,
  Menu,
  MenuItem,
  Popover,
  Position,
  Tooltip
} from '@blueprintjs/core';
import { action } from 'mobx';
import { Broker, EventType } from '../../helpers/broker/index';
import ExplainIcon from '../../styles/icons/explain-query-icon.svg';

const QUERY_PLANNER = 'queryPlanner';
const EXECUTION_STATS = 'executionStats';
const ALL_PLANS_EXECUTION = 'allPlansExecution';

/**
 * set executing explain state
 */
const sendQueryCommand = action(param => {
  Broker.emit(EventType.FEATURE_USE, 'ExplainView');
  const event = EventType.EXECUTION_EXPLAIN_EVENT;
  Broker.emit(event, param);
});

/**
 * define the explain popup menu items
 *
 * @param editorPanel
 */
const ExplainMenu = ({ editorToolbar }) => {
  let menu;
  if (editorToolbar.noActiveProfile) {
    menu = null;
  } else {
    menu = (
      <Menu>
        <MenuItem
          className="queryPlannerButton"
          text={globalString('editor/toolbar/explainQuery')}
          onClick={() => sendQueryCommand(QUERY_PLANNER)}
        />
        <MenuItem
          className="executionStatsButton"
          text={globalString('editor/toolbar/explainExecutionStats')}
          onClick={() => sendQueryCommand(EXECUTION_STATS)}
        />
        <MenuItem
          className="allPlansExecutionButton"
          text={globalString('editor/toolbar/explainAllPlans')}
          onClick={() => sendQueryCommand(ALL_PLANS_EXECUTION)}
        />
      </Menu>
    );
  }
  return menu;
};

/**
 * define the popup explain component
 */
export default observer(({ editorToolbar }) => (
  <Popover
    className="explainPopover"
    content={<ExplainMenu editorToolbar={editorToolbar} />}
    position={Position.BOTTOM_RIGHT}
  >
    <Tooltip
      content={globalString('editor/toolbar/explainTooltip')}
      intent={Intent.PRIMARY}
      hoverOpenDelay={1000}
      tooltipClassName="pt-dark"
      position={Position.BOTTOM}
    >
      <AnchorButton
        className="pt-intent-primary explainPlanButton"
        loading={editorToolbar.isActiveExecuting}
        disabled={editorToolbar.noActiveProfile}
      >
        <ExplainIcon className="dbKodaSVG" width={20} height={20} />
      </AnchorButton>
    </Tooltip>
  </Popover>
));
