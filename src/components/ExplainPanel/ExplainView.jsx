/**
 * explain view used to show explain panel
 */

import React from 'react';
import {toJS} from 'mobx';
import {Cell, Column, Table} from '@blueprintjs/table';
// import {Button, Popover, PopoverInteractionKind, Position} from '@blueprintjs/core';
// import JSONTree from 'react-json-tree';
// import {theme} from './JsonTreeTheme';
import './style.scss';
// import {Types} from './Types';


export const StageProgress = ({stages}) => {
  console.log('stages ', stages);
  return (<div className="explain-stage-progress">
    {
      stages.map((stage) => {
        return (<div className="explain-stage" key={stage.stage}>
          {stage.stage}
        </div>);
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

export const renderCell = (rowIndex) => {
  return <Cell>{`$${(rowIndex * 10).toFixed(2)}`}</Cell>;
};

export const StepsTable = (stages) => {
  return (<div className="explain-stages-table"><Table numRows={stages.length}>
    <Column name="Seq" renderCell={<div>Seq</div>} />
    <Column name="Step" renderCell={<div>Step</div>} />
    <Column name="ms" renderCell={<div>ms</div>} />
    <Column name="Examined" renderCell={<div>Examined</div>} />
    <Column name="Comments" renderCell={<div>Comments</div>} />
  </Table></div>);
};

const ExplainView = ({explains}) => {
  if (!explains || !explains.output) {
    return null;
  }
  const output = toJS(explains.output);
  const stages = getExecutionStages(output.executionStats.executionStages);

  return (<div className="explain-view-panel">
    <StageProgress stages={stages} />
    <StepsTable stages={stages} />
  </div>);
};

export default ExplainView;
