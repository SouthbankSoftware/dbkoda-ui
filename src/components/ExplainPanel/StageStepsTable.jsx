/**
 * Created by joey on 6/6/17.
 */


import React from 'react';
import './style.scss';

import {generateComments} from './ExplainStep';
import {getWorstShardStages} from './Utils';

const getExamined = (stage) => {
  if (stage.stage === 'IXSCAN') {
    return stage.keysExamined;
  }
  if (!stage.totalDocsExamined) {
    return stage.docsExamined;
  }
  return stage.totalDocsExamined;
};

/**
 *
 * @param stages  the stages array for all stages
 * @param shard whether it is a shard explain
 * @param shardMergeStage is the SHARD_MERGE at the last of the explain
 * @constructor
 */
export const StageStepsTable = ({stages, shard, shardMergeStage}) => {
  let mergedStages = [];
  let fStages = stages;
  let shardName = null;
  if (shardMergeStage && shard) {
    const worstShardStages = getWorstShardStages(stages);
    fStages = worstShardStages.worst;
    shardName = worstShardStages.shardName;
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
    {shard ? <div className="explain-worst-shard-description">{globalString('explain/worst-shard', shardName)}</div> : null}
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
        const ms = stage.executionTimeMillisEstimate !== undefined ? stage.executionTimeMillisEstimate : stage.executionTimeMillis;
        return (<div className="stage-row" key={stage.stage + '-' + id}>
          <div className="stage-cell">{i + 1}</div>
          <div className="stage-cell">{stage.stage}</div>
          <div className="stage-cell">
            <div className="text">{ms}</div>
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
