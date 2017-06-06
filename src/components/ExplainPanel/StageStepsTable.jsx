/**
 * Created by joey on 6/6/17.
 */


import React from 'react';
import './style.scss';

import {generateComments} from './ExplainStep';

export const StageStepsTable = ({stages}) => {
  let mergedStages = [];
  stages.map((stage) => {
    if (stage.constructor === Array) {
      mergedStages = mergedStages.concat(stage);
    } else {
      mergedStages.push(stage);
    }
  });
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
