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
import {generateComments} from './ExplainStep';
import QueryCommandView from './QueryCommandView';

export const Stage = ({stage}) => {
  return (<div className="explain-stage">
    {stage.stage}
  </div>);
};

export const StageProgress = ({stages}) => {
  return (<div className="explain-stage-progress">
    {
      stages.map((stage) => {
        return (<Stage stage={stage} key={stage.stage} />);
      })
    }
  </div>);
};

/**
 * get execution stages array
 */
export const getExecutionStages = (executionStages) => {
  const stages = [];
  if (executionStages) {
    let currentStage = executionStages;
    while (currentStage) {
      stages.push(currentStage);
      currentStage = currentStage.inputStage;
    }
  }
  return stages.reverse();
};

export const StepsTable = ({stages}) => {
  const getExamined = (stage) => {
    if (stage.stage === 'IXSCAN') {
      return stage.keysExamined;
    }
    if (stage.stage.indexOf('SHARD') >= 0) {
      return stage.totalDocsExamined;
    }
    return stage.docsExamined;
  };
  return (<div className="explain-stages-table">
    <div className="stage-header">
      <div className="column-header">Seq</div>
      <div className="column-header">Step</div>
      <div className="column-header">ms</div>
      <div className="column-header">Examined</div>
      <div className="column-header">Return</div>
      <div className="column-header">Comment</div>
    </div>
    {
      stages.map((stage, i) => {
        return (<div className="stage-row" key={stage.stage}>
          <div className="stage-cell">{i + 1}</div>
          <div className="stage-cell">{stage.stage}</div>
          <div className="stage-cell">
            <div className="text">{stage.executionTimeMillisEstimate || stage.executionTimeMillis}</div>
          </div>
          <div className="stage-cell">
            <div className="text">{getExamined(stage)}</div>
          </div>
          <div className="stage-cell">
            <div className="text">{stage.nReturned}</div>
          </div>
          <div className="stage-cell">{generateComments(stage)}</div>
        </div>);
      })
    }
  </div>);
};

/**
 * common statistic view panel
 */
const StatisicView = ({explains}) => {
  const {executionStats} = explains;
  return (<div className="explain-statistic-view">
    <div className="header">
      <div>{globalString('explain/view/statisticHeader')}</div>
      <div>Value</div>
    </div>
    <div className="row">
      <div>{globalString('explain/view/docsReturned')}</div>
      <div>{executionStats.nReturned}</div>
    </div>
    <div className="row">
      <div>{globalString('explain/view/keysExamined')}</div>
      <div>{executionStats.totalKeysExamined}</div>
    </div>
    <div className="row">
      <div>{globalString('explain/view/docsExamined')}</div>
      <div>{executionStats.totalDocsExamined}</div>
    </div>
  </div>);
};

const getAllShardStatistics = (explains) => {
  const shards = explains.executionStats.executionStages.shards;
  const allShards = [];
  shards.map((shard) => {
    const oneShard = [];
    let cursor = shard.executionStages;
    while (cursor) {
      oneShard.push(cursor);
      cursor = cursor.inputStage;
    }
    // get the executionTimeMillisEstimate and nReturned from the first child, docsExamined from the deepest child
    oneShard[0].docsExamined = oneShard[oneShard.length - 1].docsExamined;
    oneShard[0].shardName = shard.shardName;
    allShards.push(oneShard);
  });
  return allShards;
};

export const getWorstShardStatistics = (explains) => {
  const allShards = getAllShardStatistics(explains);
  const worstShards = [];
  allShards.map((shards) => {
    worstShards.push(shards[0]);
  });
  return worstShards;
};

/**
 * shard statistic view panel
 */
const ShardStatisticView = ({explains}) => {
  const shardStatistics = getWorstShardStatistics(explains);
  return (<div className="explain-shards-statistic-view">
    <div className="header">
      <div className="column">{globalString('explain/statistics/shard')}</div>
      <div className="column">{globalString('explain/statistics/examined')}</div>
      <div className="column">{globalString('explain/statistics/returned')}</div>
      <div className="column">{globalString('explain/statistics/ms')}</div>
    </div>
    {
      shardStatistics.map((shard) => {
        return (<div className="row" key={shard.shardName}>
          <div className="cell">{shard.shardName}</div>
          <div className="cell">{shard.docsExamined}</div>
          <div className="cell">{shard.nReturned}</div>
          <div className="cell">{shard.executionTimeMillisEstimate}</div>
        </div>);
      })
    }
  </div>);
};

const CommandPanel = ({command, namespace}) => {
  return <QueryCommandView command={command} namespace={namespace} />;
};

const ExplainView = ({explains}) => {
  if (!explains || !explains.output) {
    return null;
  }
  const output = toJS(explains.output);
  const commandPanel = explains.command ? <CommandPanel command={explains.command} namespace={output.queryPlanner.namespace} /> : null;
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
    <StepsTable stages={stages} />
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
