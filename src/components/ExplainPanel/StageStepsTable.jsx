/**
 * Created by joey on 6/6/17.
 */


import React from 'react';
import './style.scss';

import {generateComments} from './ExplainStep';

const getExamined = (stage) => {
  if (stage.stage === 'IXSCAN') {
    return stage.keysExamined;
  }
  if (!stage.totalDocsExamined) {
    return stage.docsExamined;
  }
  return stage.totalDocsExamined;
};

const getWorstShardStages = (stages) => {
  let max = -1;
  let worst = null;
  stages.map((shard) => {
    if (shard.stages && shard.stages.length > 0) {
      if (worst === null) {
        worst = shard.stages;
      }
      if (max < shard.stages[0].executionTimeMillisEstimate) {
        max = shard.stages[0].executionTimeMillisEstimate;
        worst = shard.stages;
      }
    }
  });
  return worst;
};

export const StageStepsTable = ({stages, shard, shardMergeStage}) => {
  let mergedStages = [];
  const fStages = shardMergeStage && shard ? getWorstShardStages(stages) : stages;
  if (shard) {
    fStages.push(shardMergeStage);
  }
  fStages.map((stage) => {
    if (stage.constructor === Array) {
      mergedStages = mergedStages.concat(stage);
    } else {
      mergedStages.push(stage);
    }
  });

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
      mergedStages.map((stage, i) => {
        const id = i;
        return (<div className="stage-row" key={stage.stage + '-' + id}>
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
