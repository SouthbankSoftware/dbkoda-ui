/**
 * explain view used to show explain panel
 */

import React from 'react';
import {toJS} from 'mobx';
import CodeMirror from 'react-codemirror';
import CM from 'codemirror';
import Prettier from 'prettier';
import './style.scss';

const Globalize = require('globalize');

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

export const generateComments = (stage) => {
  let comments = 'waiting for comments ' + stage.stage;
  if (stage.stage.indexOf('SORT_KEY_GENERATOR') >= 0) {
    comments = 'Generate keys for the next sort step';
  }

  return comments;
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
      <div>{Globalize.formatMessage('explain/view/statisticHeader')}</div>
      <div>Value</div>
    </div>
    <div className="row">
      <div>{Globalize.formatMessage('explain/view/docsReturned')}</div>
      <div>{executionStats.nReturned}</div>
    </div>
    <div className="row">
      <div>{Globalize.formatMessage('explain/view/keysExamined')}</div>
      <div>{executionStats.totalKeysExamined}</div>
    </div>
    <div className="row">
      <div>{Globalize.formatMessage('explain/view/docsExamined')}</div>
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
  console.log('get statistics ', shardStatistics);
  return (<div className="explain-shards-statistic-view">
    <div className="header">
      <div>Shard</div>
      <div>Examined</div>
      <div>Returned</div>
      <div>ms</div>
    </div>
    {
      shardStatistics.map((shard) => {
        return (<div className="row" key={shard.shardName}>
          <div>{shard.shardName}</div>
          <div>{shard.docsExamined}</div>
          <div>{shard.nReturned}</div>
          <div>{shard.executionTimeMillisEstimate}</div>
        </div>);
      })
    }
  </div>);
};

const options = {
  smartIndent: true,
  theme: 'material',
  readOnly: true,
  lineWrapping: false,
  tabSize: 2,
  matchBrackets: true,
  keyMap: 'sublime',
  mode: 'MongoScript'
};

const CommandPanel = ({command, namespace}) => {
  const formatted = Prettier.format(command, {});
  setTimeout(() => {
    const cm = this.editor && this.editor.getCodeMirror();
    cm && cm.setValue(formatted);
  }, 500);
  return (<div className="explain-command-panel">
    <div className="namespace">
      <div className="label">{Globalize.formatMessage('explain/view/namespaceLabel')}</div>
      <div className="value">{namespace}</div>
    </div>
    <div className="codemirror">
      <div className="label">{Globalize.formatMessage('explain/view/queryLabel')}</div>
      <CodeMirror
        ref={(cm) => {
          this.editor = cm;
        }}
        codeMirrorInstance={CM}
        value={command}
        options={options} />
    </div>
  </div>);
};

const ExplainView = ({explains}) => {
  if (!explains || !explains.output) {
    return null;
  }
  const output = toJS(explains.output);
  const commandPanel = <CommandPanel command={explains.command} namespace={output.queryPlanner.namespace} />;
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
