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
 * @Author: chris
 * @Date:   2017-05-22T13:12:04+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T14:01:21+10:00
 */

/**
 * explain view used to show explain panel
 */

import React from 'react';
import {toJS} from 'mobx';
import './style.scss';
import QueryCommandView from './QueryCommandView';
import StageProgress from './StageProgress';
import {StageStepsTable} from './StageStepsTable';
import {getExecutionStages} from './ExplainStep';
import StatisicView from './StatisicView';
import ShardStatisticView from './ShardStatisticView';
import ShardsStageProgress from './ShardsStageProgress';

const ExplainView = ({explains}) => {
  if (!explains || !explains.output) {
    return null;
  }
  const output = toJS(explains.output);
  const commandPanel = explains.command ?
    <QueryCommandView command={explains.command} namespace={output.queryPlanner.namespace} /> : null;
  if (!output.executionStats) {
    // this is query plain
    const executionStages = output.queryPlanner.winningPlan;
    const stages = getExecutionStages(executionStages);
    return (<div className="explain-view-panel">
      {
          executionStages.shards ? <ShardsStageProgress executionStages={executionStages} shardStages={stages} /> :
          <StageProgress stages={stages} />
        }
      {commandPanel}
    </div>
    );
  }
  const executionStages = output.executionStats.executionStages;
  const stages = getExecutionStages(executionStages);
  return (
    <div className="explain-view-panel">
      {
        executionStages.shards ? <ShardsStageProgress executionStages={executionStages} shardStages={stages} /> :
        <StageProgress stages={stages} />
      }
      <StageStepsTable stages={stages} shardMergeStage={executionStages} shard={executionStages.shards !== undefined} />
      <div className="explain-statistic-container-view ">
        <StatisicView explains={output} />
        {
          executionStages.shards && executionStages.shards.length > 0
            ? <ShardStatisticView explains={output} /> : null
        }
      </div>
      {commandPanel}
    </div>
  );
};

export default ExplainView;
