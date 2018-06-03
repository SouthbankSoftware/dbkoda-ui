/*
 * @Author: Michael Harrison
 * @Date:   2017-07-19 11:17:46
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-21T13:34:24+10:00
 *
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

/* eslint import/no-dynamic-require: 0 */

import React from 'react';
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { action, runInAction } from 'mobx';
import path from 'path';
import { Alert, AnchorButton, Intent, Tooltip, Position } from '@blueprintjs/core';
import { DrawerPanes } from '#/common/Constants';
import { NewToaster } from '#/common/Toaster';
import ErrorView from '#/common/ErrorView';
import { Broker, EventType } from '~/helpers/broker';
import { featherClient } from '~/helpers/feathers';
import Block from './AggregateBlocks/Block.jsx';
import { BlockTypes } from './AggregateBlocks/BlockTypes.js';
import FirstBlockTarget from './AggregateBlocks/FirstBlockTaget.jsx';
import LastBlockTarget from './AggregateBlocks/LastBlockTarget.jsx';
import './style.scss';
import { AggregateCommands } from './AggregateCommands.js';
import GenerateChartButton from './GenerateChartButton';
import CreateViewButton from './CreateViewButton';
import ShowIcon from '../../styles/icons/show-icon.svg';
import ImportIcon from '../../styles/icons/export-icon.svg';
import ExportIcon from '../../styles/icons/save-icon.svg';

const { dialog, BrowserWindow } = IS_ELECTRON ? window.require('electron').remote : {};

const FILE_FILTERS = [
  {
    name: 'Aggregate',
    extensions: ['agg']
  }
];

