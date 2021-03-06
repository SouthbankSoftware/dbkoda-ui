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
 * @Author: Michael Harrison
 * @Date:   2017-07-19 11:17:46
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-23T18:05:24+11:00
 */

/* eslint import/no-dynamic-require: 0 */
/* eslint no-unused-vars: warn */

import React from 'react';
import { NewToaster } from '#/common/Toaster';
import { inject, observer } from 'mobx-react';
import { featherClient } from '~/helpers/feathers';
import { action, runInAction } from 'mobx';
import { Tree, Tooltip, Position } from '@blueprintjs/core';
import { BlockTypes } from './AggregateBlocks/BlockTypes.js';
import Block from './AggregateBlocks/Block.jsx';
import { AggregateCommands } from './AggregateCommands.js';

@inject(allStores => ({
  store: allStores.store
}))
@observer
export default class Palette extends React.Component {
  constructor(props) {
    super(props);
    this.updateShellPipeline = this.updateShellPipeline.bind(this);
    this.state = {
      expanded: {
        common: true,
        queryAndAggregate: false,
        groupAndJoin: false,
        transform: false,
        other: false,
        all: false
      },
      debug: false
    };
    this.blockList = this.getBlockList();
    this.editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
  }

  @action.bound
  addBlock(blockType, position) {
    this.editor.isAggregateDetailsLoading = true;
    if (this.state.debug) l.debug('Add new Agg Block');
    if (
      this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).blockList.length ===
      0
    ) {
      position = 0;
    } else if (position === 'END') {
      position = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).blockList
        .length;
    } else if (position === 'START') {
      position = 1;
    }
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    // 1. Is this the first added block?
    if (position === 0) {
      position = 1;
      // a First block.
      // 2.a Get attributes.
      this.getBlockAttributes(position).then(res => {
        // 3.a Add to Editor
        this.addBlockToEditor(blockType, position, res);
      });
    } else {
      this.updateShellPipeline().then(() => {
        this.updateResultSet()
          .then(res => {
            l.debug('res: ', res);
            try {
              while (res.match(/\"\$regex\" : \/(.+?)\//)) {
                l.debug('Fixing regex before parsing.');
                res = res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"');
              }
              res = JSON.parse(res);
            } catch (e) {
              l.error(e);
            }

            if (res.stepAttributes.constructor === Array) {
              // 3. Update Valid for each block.
              res.stepAttributes.map((indexValue, index) => {
                let attributeIndex = index;
                if (index > 0) {
                  attributeIndex = index - 1;
                }
                if (indexValue.constructor === Array) {
                  // Check for error result.
                  if (res.stepCodes[index] === 0) {
                    if (!(typeof indexValue === 'string')) {
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Graphical Builder', () => {
                      editor.blockList[index].attributeList = res.stepAttributes[attributeIndex];
                      editor.blockList[index].status = 'valid';
                    });
                  } else {
                    l.error('Result[', index, '] is invalid: ', indexValue);
                    if (!(typeof indexValue === 'string')) {
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Graphical Builder', () => {
                      editor.blockList[index].status = 'pending';
                    });
                  }
                }
              });

              // 4.b Is the current latest step valid?
              if (editor.blockList[editor.blockList.length - 1].status === 'valid') {
                this.getBlockAttributes(position - 1).then(res => {
                  // 3.a Add to Editor
                  this.addBlockToEditor(blockType, position, res);
                });
              } else {
                this.addBlockToEditor(blockType, position, null);
              }
              // this.clearResultsOutput(editor);
            } else {
              // Check for error.
              l.error('updateResultSet: ', res);
            }
            runInAction('Agg Builder no longer loading', () => {
              this.props.store.editors.get(
                this.props.store.editorPanel.activeEditorId
              ).isAggregateLoading = false;
            });
          })
          .catch(e => {
            runInAction('Agg Builder no longer loading', () => {
              this.props.store.editors.get(
                this.props.store.editorPanel.activeEditorId
              ).isAggregateLoading = false;
            });
            l.error(e);
          });
      });
    }
  }

  @action.bound
  onExpand(nodeName) {
    this.state.expanded[nodeName] = true;
    this.forceUpdate();
  }

  @action.bound
  onCollapse(nodeName) {
    this.state.expanded[nodeName] = false;
    this.forceUpdate();
  }

  /**
   * Gets a list of block types and converts it into a object that the listView can use.
   *
   * @return {Object} - The list of block types.
   */
  getBlockList() {
    const dataObj = [
      {
        hasCaret: true,
        id: 'common',
        label: 'Common',
        childNodes: [],
        onExpand: () => this.onExpand('common'),
        onCollapse: () => this.onCollapse('common'),
        isExpanded: this.state.expanded.common
      },
      {
        hasCaret: true,
        id: 'queryAndAggregate',
        label: 'Query and Aggregate',
        childNodes: [],
        onExpand: () => this.onExpand('queryAndAggregate'),
        onCollapse: () => this.onCollapse('queryAndAggregate'),
        isExpanded: this.state.expanded.queryAndAggregate
      },
      {
        hasCaret: true,
        id: 'groupAndJoin',
        label: 'Group and Join',
        childNodes: [],
        onExpand: () => this.onExpand('groupAndJoin'),
        onCollapse: () => this.onCollapse('groupAndJoin'),
        isExpanded: this.state.expanded.groupAndJoin
      },
      {
        hasCaret: true,
        id: 'transform',
        label: 'Transform',
        childNodes: [],
        onExpand: () => this.onExpand('transform'),
        onCollapse: () => this.onCollapse('transform'),
        isExpanded: this.state.expanded.transform
      },
      {
        hasCaret: true,
        id: 'other',
        label: 'Other',
        childNodes: [],
        onExpand: () => this.onExpand('other'),
        onCollapse: () => this.onCollapse('other'),
        isExpanded: this.state.expanded.other
      },
      {
        hasCaret: true,
        id: 'all',
        label: 'All',
        childNodes: [],
        onExpand: () => this.onExpand('all'),
        onCollapse: () => this.onCollapse('all'),
        isExpanded: this.state.expanded.all
      }
    ];

    const groupsArray = {
      common: [],
      queryAndAggregate: [],
      groupAndJoin: [],
      transform: [],
      other: []
    };

    // For each object in the block types
    Object.keys(BlockTypes).map((keyName, index) => {
      if (!(BlockTypes[keyName].type.toUpperCase() === 'START')) {
        // Push item to all group.
        dataObj[5].childNodes.push({
          id: index,
          label: (
            <Tooltip
              content={BlockTypes[keyName].description}
              hoverOpenDelay={2000}
              position={Position.right}
            >
              <Block
                key={'key-' + index} //eslint-disable-line
                listPosition={index}
                type={BlockTypes[keyName].type}
                concrete={false}
                addBlock={this.addBlock}
              />
            </Tooltip>
          )
        });
        // For each tag in groups array, add to group.
        BlockTypes[keyName].groups.map(group => {
          groupsArray[group].push({
            id: index,
            label: (
              <Tooltip
                content={BlockTypes[keyName].description}
                position={Position.right}
                hoverOpenDelay={2000}
              >
                <Block
                  key={'key-' + index} //eslint-disable-line
                  listPosition={index}
                  type={BlockTypes[keyName].type}
                  concrete={false}
                  addBlock={this.addBlock}
                />
              </Tooltip>
            )
          });
        });
      }
    });
    dataObj[0].childNodes = groupsArray.common;
    dataObj[1].childNodes = groupsArray.queryAndAggregate;
    dataObj[2].childNodes = groupsArray.groupAndJoin;
    dataObj[3].childNodes = groupsArray.transform;
    dataObj[4].childNodes = groupsArray.other;
    dataObj[0].height = dataObj[0].childNodes.length * 50;
    dataObj[1].height = dataObj[1].childNodes.length * 50;
    dataObj[2].height = dataObj[2].childNodes.length * 50;
    dataObj[3].height = dataObj[3].childNodes.length * 50;
    dataObj[4].height = dataObj[4].childNodes.length * 50;
    dataObj[5].height = dataObj[5].childNodes.length * 50;
    return dataObj;
  }

  /**
   * Updates the shell pipeline with all the existing steps.
   * @returns {Promise} - A promise with the result of the shell update.
   */
  @action.bound
  updateShellPipeline() {
    if (this.state.debug) l.debug('Update Shell Pipeline');
    return new Promise((resolve, reject) => {
      // Assemble Step Array.
      const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
      const stepArray = [];
      if (editor.blockList.length === 1) {
        resolve();
      } else {
        editor.blockList.map(block => {
          if (!(block.type === 'Start')) {
            const formTemplate = require('./AggregateBlocks/BlockTemplates/' + block.type + '.hbs');
            const stepJSON = formTemplate(block.fields);
            try {
              stepArray.push(stepJSON.replace(/\n/g, ' '));
            } catch (e) {
              l.error('Block generated invalid JSON: ', block);
            }
          }
        });
        // Update steps in Shell:
        const service = featherClient().service('/mongo-sync-execution');
        service.timeout = 60000;
        service
          .update(editor.profileId, {
            shellId: editor.shellId, // eslint-disable-line
            commands: AggregateCommands.SET_ALL_STEPS(editor.aggregateID, stepArray)
          })
          .then(() => {
            resolve();
          })
          .catch(e => {
            reject(e);
          });
      }
    });
  }

  /**
   * Updates the result set in the shell object and receives a list of attributes for each step.
   * @returns {Promise} - A promise with the result of the shell query.
   */
  @action.bound
  updateResultSet() {
    if (this.state.debug) l.debug('Update Result Set');
    return new Promise((resolve, reject) => {
      const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
      // Update steps in Shell:
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 60000;
      service
        .update(editor.profileId, {
          shellId: editor.shellId, // eslint-disable-line
          commands: AggregateCommands.GET_STATUS(editor.aggregateID)
        })
        .then(res => {
          resolve(res);
        })
        .catch(e => {
          l.error(e);
          NewToaster.show({
            message: globalString('aggregate_builder/no_active_connection'),
            className: 'danger',
            icon: 'thumbs-down'
          });
          reject(e);
        });
    });
  }

  /**
   * Fetch the block attributes from the shell object.
   * Gets results for all previous stages and attributes avaliable for
   * the new block.
   * @param {position} - The position of the block to get avaliable attributes for.
   * @returns {Promise} - A promise resolving the attributes from the shell.
   */
  @action.bound
  getBlockAttributes(position) {
    if (this.state.debug) l.debug('Get block attributes');
    return new Promise((resolve, reject) => {
      // Get the relevant editor object.
      const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
      // Fetch response from shell object for all steps up to position - 1
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 60000;
      service
        .update(editor.profileId, {
          shellId: editor.shellId, // eslint-disable-line
          commands: AggregateCommands.GET_ATTRIBUTES(editor.aggregateID, position)
        })
        .then(res => {
          // Check attribute List to see if we have valid attributes returned.
          resolve(res);
        })
        .catch(err => {
          l.error(err);
          reject(err);
        });
    });
  }

  /**
   * Add a single block to the shell (only for first block)
   * the new block.
   * @param {position} - The position of the block to get avaliable attributes for.
   * @returns {True} - If all blocks up to this point are valid.
   */
  @action.bound
  addBlockToShell(blockType, position) {
    if (this.state.debug) l.debug('Add new Agg Block to shell');
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    if (position === 'END') {
      position = editor.blockList.length - 1;
    } else if (position === 'START') {
      position = 0;
    }

    // Determine if the previous block is valid.
    const service = featherClient().service('/mongo-sync-execution');
    const generatedCode = '';
    service.timeout = 60000;
    service
      .update(editor.profileId, {
        shellId: editor.shellId, // eslint-disable-line
        commands: AggregateCommands.ADD_STEP(editor.aggregateID, generatedCode, position)
      })
      .catch(err => {
        l.error(err);
      });
  }

  /**
   * Add a single block to the editor object.
   * @param {blockType} - The type of block to be added.
   * @param {position} - Where the block should be inserted.
   * @param {attributes} - List of avaliable attributes for the .ddd
   */
  @action.bound
  addBlockToEditor(blockType, position, attributeList) {
    try {
      if (this.state.debug) l.debug('Add new Agg Block to editor');
      // Get relevant editor.
      const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);

      // Update block list for editor as required.
      const tmpArray = this.props.store.editors
        .get(this.props.store.editorPanel.activeEditorId)
        .blockList.slice();
      if (tmpArray.length === 0) {
        tmpArray.push({
          type: blockType,
          fields: BlockTypes[blockType.toUpperCase()].fields,
          modified: false
        });
      } else if (position === 'START') {
        tmpArray.unshift({
          type: blockType,
          fields: BlockTypes[blockType.toUpperCase()].fields,
          modified: false
        });
      } else if (position === 'END') {
        tmpArray.push({
          type: blockType,
          fields: BlockTypes[blockType.toUpperCase()].fields,
          modified: false
        });
      } else {
        tmpArray.push({
          type: blockType,
          fields: BlockTypes[blockType.toUpperCase()].fields,
          modified: false
        });
        this.moveBlock(tmpArray, tmpArray.length - 1, position);
      }
      this.props.store.editors.get(
        this.props.store.editorPanel.activeEditorId
      ).blockList = tmpArray;
      // Update block attributes
      editor.blockList[position].status = 'pending';
      editor.blockList[position].attributeList = attributeList;
      editor.selectedBlock = position;
      this.props.store.editorPanel.updateAggregateDetails = true;
    } catch (e) {
      l.error(e);
    }
  }

  /**
   *
   */
  moveBlock(array, oldIndex, newIndex) {
    // Standard array move:
    if (newIndex >= array.length) {
      let tmpArray = newIndex - array.length;
      while ((tmpArray -= 1) + 1) {
        array.push(undefined);
      }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0]);
  }

  /**
   * Clear the output tab since no results are avaliable.
   *
   * @param {Object} Editor - The editor to update the output for.
   */
  @action.bound
  clearResultsOutput(editor) {
    const output = this.props.store.outputs.get(editor.id);
    output.output = globalString('aggregate_builder/block_not_yet_valid');
  }

  @action.bound
  handleNodeClick(nodeData, _nodePath, e) {
    if (nodeData.isExpanded) {
      this.handleNodeCollapse(nodeData);
    } else {
      this.handleNodeExpand(nodeData);
    }
  }

  @action.bound
  handleNodeCollapse(nodeData) {
    nodeData.isExpanded = false;
    this.setState(this.state);
  }

  @action.bound
  handleNodeExpand(nodeData) {
    nodeData.isExpanded = true;
    this.setState(this.state);
  }

  render() {
    this.editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    return (
      <div className="aggregatePaletteContainer">
        <div className="aggregatePaletteWrapper">
          <nav className="aggregatePaletteToolbar pt-navbar pt-dark">
            <h2 className="paletteHeader">{globalString('aggregate_builder/palette_title')}</h2>
          </nav>
          {this.props.store.editors.get(this.props.store.editorPanel.activeEditorId) &&
          !this.props.store.editors.get(this.props.store.editorPanel.activeEditorId)
            .isAggregateDetailsLoading &&
          !this.props.store.editorToolbar.isActiveExecuting ? (
            <Tree
              contents={this.blockList}
              onNodeClick={this.handleNodeClick}
              onNodeCollapse={this.handleNodeCollapse}
              onNodeExpand={this.handleNodeExpand}
              className="palletteTree"
            />
          ) : (
            <div className="loaderWrapper">
              <div className="loader" />
            </div>
          )}
        </div>
      </div>
    );
  }
}
