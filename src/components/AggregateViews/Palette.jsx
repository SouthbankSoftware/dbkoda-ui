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
import { action } from 'mobx';
import { BlockTypes } from './AggregateBlocks/BlockTypes.js';
import Block from './AggregateBlocks/Block.jsx';


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

