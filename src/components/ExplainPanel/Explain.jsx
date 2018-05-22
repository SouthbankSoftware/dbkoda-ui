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
 * @Date:   2017-04-20T17:58:30+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-22T11:49:18+10:00
 */
/**
 * explain component is used to handle explain output
 */
import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable, toJS } from 'mobx';
import { NewToaster } from '#/common/Toaster';
import _ from 'lodash';
import { featherClient } from '~/helpers/feathers';
import Panel from './Panel';
import { Broker, EventType } from '../../helpers/broker/index';

export const parseOutput = output => {
  return output
    .replace(/NumberLong\((\d*)\)/g, '$1')
    .replace(/\n/g, '')
    .replace(/\s/g, '')
    .replace(/\r/g, '')
    .replace(/:(\/[^\/]*\/)/g, ':"$1"');
};

export const findKeyValue = (key, object) => {
  // Find namespace within the plan (for instnace if this is a sharded plan)
  if (object.hasOwnProperty(key)) {
    return object[key];
  }

  for (let i = 0; i < Object.keys(object).length; i += 1) {
    if (typeof object[Object.keys(object)[i]] == 'object') {
      return findKeyValue(key, object[Object.keys(object)[i]]);
    }
  }
};
export const getIdxSuggestionCode = (suggestionResult, explainPlan, lineSep) => {
  let suggestionCode = globalString('explain/panel/suggestIndexDescription') + lineSep;
  // Iterate through each object in the result.
  if (typeof suggestionResult === 'object') {
    let namespace = findKeyValue('namespace', explainPlan);

    namespace = namespace.split('.');
    const table = namespace[0];
    const collection = namespace[1];
    if (suggestionResult.newIndexes.length <= 0 && suggestionResult.redundantIndexes.length <= 0) {
      l.info('No Suggestions Found');
      suggestionCode = globalString('explain/panel/noAdditionalIndexesRequired') + lineSep;
    } else {
      if (suggestionResult.redundantIndexes.length > 0) {
        for (const key in suggestionResult.redundantIndexes) {
          if (typeof suggestionResult.redundantIndexes[key] === 'object') {
            suggestionCode +=
              '// The index ' +
              JSON.stringify(suggestionResult.redundantIndexes[key].indexName) +
              ' on ' +
              lineSep +
              '//' +
              JSON.stringify(suggestionResult.redundantIndexes[key].key) +
              lineSep +
              ' // can be replaced by a new index on ' +
              lineSep +
              '//' +
              JSON.stringify(suggestionResult.redundantIndexes[key].because);
          }
        }
      }
      if (suggestionResult.newIndexes.length > 0) {
        suggestionCode +=
          lineSep + lineSep + globalString('explain/panel/addIndexCommandsPrompt') + lineSep;

        // Indexes to add.
        for (const key in suggestionResult.newIndexes) {
          if (typeof suggestionResult.newIndexes[key] === 'object') {
            suggestionCode +=
              'db.getSiblingDB("' +
              table +
              '").' +
              collection +
              '.createIndex(' +
              JSON.stringify(suggestionResult.newIndexes[key]) +
              ');' +
              lineSep;
          }
        }

        // Indexes to remove.
        for (const key in suggestionResult.redundantIndexes) {
          if (typeof suggestionResult.redundantIndexes[key] === 'object') {
            suggestionCode +=
              'db.getSiblingDB("' +
              table +
              '").getCollection("' +
              collection +
              '").dropIndex(' +
              JSON.stringify(suggestionResult.redundantIndexes[key].indexName) +
              ');' +
              lineSep;
          }
        }
      }
    }
    return suggestionCode;
  }
  l.error('Did not return an array.');
  return '';
};

