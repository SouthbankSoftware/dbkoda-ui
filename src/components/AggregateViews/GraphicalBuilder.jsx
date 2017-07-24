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
import { BlockTypes } from './AggregateBlocks/BlockTypes.js';
import Block from './AggregateBlocks/Block.jsx';
import FirstBlockTarget from './AggregateBlocks/FirstBlockTaget.jsx';
import LastBlockTarget from './AggregateBlocks/LastBlockTarget.jsx';
import './style.scss';

@inject(allStores => ({
  store: allStores.store,
}))
@observer
export default class GraphicalBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentBlocks:[
        {
          type: BlockTypes.AGGREGATE.type
        },
        {
          type: BlockTypes.GROUP_BY.type
        },
        {
          type: BlockTypes.MATCH.type
        }
      ]
    };
  }

  /**
   * Moves two blocks by swapping the indicies of the blocks.
   * @param {Integer} oldIndex - The index of the block to be moved.
   * @param {Integer} newIndex - The index where the block is to be moved to.
   */
  moveBlock(oldIndex, newIndex) {
    // Standard array move:
    if (newIndex >= this.state.currentBlocks.length) {
      let tmpArray = newIndex - this.state.currentBlocks.length;
      while ((tmpArray -= 1) + 1) {
        this.state.currentBlocks.push(undefined);
      }
    }
    this.state.currentBlocks.splice(newIndex, 0, this.state.currentBlocks.splice(oldIndex, 1)[0]);
  }

  render() {
    return (
      <div className="aggregateGraphicalBuilderWrapper">
        <ul className="graphicalBuilderBlockList">
          <FirstBlockTarget />
          {this.state.currentBlocks.map((indexValue, index) => {
            return (
              <Block
                listPosition={index}
                type={indexValue.type}
                concrete
              />
            );
          })}
          <LastBlockTarget />
        </ul>
      </div>
    );
  }
}

