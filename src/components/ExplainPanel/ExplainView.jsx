import React from 'react';
import './style.scss';
import {Types} from './Types';
import {Button, Popover, PopoverInteractionKind, Position} from '@blueprintjs/core';
import JSONTree from 'react-json-tree';

/**
 * show explain command information
 */
const ExplainCommandInfo = ({explain, command}) => {
  console.log('command info ', explain, command);
  return (
    <div className="explain-command-info">
      <ul>
        <li className="label">
          NameSpace:
        </li>
        <li className="label">Query Command:</li>
      </ul>
      <ul>
        <li>{explain.queryPlanner.namespace}</li>
        <li>{command}</li>
      </ul>
    </div>
  );
};

export const findExecutionStage = (stages, stage) => {
  let currentStage = stages;
  while (currentStage) {
    if (currentStage.stage === stage) {
      return currentStage;
    }
    currentStage = currentStage.inputStage;
  }
};

export const getExecutionStages = (executionStages) => {
  const stages = [];
  if (executionStages) {
    let currentStage = executionStages;
    while (currentStage) {
      stages.push(currentStage);
      currentStage = currentStage.inputStage;
    }
  } else {
    stages.push(explain.queryPlanner.winningPlan);
  }
  return stages;
};

/**
 * show winning plain
 */
const WinningPlain = ({explain, type}) => {
  let stages;
  switch (type) {
    case Types.ALL_PLANS_EXECUTION:
    case Types.EXECUTION_STATS:
      stages = getExecutionStages(explain.executionStats.executionStages).reverse();
      return (<div style={{marginLeft: 10}}>
        {
          stages.map((stage, i) => {
            console.log('render stage ', stage, JSON.stringify(stage));
            return (<div key={i} style={{display: 'flex'}}>
              <Popover
                content={<JSONTree data={stage}/>}
                interactionKind={PopoverInteractionKind.CLICK}
                position={Position.TOP_RIGHT}
                useSmartPositioning={false}
                popoverClassName="explain-stage-detail-popup"
              >
                <Button className="explain-stage-button">{stage.stage}</Button>
              </Popover>
              <ul className="explain-output-column-label">
                <li className="explain-output-list-label">nReturned:</li>
                <li className="explain-output-list-label">Execution Time:</li>
                <li
                  className="explain-output-list-label">{stage.stage === 'IXSCAN' ? 'Key Examined:' : 'Doc Examined:'}</li>
              </ul>
              <ul className="explain-output-column-label">
                <li className="explain-output-list-content">{stage.nReturned}</li>
                <li className="explain-output-list-content">{stage.executionTimeMillisEstimate}</li>
                <li
                  className="explain-output-list-content">{stage.stage === 'IXSCAN' ? stage.keysExamined : stage.docsExamined}</li>
              </ul>
            </div>);
          })
        }
      </div>);
    default:
      stages = getExecutionStages(explain.queryPlanner.winningPlan).reverse();
      return (<div style={{marginLeft: 10}}>
        <Popover
          content={<JSONTree data={stages[0]}/>}
          interactionKind={PopoverInteractionKind.CLICK}
          popoverClassName="explain-stage-detail-popup"
          position={Position.TOP_RIGHT}
          useSmartPositioning={false}
        >
          <Button className="explain-stage-button">{stages[0].stage}</Button>
        </Popover>
      </div>);
  }
};

const GlobalStatistics = ({explains, type}) => {
  switch (type) {
    case Types.ALL_PLANS_EXECUTION:
    case Types.EXECUTION_STATS:
      return (<div>
        <div style={{margin: 10}}>Global Statistics</div>
        <ul className="explain-output-column-label">
          <li className="explain-output-list-label">plannerVersion:</li>
          <li className="explain-output-list-label">totalDocsExamined:</li>
          <li className="explain-output-list-label">totalKeysExamined:</li>
          <li className="explain-output-list-label">nReturned:</li>
        </ul>
        <ul className="explain-output-column-label">
          <li className="explain-output-list-content">{explains.queryPlanner.plannerVersion}</li>
          <li className="explain-output-list-content">{explains.executionStats.totalDocsExamined}</li>
          <li className="explain-output-list-content">{explains.executionStats.totalKeysExamined}</li>
          <li className="explain-output-list-content">{explains.executionStats.nReturned}</li>
        </ul>
      </div>);
    default:
      return (<div>

      </div>);
  }
}

const ExplainView = ({explains}) => {
  if (!explains.output) {
    return null;
  }
  const output = JSON.parse(explains.output);
  return (<div className="explain-view-panel">
    <ExplainCommandInfo explain={output} command={explains.command}/>
    <div style={{margin: 10}}>Winning Plan</div>
    <WinningPlain explain={output} type={explains.type}/>
    <GlobalStatistics explains={output} type={explains.type}/>
  </div>);
};

ExplainView.propTypes = {
  explains: React.PropTypes.object.isRequired,
};

ExplainView.defaultProps = {
  explains: {},
};


export default ExplainView;
