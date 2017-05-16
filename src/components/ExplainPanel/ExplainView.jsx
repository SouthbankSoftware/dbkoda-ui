/**
 * explain view used to show explain panel
 */

import React from 'react';
import {toJS} from 'mobx';

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
        return (<div className="explain-stage">
          {stage.stage}
        </div>);
      })
    }
  </div>);
};

//
// /**
//  * find execution state by the given stage name
//  */
// export const findExecutionStage = (stages, stage) => {
//   let currentStage = stages;
//   while (currentStage) {
//     if (currentStage.stage === stage) {
//       return currentStage;
//     }
//     currentStage = currentStage.inputStage;
//   }
// };

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
  return stages;
};

// /**
//  * show winning plain
//  */
// const WinningPlain = ({explain, type}) => {
//   let stages;
//   switch (type) {
//     case Types.ALL_PLANS_EXECUTION:
//     case Types.EXECUTION_STATS:
//       stages = getExecutionStages(explain.executionStats.executionStages);
//       return (<StageProgress stages={stages} />);
//     default:
//       stages = getExecutionStages(explain.queryPlanner.winningPlan);
//       return (<div style={{marginLeft: 10}}>
//         {
//           stages.map((stage, i) => {
//             return (<div key={'execution-stage'} style={{display: 'flex'}}>
//               <Popover
//                 content={<JSONTree data={stages[0]} />}
//                 interactionKind={PopoverInteractionKind.CLICK}
//                 popoverClassName="explain-stage-detail-popup"
//                 position={Position.TOP_RIGHT}
//                 useSmartPositioning={false}
//               >
//                 <Button className="explain-stage-button">{stages[i].stage}</Button>
//               </Popover>
//             </div>);
//           })
//         }
//       </div>);
//   }
// };


const ExplainView = ({explains}) => {
  if (!explains || !explains.output) {
    return null;
  }
  const output = toJS(explains.output);
  const stages = getExecutionStages(output.executionStats.executionStages);

  return (<div className="explain-view-panel">
    <StageProgress stages={stages} />
  </div>);
};

export default ExplainView;