@inject(allStores => ({
  store: allStores.store,
  explainPanel: allStores.store.explainPanel,
  editors: allStores.store.editors,
  outputPanel: allStores.store.outputPanel
}))
@observer
export default class Explain extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      viewType: 0,
      suggestionsGenerated: false,
      suggestionText: ''
    };
  }

  componentDidMount() {
    const { editor } = this.props;
    if (editor) {
      Broker.on(EventType.EXPLAIN_OUTPUT_AVAILABLE, this.explainOutputAvailable);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.editor.explains) {
      this.setState({ viewType: nextProps.editor.explains.viewType });
    }
  }

  componentWillUnmount() {
    const { editor } = this.props;
    if (editor) {
      Broker.removeListener(EventType.EXPLAIN_OUTPUT_AVAILABLE, this.explainOutputAvailable);
    }
  }

  @action.bound
  explainOutputAvailable({ id, shell, command, type, output }) {
    this.suggestionsGenerated = false;
    this.suggestionText = '';
    this.explainCommand = command;
    this.explainOutput = '';
    this.explainType = type;
    let currentEditorId = false;
    let currentEditor = null;
    this.props.editors.forEach((value, key) => {
      if (value.profileId === id && value.shellId === shell) {
        currentEditorId = key;
        currentEditor = value;
      }
    });

    if (!currentEditor) {
      return;
    }
    // const currentEditor = editor;
    let explainOutputJson;
    try {
      explainOutputJson = {
        output: JSON.parse(output),
        type: this.explainType,
        command: this.explainCommand,
        viewType: 0
      };
      if (explainOutputJson.output.stages && explainOutputJson.output.stages.length > 0) {
        // this is aggregate framework explain output, convert stages to regular stage
        const aggStages = explainOutputJson.output.stages;
        const converted = { queryPlanner: { winningPlan: {} } };
        aggStages.reverse().forEach(stage => {
          _.values(stage).forEach(v => {
            _.keys(v).forEach(k => {
              if (k === 'queryPlanner') {
                converted.queryPlanner = v.queryPlanner;
              }
            });
          });
        });
        explainOutputJson.output = converted;
      } else if (explainOutputJson.output.shards) {
        const shardsOutput = {
          queryPlanner: { winningPlan: { stage: 'SHARD_MERGE', shards: [] } }
        };
        _.forOwn(explainOutputJson.output.shards, (value, key) => {
          if (value.stages && value.stages.length > 0) {
            _.forOwn(value.stages[0], stageValue => {
              if (stageValue.queryPlanner && stageValue.queryPlanner.winningPlan) {
                const shardOutput = {
                  shardName: key,
                  winningPlan: stageValue.queryPlanner.winningPlan
                };
                l.info('add to shard output ', shardOutput);
                shardsOutput.queryPlanner.winningPlan.shards.push(shardOutput);
              }
            });
          }
        });
        explainOutputJson.output = shardsOutput;
      } else if (!explainOutputJson.output || !explainOutputJson.output.queryPlanner) {
        explainOutputJson = {
          error: globalString('explain/parseError'),
          command: this.explainCommand,
          output: parseOutput(output)
        };
      }
      this.explainOutput = explainOutputJson;
    } catch (err) {
      l.error('Failed to parse for Explain:', err, {
        [Symbol.for('info')]: {
          customData: {
            output
          }
        }
      });

      explainOutputJson = {
        error: globalString('explain/parseError'),
        command: this.explainCommand,
        output: parseOutput(output)
      };
    }
    this.props.editors.set(
      currentEditorId,
      observable({
        ...currentEditor,
        explains: explainOutputJson
      })
    );
    Broker.emit(EventType.EXPLAIN_OUTPUT_PARSED, { id, shell });
  }

  @action.bound
  switchExplainView() {
    const { viewType } = this.props.editor.explains;
    this.props.editor.explains.viewType = 1 - viewType;
    this.setState({ viewType: this.props.editor.explains.viewType });
  }

  @action.bound
  suggestIndex() {
    if (!this.explainOutput) {
      l.error('Explain Plan needs to be re-executed.');
      l.error(this);
      NewToaster.show({
        message: globalString('explain/panel/executeAgain'),
        className: 'error',
        icon: 'thumbs-down'
      });
    } else {
      const editor = this.props.editors.get(this.props.store.editorPanel.activeEditorId);
      const lineSep = editor.doc.cm.lineSeparator() || '\n';
      const { profileId } = editor;
      const shell = editor.shellId;

      // Send a message to controller to fetch the suggested indicies.
      const service = featherClient().service('/mongo-sync-execution');
      const explainOutput = 'explain_' + editor.id.replace(/\-/g, '_');
      service.timeout = 30000;
      service
        .update(profileId, {
          shellId: shell, // eslint-disable-line
          commands: 'dbkInx.suggestIndexesAndRedundants(' + explainOutput + ');'
        })
        .then(res => {
          l.info(JSON.parse(res));
          this.suggestionsGenerated = true;
          const suggestionResult = JSON.parse(res);
          const explainPlan = toJS(this.props.editor.explains.output);

          this.suggestionText = getIdxSuggestionCode(suggestionResult, explainPlan, lineSep);

          this.setState({ suggestionsGenerated: true });
        })
        .catch(err => {
          l.error(err);
        });
    }
  }

  @action.bound
  copySuggestion() {
    const { cm } = this.props.editor.doc;
    cm.setValue(cm.getValue() + cm.lineSeparator() + this.suggestionText);
    cm.scrollIntoView({ line: cm.lineCount() - 1, ch: 0 });
  }

  render() {
    return (
      <div className="explainPanelWrapper">
        <Panel
          editor={this.props.editor}
          viewType={this.state.viewType}
          switchExplainView={this.switchExplainView}
          suggestIndex={this.suggestIndex}
          suggestionText={this.suggestionText}
          hasSuggestions={this.suggestionsGenerated}
          copySuggestion={this.copySuggestion}
        />
      </div>
    );
  }
}