@inject(allStores => ({
  api: allStores.store.api,
  store: allStores.store
}))
@observer
export default class GraphicalBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.id,
      activeBlockIndex: this.props.store.editors.get(this.props.id).selectedBlock,
      colorMatching: [],
      collection: props.collection,
      failed: false,
      failureReason: 'Unknown',
      firstTry: true
    };

    Broker.emit(EventType.FEATURE_USE, 'AggregateBuilder');

    this.state.debug = true;
    // Set up the aggregate builder in the shell.
    this.editor = this.props.store.editors.get(this.props.id);
    this.profileId = this.editor.profileId;
    this.shell = this.editor.shellId;
    this.currentDB = this.editor.collection.refParent.text;
    this.currentCollection = this.editor.collection.text;

    // Add aggregate object to shell.
    const service = featherClient().service('/mongo-sync-execution');
    service.timeout = 60000;
    service
      .update(this.profileId, {
        shellId: this.shell, // eslint-disable-line
        commands: AggregateCommands.NEW_AGG_BUILDER(this.currentDB, this.currentCollection)
      })
      .then(res => {
        if (this.state.debug) l.debug('new agg builder result line 98:', res);
        this.editor.aggregateID = JSON.parse(res).id;
        if (this.editor.blockList.length === 0) {
          this.addStartBlock();
        }
      })
      .catch(err => {
        if (err.message.includes('Connection does not exist')) {
          this.state.failureReason = 'ConnectionDoesNotExist';
        } else {
          this.state.failureReason = 'Unknown';
        }
        runInAction('Agg Builder no longer loading', () => {
          this.editor.isAggregateDetailsLoading = false;
        });
        this.setState({ failed: true });
        this.setState({ failureReason: err });
        l.error(err);
      });

    // Set up broker events.
    Broker.on(EventType.AGGREGATE_UPDATE(this.editor.id), this._onAggregateUpdate);
  }

  componentWillUnmount() {
    // Turn off broker events.
    Broker.off(EventType.AGGREGATE_UPDATE(this.editor.id), this._onAggregateUpdate);
  }

  /**
   * Function for adding a start block and setting up agg builder.
   */
  @action.bound
  addStartBlock() {
    return new Promise(resolve => {
      this.getBlockAttributes(0).then(res => {
        this.addBlockToEditor('Start', 0, res)
          .then(() => {
            resolve();
          })
          .catch(e => {
            l.error('Failed to add Start block to Agg Builder with error ' + e);
            this.setState({ failed: true });
            this.setState({ failureReason: e });
          });
      });
    });
  }

  @action.bound
  _onAggregateUpdate() {
    const editor = this.props.store.editors.get(this.props.id);
    l.debug('Selecting Block: ', editor.selectedBlock);
    this.selectBlock(editor.selectedBlock);
  }

  @action.bound
  addBlock(block, position) {
    if (this.state.debug) l.debug('Add new Agg Block');
    return new Promise((resolve, reject) => {
      const editor = this.props.store.editors.get(this.props.id);

      this.updateShellPipeline().then(() => {
        this.updateResultSet()
          .then(res => {
            if (this.state.debug) l.debug('update result set result line 166:', res);
            while (res.match(/\"\$regex\" : \/(.+?)\//)) {
              l.debug('Fixing regex before parsing.');
              res = res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"');
            }
            res = JSON.parse(res);
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
                      l.debug('OLD: ', editor.blockList[index].attributeList);
                      l.debug('NEW: ', res.stepAttributes[attributeIndex]);
                      editor.blockList[index].attributeList = res.stepAttributes[attributeIndex];
                      editor.blockList[index].status = 'valid';
                    });
                  } else {
                    if (this.state.debug) l.error('Result[', index, '] is invalid: ', indexValue);
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
                  this.addBlockToEditor(block.type, position, res, true, block).then(() => {
                    resolve();
                  });
                });
              } else {
                this.addBlockToEditor(block.type, position, null, true, block).then(() => {
                  resolve();
                });
              }
              this.clearResultsOutput(editor);
            } else {
              // Check for error.
              l.error('updateResultSet: ', res);
              reject();
            }
          })
          .catch(e => {
            l.error(e);
            reject();
          });
      });
    });
  }

  /**
   * Add a single block to the editor object.
   * @param {blockType} - The type of block to be added.
   * @param {position} - Where the block should be inserted.
   * @param {attributes} - List of avaliable attributes for the .ddd
   */
  @action.bound
  addBlockToEditor(blockType, position, attributeList, isImport, block) {
    if (this.state.debug) l.debug('Add new Agg Block to Editor');
    return new Promise(resolve => {
      // Get relevant editor.
      const editor = this.props.store.editors.get(this.props.id);
      // Update block list for editor as required.
      const tmpArray = this.props.store.editors.get(this.props.id).blockList.slice();
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
        if (isImport) {
          this.moveImportBlock(tmpArray, tmpArray.length - 1, position);
        } else {
          this.moveBlock(tmpArray, tmpArray.length - 1, position);
        }
      }

      this.props.store.editors.get(this.props.id).blockList = tmpArray;

      // Update block attributes
      editor.blockList[position].status = 'pending';
      editor.blockList[position].attributeList = attributeList;
      editor.selectedBlock = position;
      this.props.store.editorPanel.updateAggregateDetails = true;
      this.selectBlock(position).then(() => {
        if (block) {
          for (const key in block.fields) {
            if (block.fields.hasOwnProperty(key)) {
              // eslint-disable-line
              // Check if field is an array:
              if (typeof block.fields[key] === 'object') {
                // For each property in the object.
                block.fields[key].forEach(value => {
                  if (editor.blockList[position].fields[key]) {
                    editor.blockList[position].fields[key].push(value);
                  }
                });
              } else {
                editor.blockList[position].fields[key] = block.fields[key];
              }
            }
          }
        }
        resolve();
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
    if (this.state.debug) l.debug('Get Block Attributes');
    return new Promise((resolve, reject) => {
      // Get the relevant editor object.
      const editor = this.props.store.editors.get(this.props.id);
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
   * Used to select a block and set it as the current, then update
   * the relevant other panels.
   *
   * @param {Integer} index - The index of the block to be seleceted
   * @return {Promise} - Returns a new promise objectfor completion of the block selection.
   */
  @action.bound
  selectBlock(index) {
    if (this.state.debug) l.debug('Select Block: ', index);
    runInAction('Agg Builder details is loading', () => {
      this.editor.isAggregateDetailsLoading = true;
    });
    return new Promise(resolve => {
      // 1. Update Editor List.
      const editor = this.props.store.editors.get(this.props.id);
      this.setOutputLoading(editor.id);
      this.setState({ activeBlockIndex: index });
      this.props.store.editors.get(this.props.id).selectedBlock = index;
      this.props.store.editors.get(this.props.id).blockList[index].isSelected = true;

      // 2. Update Shell Steps.
      this.updateShellPipeline(true).then(res => {
        if (res && res.unableToUpdateSteps) {
          // Partial update
          l.error('[SELECT] - Unable to fully update steps: ', res);
          // 4. Is the current block valid?.
          if (editor.blockList[editor.selectedBlock].status === 'valid') {
            // 4.a Yes - Update Results.
            this.updateResultsOutput(editor, editor.selectedBlock);
          } else {
            // 4.b No - Clear Results.
            this.clearResultsOutput(editor);
          }

          runInAction('Update Details', () => {
            this.props.store.editorPanel.updateAggregateDetails = true;
          });
        } else {
          // All steps validated, full update.
          this.updateResultSet().then(res => {
            if (this.state.debug) {
              l.debug(
                'update result set result line 383:',
                res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"')
              );
            }
            try {
              // Regex work around.
              while (res.match(/\"\$regex\" : \/(.+?)\//)) {
                l.debug('Fixing regex before parsing.');
                res = res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"');
              }
              res = JSON.parse(res);
            } catch (e) {
              l.error(typeof e);
              if (res.match(/agg is undefined/)) {
                l.error('Agg is undefined, probably lost shell.');
                this.setState({ failed: true });
                this.setState({ failureReason: 'ConnectionDoesNotExist' });
                return;
              }
              // If first error - Try again!
              if (this.state.firstTry) {
                this.setState({ firstTry: false });
                this.selectBlock(index);
                resolve();
              } else {
                this.setState({ failed: true });
                this.setState({ failureReason: e });
                return;
              }
            }
            if (res && res.stepAttributes && res.stepAttributes.constructor === Array) {
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
                    if (!(typeof indexValue === 'string')) {
                      if (this.state.debug) l.error('Result[', index, '] is invalid: ', indexValue);
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Graphical Builder', () => {
                      editor.blockList[index].status = 'pending';
                    });
                  }
                }
              });
              runInAction('Update Graphical Builder Details', () => {
                this.props.store.editorPanel.updateAggregateDetails = true;
                resolve();
              });
              // 4. Is the current block valid?.
              if (editor.blockList[editor.selectedBlock].status === 'valid') {
                // 4.a Yes - Update Results.
                this.updateResultsOutput(editor, editor.selectedBlock);
              } else {
                // 4.b No - Clear Results.
                this.clearResultsOutput(editor);
              }
            }
          });
        }
      });
    });
  }

  @action.bound
  moveBlockInEditor(blockFrom, blockTo) {
    const tmpArray = this.props.store.editors.get(this.props.id).blockList;
    this.moveBlockHelper(tmpArray, blockFrom, blockTo);
    this.props.store.editors.get(this.props.id).blockList = tmpArray;
    if (this.state.activeBlockIndex === blockFrom) {
      this.setState({ activeBlockIndex: blockTo });
    } else if (this.state.activeBlockIndex === blockTo && blockTo === 0) {
      this.setState({ activeBlockIndex: blockTo + 1 });
    } else if (this.state.activeBlockIndex === blockTo && blockTo === tmpArray.length - 1) {
      this.setState({ activeBlockIndex: blockTo - 1 });
    } else if (this.state.activeBlockIndex === blockTo) {
      if (blockFrom > blockTo) {
        this.setState({ activeBlockIndex: blockTo + 1 });
      } else {
        this.setState({ activeBlockIndex: blockTo - 1 });
      }
    }

    this.props.store.editors.get(this.props.id).selectedBlock = this.state.activeBlockIndex;
  }

  /**
   * Moves a block from one location to another, updating the
   * builder after the move.
   * @param {Int} blockFrom - The block position to be moved.
   * @param {Int} blockTo - The block position being moved to.
   */
  @action.bound
  moveBlock(blockFrom, blockTo) {
    return new Promise(resolve => {
      // 1. Update Editor (moveBlock)
      const editor = this.props.store.editors.get(this.props.id);
      if (blockTo === 0) {
        blockTo = 1;
      } else if (!blockTo) {
        return null;
      }
      this.moveBlockInEditor(blockFrom, blockTo);
      // 2. Update Shell Steps
      this.updateShellPipeline(true).then(res => {
        if (res && res.unableToUpdateSteps) {
          // 4. Is the current block valid?.
          if (editor.blockList[editor.selectedBlock].status === 'valid') {
            // 4.a Yes - Update Results.
            this.updateResultsOutput(editor, editor.selectedBlock);
          } else {
            // 4.b No - Clear Results.
            this.clearResultsOutput(editor);
          }

          runInAction('Update Graphical Builder', () => {
            this.props.store.editorPanel.updateAggregateDetails = true;
            this.forceUpdate();
          });
        } else {
          this.updateResultSet().then(res => {
            if (this.state.debug) l.debug('update result set result line 493:', res);
            try {
              while (res.match(/\"\$regex\" : \/(.+?)\//)) {
                l.debug('Fixing regex before parsing.');
                res = res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"');
              }
              res = JSON.parse(res);
            } catch (e) {
              l.error(e);
              // If first error - Try again!
              if (this.state.firstTry) {
                this.setState({ firstTry: false });
                this.moveBlock(blockFrom, blockTo);
                resolve();
              } else {
                this.setState({ failed: true });
                this.setState({ failureReason: e });
                return;
              }
            }
            if (res.stepAttributes.constructor === Array) {
              // 3. Update Valid for each block.
              res.stepAttributes.map((indexValue, index) => {
                let attributeIndex = index;
                if (index > 0) {
                  attributeIndex = index - 1;
                }
                if (index === res.stepAttributes.length - 1) {
                  // Not empty now.
                } else if (indexValue.constructor === Array) {
                  // Check for error result.
                  if (res.stepCodes[index] === 0) {
                    if (!(typeof indexValue === 'string')) {
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Block Status - Valid', () => {
                      l.debug('OLD: ', editor.blockList[index].attributeList);
                      l.debug('NEW: ', res.stepAttributes[attributeIndex]);
                      editor.blockList[index].attributeList = res.stepAttributes[attributeIndex];
                      editor.blockList[index].status = 'valid';
                    });
                  } else {
                    if (this.state.debug) l.error('Result[', index, '] is invalid: ', indexValue);
                    if (!(typeof indexValue === 'string')) {
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Block Status - Invalid', () => {
                      l.debug('OLD: ', editor.blockList[index].attributeList);
                      l.debug('NEW: ', res.stepAttributes[attributeIndex]);
                      editor.blockList[index].attributeList = res.stepAttributes[attributeIndex];
                      editor.blockList[index].status = 'pending';
                    });
                  }
                }
              });

              // 4. Is the current block valid?.
              if (editor.blockList[editor.selectedBlock].status === 'valid') {
                // 4.a Yes - Update Results.
                this.updateResultsOutput(editor, editor.selectedBlock);
              } else {
                // 4.b No - Clear Results.
                this.clearResultsOutput(editor);
              }

              runInAction('Update Graphical Builder', () => {
                this.props.store.editorPanel.updateAggregateDetails = true;
                this.forceUpdate();
                resolve();
              });
            }
          });
        }
      });
    });
  }

  /**
   *
   */
  moveImportBlock(array, oldIndex, newIndex) {
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
   * Removed a block from a position, updating
   * the builder after the removal.
   * @param {Int} blockPosition - The position to be removed.
   */
  @action.bound
  removeBlock(blockPosition) {
    const editor = this.props.store.editors.get(this.props.id);
    // 1. Remove from Editor Structure.
    l.debug(editor.blockList.splice(blockPosition, 1));
    // 2. Update Shell Steps.
    this.updateShellPipeline(false).then(res => {
      if (res && res.unableToUpdateSteps) {
        // Partial update
        l.error('Unable to complete full update!');

        // 4. Was the block removed the selected block?.
        if (blockPosition === editor.selectedBlock) {
          // 4.a Yes - Set selected block to current - 1.
          runInAction('Select previous block', () => {
            editor.selectedBlock -= 1;
            if (editor.selectedBlock < 0) {
              editor.selectedBlock = 0;
            }
          });
        }
        // 4. Is the current block valid?.
        if (editor.blockList[editor.selectedBlock].status === 'valid') {
          // 4.a Yes - Update Results.
          this.updateResultsOutput(editor, editor.selectedBlock);
        } else {
          // 4.b No - Clear Results.
          this.clearResultsOutput(editor);
        }

        runInAction('Update Details', () => {
          this.props.store.editorPanel.updateAggregateDetails = true;
          this.forceUpdate();
        });
      } else {
        this.updateResultSet().then(res => {
          if (this.state.debug) l.debug('update result set result line 606:', res);
          try {
            while (res.match(/\"\$regex\" : \/(.+?)\//)) {
              l.debug('Fixing regex before parsing.');
              res = res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"');
            }
            res = JSON.parse(res);
          } catch (e) {
            l.error(e);
            // If first error - Try again!
            if (this.state.firstTry) {
              this.setState({ firstTry: false });
              this.removeBlock(blockPosition);
              return;
            }
            // eslint-disable-line
            this.setState({ failed: true });
            this.setState({ failureReason: e });
            return;
          }
          if (res.stepAttributes.constructor === Array) {
            // 3. Update Valid for each block.
            res.stepAttributes.map((indexValue, index) => {
              let attributeIndex = index;
              if (index > 0) {
                attributeIndex = index - 1;
              }
              if (index === res.stepAttributes.length - 1) {
                // Not empty now.
              } else if (indexValue.constructor === Array) {
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
                  if (this.state.debug) l.error('Result[', index, '] is invalid: ', indexValue);
                  if (!(typeof indexValue === 'string')) {
                    indexValue = '[ "' + indexValue.join('", "') + '"]';
                  }
                  runInAction('Update Graphical Builder', () => {
                    editor.blockList[index].attributeList = res.stepAttributes[attributeIndex];
                    editor.blockList[index].status = 'pending';
                  });
                }
              }
            });

            // 4. Was the block removed the selected block?.
            if (blockPosition === editor.selectedBlock) {
              // 4.a Yes - Set selected block to current - 1.
              runInAction('Update Selected Block o N-1', () => {
                editor.selectedBlock -= 1;
              });
              if (editor.selectedBlock < 0) {
                runInAction('Update Selected Block to 0', () => {
                  editor.selectedBlock = 0;
                });
              }
            }

            // 4. Is the current block valid?.
            if (
              editor.blockList[editor.selectedBlock] &&
              editor.blockList[editor.selectedBlock].status === 'valid'
            ) {
              // 4.a Yes - Update Results.
              this.updateResultsOutput(editor, editor.selectedBlock);
            } else {
              // 4.b No - Clear Results.
              this.clearResultsOutput(editor);
            }

            runInAction('Update Details', () => {
              this.props.store.editorPanel.updateAggregateDetails = true;
              this.forceUpdate();
            });
          } else {
            // Check for error.
            if (this.state.debug) l.debug('update result set error 664:', res);
            l.error('updateResultSet: ', JSON.parse(res));
          }
        });
      }
    });
  }

  moveBlockHelper(array, oldIndex, newIndex) {
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
   * Validates that a step is valid before setting all steps in the pipeline.
   *
   * @param {Object} step - The Step object to be validated.
   * @return {Boolean} - Whether or not the step is valid.
   */
  validateBlock(step) {
    if (this.state.debug) l.debug('Validate Agg Block');
    return new Promise((resolve, reject) => {
      const editor = this.props.store.editors.get(this.props.id);
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 60000;
      service
        .update(editor.profileId, {
          shellId: editor.shellId, // eslint-disable-line
          commands: AggregateCommands.VALIDATE_STEP(step)
        })
        .then(res => {
          try {
            while (res.match(/\"\$regex\" : \/(.+?)\//)) {
              l.debug('Fixing regex before parsing.');
              res = res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"');
            }
            res = JSON.parse(res);
          } catch (e) {
            l.error('parsing: ', res);
            l.error(e);
            // If first error - Try again!
            if (this.state.firstTry) {
              this.setState({ firstTry: false });
              this.validateBlock(step);
              resolve(true);
            } else {
              l.error('Failed to validate block ', step, ' with error: ', res);
              resolve(false);
            }
          }
          if (res.type === 'object') {
            resolve(true);
          } else {
            l.error(res);
            resolve(false);
          }
        })
        .catch(e => {
          l.error(e);
          if (e.code === 400) {
            NewToaster.show({
              message: globalString('aggregate_builder/no_active_connection'),
              className: 'danger',
              icon: 'thumbs-down'
            });
          }
          this.setState({ failed: true });
          this.setState({ failureReason: 'ConnectionDoesNotExist' });
          reject(e);
        });
    });
  }

  validateAllBlocks(stepArray) {
    if (this.state.debug) l.debug('Validate all Agg Block');
    return new Promise(resolve => {
      const returnObject = {
        areAllValid: true,
        firstInvalid: -1
      };
      if (stepArray.length === 0) {
        resolve(returnObject);
      }
      stepArray.map((step, stepIndex) => {
        const newStep = step.replace(/,\s*$/, '');
        this.validateBlock(newStep).then(res => {
          if (res === false) {
            if (this.state.debug) l.debug('Set first invalid to: ', stepIndex);
            resolve({
              areAllValid: false,
              firstInvalid: stepIndex
            });
          }
          if (stepIndex === stepArray.length - 1) {
            resolve(returnObject);
          }
        });
      });
    });
  }

  /**
   * Updates the shell pipeline with all the existing steps.
   * @returns {Promise} - A promise with the result of the shell update.
   */
  @action.bound
  updateShellPipeline(preserve) {
    if (this.state.debug) l.debug('Update Shell Pipeline');
    return new Promise((resolve, reject) => {
      // Assemble Step Array.
      const editor = this.props.store.editors.get(this.props.id);
      const stepArray = [];
      editor.blockList.map(block => {
        if (block.type !== 'Start') {
          if (block.byoCode) {
            const stepJSON = block.code;
            stepArray.push(stepJSON.replace(/\n/g, ' '));
          } else {
            const formTemplate = require('./AggregateBlocks/BlockTemplates/' + block.type + '.hbs');
            const stepJSON = formTemplate(block.fields);
            try {
              stepArray.push(stepJSON.replace(/\n/g, ' '));
            } catch (e) {
              l.error('Block generated invalid JSON: ', block);
            }
          }
        }
      });

      // Before setting all steps, validate steps:
      this.validateAllBlocks(stepArray).then(res => {
        if (res.areAllValid === true) {
          if (this.state.debug) l.debug('All blocks are valid.');
          // Update steps in Shell:
          const service = featherClient().service('/mongo-sync-execution');
          service.timeout = 60000;
          service
            .update(editor.profileId, {
              shellId: editor.shellId, // eslint-disable-line
              commands: AggregateCommands.SET_ALL_STEPS(editor.aggregateID, stepArray, preserve),
              responseType: 'text'
            })
            .then(() => {
              this.props.store.api.updateAggregateConfig().then(res => {
                resolve(res);
              });
            })
            .catch(e => {
              l.error(e);
              reject(e);
            });
        } else {
          if (this.state.debug) l.debug('Not all blocks are valid.');
          // There is an invalid step, mark it and update each step.
          editor.blockList.map((block, blockIndex) => {
            if (blockIndex > res.firstInvalid) {
              block.status = 'pending';
            } else {
              block.status = 'valid';
            }
          });
          // Update only first N blocks.
          const validArray = stepArray.slice(0, res.firstInvalid);

          // Update steps in Shell:
          const service = featherClient().service('/mongo-sync-execution');
          service.timeout = 60000;
          service
            .update(editor.profileId, {
              shellId: editor.shellId, // eslint-disable-line
              commands: AggregateCommands.SET_ALL_STEPS(editor.aggregateID, validArray, true),
              responseType: 'text'
            })
            .then(() => {
              this.props.store.api.updateAggregateConfig().then(res => {
                if (res) {
                  res.unableToUpdateSteps = true;
                  resolve(res);
                } else {
                  resolve({ unableToUpdateSteps: true });
                }
              });
            })
            .catch(e => {
              l.error(e);
              reject(e);
            });
        }
      });
    });
  }

  /**
   * Updates the result set in the shell object and receives a list of attributes for each step.
   * @returns {Promise} - A promise with the result of the shell query.
   */
  @action.bound
  updateResultSet() {
    if (this.state.debug) l.debug('Update Result Set');
    return new Promise(resolve => {
      const editor = this.props.store.editors.get(this.props.id);
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
        });
    });
  }

  /**
   * Clear the output tab since no results are avaliable.
   *
   * @param {Object} Editor - The editor to update the output for.
   */
  @action.bound
  clearResultsOutput(editor) {
    const output = this.props.store.outputs.get(editor.id);
    output.output = globalString('aggregate_builder/no_valid_output', editor.selectedBlock);
  }

  /**
   * Updates the output tab to reflect the results for the current step.
   *
   * @param {Object} Editor - The editor to update the output for.
   */
  @action.bound
  updateResultsOutput(editor, stepId) {
    const output = this.props.store.outputs.get(editor.id);

    if (this.state.debug) l.debug('Get Agg Results');
    runInAction('Agg Builder no longer loading', () => {
      this.editor.isAggregateDetailsLoading = true;
    });
    const service = featherClient().service('/mongo-sync-execution');
    service.timeout = 60000;
    service
      .update(editor.profileId, {
        shellId: editor.shellId, // eslint-disable-line
        commands: AggregateCommands.GET_RESULTS(editor.aggregateID, stepId, false)
      })
      .then(res => {
        output.output = globalString('aggregate_builder/valid_output', editor.selectedBlock);
        if (this.state.debug) l.debug('get result res  line 967:', res);
        runInAction('Update Graphical Builder', () => {
          if (!res || res.length === 0) {
            output.output = globalString('aggregate_builder/no_output');
          }
          try {
            while (res.match(/\"\$regex\" : \/(.+?)\//)) {
              l.debug('Fixing regex before parsing.');
              res = res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"');
            }
            res = JSON.parse(res);
          } catch (e) {
            l.error(e);
            // If first error - Try again!
            if (this.state.firstTry) {
              this.setState({ firstTry: false });
              this.updateResultsOutput(editor, stepId);
              return;
            }
            // eslint-disable-line
            this.setState({ failed: true });
            this.setState({ failureReason: e });
            return;
          }
          res.map(indexValue => {
            output.append(JSON.stringify(indexValue) + '\n');
          });
          runInAction('Agg Builder no longer loading', () => {
            this.editor.isAggregateDetailsLoading = false;
          });
        });
      })
      .catch(e => {
        l.error(e);
        l.error('Retry aggregation once more with higher timeout...');
        NewToaster.show({
          message: globalString('aggregate_builder/errors/long_running'),
          className: 'danger',
          icon: 'thumbs-down'
        });
        const service = featherClient().service('/mongo-sync-execution');
        service.timeout = 60000;
        service
          .update(editor.profileId, {
            shellId: editor.shellId, // eslint-disable-line
            commands: AggregateCommands.GET_RESULTS(editor.aggregateID, stepId, false)
          })
          .then(res => {
            runInAction('Update Graphical Builder', () => {
              if (this.state.debug) {
                l.debug(
                  'get result res  line 926:',
                  res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"')
                );
              }
              try {
                while (res.match(/\"\$regex\" : \/(.+?)\//)) {
                  l.debug('Fixing regex before parsing.');
                  res = res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"');
                }
                res = JSON.parse(res);
              } catch (e) {
                l.error(e);
                this.setState({ failed: true });
                this.setState({ failureReason: e });
                return;
              }
              if (res.length === 0) {
                output.output = globalString('aggregate_builder/no_output');
              }
              res.map(indexValue => {
                output.append(JSON.stringify(indexValue) + '\n');
              });
              runInAction('Agg Builder no longer loading', () => {
                this.editor.isAggregateDetailsLoading = false;
              });
            });
          })
          .catch(e => {
            l.error(e);
            this.setState({ failed: true });
            this.setState({ failureReason: e });
          });
      });
  }

  /**
   * Sets the output to loading while it fetches results.
   *
   * @param {Object} editorId - The editor to update the output for.
   */
  @action.bound
  setOutputLoading(editorId) {
    const output = this.props.store.outputs.get(editorId);
    output.output = globalString('aggregate_builder/loading_output');
  }

  /**
   * Sets the output to loading while it fetches results.
   *
   * @param {Object} editorId - The editor to update the output for.
   */
  @action.bound
  setBroken(editorId) {
    const output = this.props.store.outputs.get(editorId);
    output.output = globalString('aggregate_builder/failed_output');
  }

  @action.bound
  onImportButtonClickedFirst() {
    // Check if connection is open first.
    if (this.props.store.editorPanel.activeDropdownId === 'Default') {
      NewToaster.show({
        message: globalString('aggregate_builder/no_active_connection_for_import'),
        className: 'danger',
        icon: 'thumbs-down'
      });
    } else {
      this.setState({ isImportAlertOpen: true });
    }
  }

  @action.bound
  handleCloseAlert() {
    this.setState({ isImportAlertOpen: false });
  }

  /**
   * Import an aggregate builder.
   */
  @action.bound
  onImportButtonClicked() {
    this.setState({ isImportAlertOpen: false });
    if (IS_ELECTRON) {
      dialog.showOpenDialog(
        BrowserWindow.getFocusedWindow(),
        {
          properties: ['openFile', 'multiSelections'],
          filters: FILE_FILTERS
        },
        fileNames => {
          if (!fileNames) {
            return;
          }

          _.forEach(fileNames, v => {
            this.props.store
              .openFile(v, ({ _id, content }) => {
                runInAction('Agg Builder loading', () => {
                  this.editor.isAggregateDetailsLoading = true;
                });
                const contentObject = JSON.parse(content);
                this.importFile(contentObject);
              })
              .catch(() => {});
          });
        }
      );
    } else {
      const warningMsg = globalString('editor/toolbar/notSupportedInUI', 'openFile');
      NewToaster.show({
        message: warningMsg,
        className: 'danger',
        icon: 'thumbs-down'
      });
    }
  }

  /**
   * Export an aggregate builder.
   */
  @action.bound
  onExportButtonClicked() {
    if (IS_ELECTRON) {
      // Get current editor.
      const currentEditor = this.props.store.editors.get(this.props.id);

      // Make sure an editor exists (Sanity Check)
      if (!currentEditor) {
        return Promise.reject();
      }

      // Save file function.
      const _saveFile = (path, fileContent) => {
        const service = featherClient().service('files');
        service.timeout = 60000;
        return service
          .create({ _id: path, content: fileContent, watching: false })
          .then(() => currentEditor.doc.markClean())
          .catch(err => {
            NewToaster.show({
              message: err.message,
              className: 'danger',
              icon: 'thumbs-down'
            });
            throw err;
          });
      };

      return new Promise((resolve, reject) => {
        // Show electron dialog to get the path.
        dialog.showSaveDialog(
          BrowserWindow.getFocusedWindow(),
          {
            defaultPath: path.resolve(
              this.props.store.editorPanel.lastFileSavingDirectoryPath,
              String(currentEditor.fileName)
            ),
            filters: FILE_FILTERS
          },
          fileName => {
            if (!fileName) {
              reject();
            }
            this.props.store.editorPanel.lastFileSavingDirectoryPath = path.dirname(fileName);
            this.getFileContent().then(res => {
              _saveFile(fileName, JSON.stringify(res))
                .then(() => {
                  NewToaster.show({
                    message: globalString('aggregate_builder/export_passed'),
                    className: 'success',
                    icon: 'pt-icon-thumbs-up'
                  });
                  runInAction('update fileName and path', () => {
                    currentEditor.fileName = path.basename(fileName);
                    if (window.navigator.platform.toLowerCase() === 'win32') {
                      currentEditor.fileName = fileName.substring(
                        fileName.lastIndexOf('\\') + 1,
                        fileName.length
                      );
                    }
                    currentEditor.path = fileName;
                  });
                  this.props.store.watchFileBackgroundChange(currentEditor.id);
                  resolve();
                })
                .catch(reject);
            });
          }
        );
      });
    }
  }

  /**
   * Function to convert the relevant objects into an exportable format for saving.
   * @returns {Promise} - Promise containing the resultant contents of the exportable
   * file.
   */
  getFileContent() {
    return new Promise(resolve => {
      const editor = this.props.store.editors.get(this.props.id);
      const exportObject = {
        editorObject: {
          aggConfig: editor.aggConfig,
          aggregateID: editor.aggregateID,
          blockList: editor.blockList,
          collection: editor.collection,
          selectedBlock: editor.selectedBlock
        }
      };
      resolve(exportObject);
    });
  }

  /**
   *
   * @param {Object} contentObject - Object containing the aggregate builder for
   * import.
   */
  @action.bound
  importFile(contentObject) {
    // const editor = this.props.store.editors.get(
    //   this.props.id,
    // );
    // Validate File.
    let isValid;
    if (
      contentObject.editorObject &&
      contentObject.editorObject.blockList &&
      contentObject.editorObject.collection
    ) {
      isValid = true;
    } else {
      isValid = false;
    }
    if (isValid) {
      // Remove all Blocks.
      this.removeAllBlocks()
        .then(() => {
          this.addNewBlocks(contentObject);
        })
        .then(() => {
          this.forceUpdate();
        })
        .catch(err => {
          NewToaster.show({
            message: globalString('aggregate_builder/import_failed'),
            className: 'danger',
            icon: 'thumbs-down'
          });
          this.forceUpdate();
          this.setState({ failed: true });
          this.setState({ failureReason: err });
          l.error(err);
        });
    } else {
      NewToaster.show({
        message: globalString('aggregate_builder/import_failed'),
        className: 'danger',
        icon: 'thumbs-down'
      });
      runInAction('Agg Builder no longer loading', () => {
        this.editor.isAggregateDetailsLoading = false;
      });
      this.forceUpdate();
      l.error('Invalid import object: ', contentObject);
    }
  }

  /**
   * Removes all blocks from the editor to prepare it for an import.
   *
   * @return {Promise} - Promise object containing a successful purging of the blocks.
   */
  removeAllBlocks() {
    return new Promise((resolve, reject) => {
      const editor = this.props.store.editors.get(this.props.id);
      // Splice list.
      editor.blockList.splice(1, editor.blockList.length - 1);
      // Update Agg Object
      this.updateShellPipeline(false).then(res => {
        if (res && res.unableToUpdateSteps) {
          // Partial update
          if (this.state.debug) l.error('Unable to complete full update!');
          editor.selectedBlock = 0;
          // 4. Is the current block valid?.
          if (editor.blockList[editor.selectedBlock].status === 'valid') {
            // 4.a Yes - Update Results.
            this.updateResultsOutput(editor, editor.selectedBlock);
          } else {
            // 4.b No - Clear Results.
            this.clearResultsOutput(editor);
          }
          runInAction('Update Graphical Builder', () => {
            this.props.store.editorPanel.updateAggregateDetails = true;
            this.forceUpdate();
            reject();
          });
        } else {
          this.updateResultSet().then(res => {
            if (this.state.debug) {
              l.debug(
                'update result set result line 1216:',
                res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"')
              );
            }
            try {
              while (res.match(/\"\$regex\" : \/(.+?)\//)) {
                l.debug('Fixing regex before parsing.');
                res = res.replace(/\"\$regex\" : \/(.+?)\//, '"$regex" : "/$1/"');
              }
              res = JSON.parse(res);
            } catch (e) {
              l.error(e);
              if (this.state.firstTry) {
                this.setState({ firstTry: false });
                this.removeAllBlocks();
                resolve();
              } else {
                this.setState({ failed: true });
                this.setState({ failureReason: e });
                return;
              }
            }
            if (res.stepAttributes.constructor === Array) {
              // 3. Update Valid for each block.
              res.stepAttributes.map((indexValue, index) => {
                let attributeIndex = index;
                if (index > 0) {
                  attributeIndex = index - 1;
                }
                if (index === res.stepAttributes.length - 1) {
                  // Not empty now.
                } else if (indexValue.constructor === Array) {
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
                    if (this.state.debug) l.error('Result[', index, '] is invalid: ', indexValue);
                    if (!(typeof indexValue === 'string')) {
                      indexValue = '[ "' + indexValue.join('", "') + '"]';
                    }
                    runInAction('Update Graphical Builder', () => {
                      editor.blockList[index].status = 'pending';
                    });
                  }
                }
              });
              runInAction('Set Selected Aggregate Block to 0', () => {
                editor.selectedBlock = 0;
              });
              // 4. Is the current block valid?.
              if (editor.blockList[editor.selectedBlock].status === 'valid') {
                // 4.a Yes - Update Results.
                this.updateResultsOutput(editor, editor.selectedBlock);
              } else {
                // 4.b No - Clear Results.
                this.clearResultsOutput(editor);
              }
              runInAction('Update Details', () => {
                this.props.store.editorPanel.updateAggregateDetails = true;
                this.forceUpdate();
                resolve();
              });
            } else {
              // Check for error.
              if (this.state.debug) l.debug('update result set error line 1265:', res);
              l.error('updateResultSet: ', JSON.parse(res));
              reject();
            }
          });
        }
      });
    });
  }

  /**
   * Attempts to recreate a new agg builder and restore the existing steps.
   */
  @action.bound
  _restart() {
    return new Promise((resolve, reject) => {
      // Create a new aggregate builder in the shell.
      this.editor = this.props.store.editors.get(this.props.id);
      this.profileId = this.editor.profileId;
      this.shell = this.editor.shellId;
      this.currentDB = this.editor.collection.refParent.text;
      this.currentCollection = this.editor.collection.text;
      const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 60000;
      service
        .update(this.profileId, {
          shellId: this.shell, // eslint-disable-line
          commands: AggregateCommands.NEW_AGG_BUILDER(this.currentDB, this.currentCollection)
        })
        .then(res => {
          if (this.state.debug) l.debug('new agg builder result line 98:', res);
          this.editor.aggregateID = JSON.parse(res).id;
          if (this.editor.blockList.length === 0) {
            this.addStartBlock().then(() => {
              resolve();
            });
          } else {
            this.selectBlock(0);
          }
        })
        .catch(err => {
          if (err.message.includes('Connection does not exist')) {
            this.state.failureReason = 'ConnectionDoesNotExist';
          } else {
            this.state.failureReason = 'Unknown';
          }
          runInAction('Agg Builder no longer loading', () => {
            this.editor.isAggregateDetailsLoading = false;
          });
          this.setState({ failed: true });
          this.setState({ failureReason: err });
          l.error(err);
          reject();
        });
    });
  }

  /**
   * Adds new blocks from an imported file.
   */
  @action.bound
  addNewBlocks(contentObject) {
    return new Promise(() => {
      const importBlockList = contentObject.editorObject.blockList;
      let count = 0;

      // Function for running through the promises synchronously.
      const importBlock = blocks => {
        let p = Promise.resolve();
        blocks.forEach(block => {
          p = p.then(() => {
            if (count === 0) {
              count += 1;
            } else {
              return this.addBlock(block, count).then(() => {
                count += 1;
              });
            }
          });
        });
        return p;
      };
      return importBlock(importBlockList).then(() => {
        // Select last block.
        this.selectBlock(count - 1).then(() => {
          NewToaster.show({
            message: globalString('aggregate_builder/import_passed'),
            className: 'success',
            icon: 'pt-icon-thumbs-up'
          });
        });
      });
    });
  }

  render() {
    if (this.state.failed) {
      if (this.state.failureReason === 'ConnectionDoesNotExist') {
        return (
          <div className="aggregateGraphicalBuilderWrapper">
            <ErrorView
              title={globalString('aggregate_builder/alerts/failed_title')}
              error={globalString('aggregate_builder/alerts/failed_message')}
            />
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              inline
              content={globalString('aggregate_builder/tooltips/restart')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <AnchorButton
                className="retryButton"
                intent={Intent.SUCCESS}
                text={globalString('aggregate_builder/restart')}
                onClick={() => {
                  this.setState({ failed: false });
                  this.setState({ failureReason: null });
                  this._restart().then(res => {
                    l.debug('FINISHED RESTART ', res);
                  });
                }}
              />
            </Tooltip>
          </div>
        );
      }
      return (
        <div className="aggregateGraphicalBuilderWrapper">
          <ErrorView
            title={globalString('aggregate_builder/alerts/failed_title')}
            error={globalString('aggregate_builder/alerts/failed_message_unknown')}
          />
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('aggregate_builder/tooltips/retry')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="retryButton"
              intent={Intent.SUCCESS}
              text={globalString('aggregate_builder/retry')}
              onClick={() => {
                this.setState({ failed: false });
                this.setState({ failureReason: null });
                this.selectBlock(0).then(res => {
                  if (this.state.debug) l.debug('END OF REFRESH: ', res);
                });
              }}
            />
          </Tooltip>
        </div>
      );
    }
    return (
      <div className="aggregateGraphicalBuilderWrapper">
        <div className="topButtons">
          {this.props.store.drawer.drawerChild === DrawerPanes.DEFAULT && (
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              inline
              content={globalString('aggregate_builder/show_left_panel')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <AnchorButton
                className="showLeftPanelButton circleButton"
                intent={Intent.SUCCESS}
                onClick={this.props.store.api.onShowLeftPanelClicked}
              >
                <ShowIcon className="dbKodaSVG" width={20} height={20} />
              </AnchorButton>
            </Tooltip>
          )}
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('aggregate_builder/import_button')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="importButton circleButton"
              intent={Intent.SUCCESS}
              onClick={this.onImportButtonClickedFirst}
            >
              <ImportIcon className="dbKodaSVG" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <Tooltip
            intent={Intent.PRIMARY}
            hoverOpenDelay={1000}
            inline
            content={globalString('aggregate_builder/export_button')}
            tooltipClassName="pt-dark"
            position={Position.BOTTOM}
          >
            <AnchorButton
              className="exportButton circleButton"
              intent={Intent.SUCCESS}
              onClick={this.onExportButtonClicked}
            >
              <ExportIcon className="dbKodaSVG export" width={20} height={20} />
            </AnchorButton>
          </Tooltip>
          <CreateViewButton />
          <GenerateChartButton
            connectionId={this.props.editor.currentProfile}
            editorId={this.props.editor.id}
          />
        </div>
        <Alert
          className="importAlert"
          isOpen={this.state.isImportAlertOpen}
          confirmButtonText={globalString('aggregate_builder/alerts/okay')}
          onConfirm={this.onImportButtonClicked}
          cancelButtonText={globalString('aggregate_builder/alerts/cancel')}
          onCancel={this.handleCloseAlert}
        >
          <p>{globalString('aggregate_builder/alerts/importWarningText')}</p>
        </Alert>
        {!this.editor.isAggregateDetailsLoading ? (
          <ul className="graphicalBuilderBlockList">
            <FirstBlockTarget />
            {this.props.store.editors.get(this.state.id).blockList.map((indexValue, index) => {
              // Get Block Type for SVG Render.
              let posType = 'MIDDLE';
              if (index === 0) {
                posType = 'START';
              } else if (
                index >=
                this.props.store.editors.get(this.state.id).blockList.length - 1
              ) {
                posType = 'END';
              }

              let blockColor = 0;
              const blockColorLocation = _.findIndex(this.state.colorMatching, {
                type: indexValue.type
              });
              // Check if function type already exists
              if (this.state.colorMatching.length === 0) {
                this.state.colorMatching.push({
                  type: indexValue.type,
                  color: 0
                });
                blockColor = 0;
              } else if (blockColorLocation !== -1) {
                // Send through that color for styling.
                blockColor = this.state.colorMatching[blockColorLocation].color;
              } else if (
                blockColorLocation === -1 &&
                this.state.colorMatching.length > 16 &&
                this.state.colorMatching.length % 16 === 0
              ) {
                // Start the color loop again.
                this.state.colorMatching.push({
                  type: indexValue.type,
                  color: 0
                });
                blockColor = 0;
              } else if (this.state.colorMatching.length > 16 && blockColorLocation === -1) {
                // Increment on previous value.
                this.state.colorMatching.push({
                  type: indexValue.type,
                  color: this.state.colorMaching[this.state.colorMatching.length].color + 1
                });
                blockColor = this.state.colorMatching.length - 1;
              } else if (this.state.colorMatching.length < 16 && blockColorLocation === -1) {
                // Increment on previous value.
                blockColor = this.state.colorMatching.length;
                this.state.colorMatching.push({
                  type: indexValue.type,
                  color: blockColor
                });
              }

              let isSelected = false;
              if (this.props.store.editors.get(this.props.id).selectedBlock === index) {
                isSelected = true;
              }
              return (
                <Block
                  key={'key-' + index} //eslint-disable-line
                  listPosition={index}
                  selected={isSelected}
                  positionType={posType}
                  color={blockColor}
                  type={indexValue.type}
                  status={indexValue.status}
                  moveBlock={this.moveBlock}
                  onClickCallback={this.selectBlock}
                  onClickCloseCallback={() => {
                    this.removeBlock(index);
                  }}
                  concrete
                />
              );
            })}
            <LastBlockTarget />
          </ul>
        ) : (
          <div className="loaderWrapper">
            <div className="loader" />
          </div>
        )}
      </div>
    );
  }
}
