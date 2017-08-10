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
 * @Last modified by:   Mike
 * @Last modified time: 2017-07-19 11:17:49
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
import { featherClient } from '~/helpers/feathers';
import { action, runInAction } from 'mobx';
import { BlockTypes } from './AggregateBlocks/BlockTypes.js';
import Block from './AggregateBlocks/Block.jsx';
import { AggregateCommands } from './AggregateCommands.js';


@inject(allStores => ({
  store: allStores.store,
}))
@observer
export default class Palette extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @action.bound
  addBlock(blockType, position) {
    // Check if empty array
    const tmpArray = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).blockList.slice();
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
    this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).blockList = tmpArray;

    // Add initial block attributes to newly created block.
    this.getBlockAttributes(position);
    // Add block to shell object.
    this.addBlockToShell(blockType, position);
  }

  @action.bound
  getBlockAttributes(position) {
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    if (position === 'END') {
      position = editor.blockList.length - 1;
    } else if (position === 'START') {
      position = 0;
    }
    // First block, set attributes list to all attributes:
    const service = featherClient().service('/mongo-sync-execution');
    service.timeout = 30000;
    service
      .update(editor.profileId, {
        shellId: editor.shellId, // eslint-disable-line
        commands: AggregateCommands.GET_ATTRIBUTES(editor.aggregateID, position)
      })
    .then((res) => {
      editor.blockList[position].attributeList = res;
      // If no block is selected, select the new block.
      if (!this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).selectedBlock) {
        runInAction(() => {
          this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).selectedBlock = 0;
          this.props.store.editorPanel.updateAggregateDetails = true;
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
  }

  @action.bound
  addBlockToShell(blockType, position) {
    // First add initial Step JSON to block object in MobX.
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    if (position === 'END') {
      position = editor.blockList.length - 1;
    } else if (position === 'START') {
      position = 0;
    }
    const formTemplate = require('./AggregateBlocks/BlockTemplates/' + blockType + '.hbs'); //eslint-disable-line
    let generatedCode = formTemplate();
    generatedCode = generatedCode.replace(/(\$[A-Za-z0-9]*)/g, '\"$1\"');
    generatedCode = generatedCode.replace(/(\_[A-Za-z0-9]*)/g, '\"$1\"');
    generatedCode = JSON.parse(generatedCode);
    editor.blockList[position].stepJSON = generatedCode;

    // Determine if block is valid (Is the previous block valid)
    if (position === 0) {
      editor.blockList[position].status = 'valid';
    } else if (editor.blockList[position - 1].status === 'valid') {
      editor.blockList[position].status = 'pending';
    } else if (editor.blockList[position - 1].status === 'pending') {
      editor.blockList[position].status = 'pending';
    }

    // Secondly add initial step JSON to block object in Shell Object.
    const service = featherClient().service('/mongo-sync-execution');
      service.timeout = 30000;
      service
        .update(editor.profileId, {
          shellId: editor.shellId, // eslint-disable-line
          commands: AggregateCommands.ADD_STEP(editor.aggregateID, generatedCode, position)
        })
      .then((res) => {
        console.log('Debug: result from add step: ', res);
      })
      .catch((err) => {
        console.error(err);
      });
  }

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

  getBlocksList() {
    return (
      <div className="aggregatePaletteContent">
        <ul className="aggregateBlockList">
          {Object.keys(BlockTypes).map((keyName, index) => {
            return (
              <li
                key={'key-' + index} //eslint-disable-line
                className="aggregateBlockWrapper">
                <Block
                  key={'key-' + index} //eslint-disable-line
                  listPosition={index}
                  type={BlockTypes[keyName].type}
                  concrete={false}
                  addBlock={this.addBlock}
                />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  render() {
    return (
      <div className="aggregatePaletteWrapper">
        <nav className="aggregatePaletteToolbar pt-navbar pt-dark">
          <h2 className="paletteHeader">
            Pipeline Elements
          </h2>
        </nav>
        {this.getBlocksList()}
      </div>
    );
  }
}

