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

const ExplainView = ({explains}) => {
  if (!explains || !explains.output) {
    return null;
  }
  const output = toJS(explains.output);
  const commandPanel = explains.command ?
    <QueryCommandView command={explains.command} namespace={output.queryPlanner.namespace} /> : null;
  if (!output.executionStats) {
    const stages = getExecutionStages(output.queryPlanner.winningPlan);
    return (<div className="explain-view-panel">
      <StageProgress stages={stages} />
      {commandPanel}
    </div>);
  }
  const stages = getExecutionStages(output.executionStats.executionStages);
  return (<div className="explain-view-panel">
    <StageProgress stages={stages} />
    <StageStepsTable stages={stages} />
    <div className="explain-statistic-container-view ">
      <StatisicView explains={output} />
      {
        output.executionStats.executionStages.shards && output.executionStats.executionStages.shards.length > 0
          ? <ShardStatisticView explains={output} /> : null
      }
    </div>
    {commandPanel}
  </div>);
};

export default ExplainView;
