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
import _ from 'lodash';
import { inject, observer } from 'mobx-react';
import { action } from 'mobx';
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
      id: props.id,
      activeBlockIndex: this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).selectedBlock,
      colorMatching: []
    };

    // Find the active block
  }

  @action.bound
  selectBlock(index) {
    this.setState({activeBlockIndex: index});
    this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).selectedBlock = index;
    this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).blockList[index].isSelected = true;
    this.props.store.editorPanel.updateAggregateDetails = true;
  }

  @action.bound
  moveBlock(blockFrom, blockTo) {
    const tmpArray = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).blockList;
    this.moveBlockHelper(tmpArray, blockFrom, blockTo);
    this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).blockList = tmpArray;
    if (this.state.activeBlockIndex === blockFrom) {
      this.setState({activeBlockIndex: blockTo});
    } else if (this.state.activeBlockIndex === blockTo && blockTo === 0) {
      this.setState({activeBlockIndex: blockTo + 1});
    } else if (this.state.activeBlockIndex === blockTo && blockTo === tmpArray.length - 1) {
      this.setState({activeBlockIndex: blockTo - 1});
    } else if (this.state.activeBlockIndex === blockTo) {
      if (blockFrom > blockTo) {
        this.setState({activeBlockIndex: blockTo + 1});
      } else {
        this.setState({activeBlockIndex: blockTo - 1});
      }
    }
    this.forceUpdate();
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

  render() {
    return (
      <div className="aggregateGraphicalBuilderWrapper">
        <ul className="graphicalBuilderBlockList">
          <FirstBlockTarget />
          {this.props.store.editors.get(this.state.id).blockList.map((indexValue, index) => {
            // Get Block Type for SVG Render.
            let posType = 'MIDDLE';
            if (index === 0) {
              posType = 'START';
            } else if (index >= this.props.store.editors.get(this.state.id).blockList.length - 1) {
              posType = 'END';
            }

            let blockColor = 0;
            const blockColorLocation = _.findIndex(this.state.colorMatching, {'type': indexValue.type});
            // Check if function type already exists
            if (this.state.colorMatching.length === 0) {
              this.state.colorMatching.push({'type': indexValue.type, 'color': 0});
              blockColor = 0;
            } else if (blockColorLocation !== -1) {
              // Send through that color for styling.
              blockColor = this.state.colorMatching[blockColorLocation].color;
            } else if (
              (blockColorLocation === -1) &&
              (this.state.colorMatching.length > 16) &&
              (this.state.colorMatching.length % 16) === 0) {
                // Start the color loop again.
                this.state.colorMatching.push({'type': indexValue.type, 'color': 0});
                blockColor = 0;
            } else if (this.state.colorMatching.length > 16 && blockColorLocation === -1) {
              // Increment on previous value.
              this.state.colorMatching.push({'type': indexValue.type, 'color': this.state.colorMaching[this.state.colorMatching.length].color + 1});
              blockColor = this.state.colorMatching.length - 1;
            } else if (this.state.colorMatching.length < 16 && blockColorLocation === -1) {
              // Increment on previous value.
              blockColor = this.state.colorMatching.length;
              this.state.colorMatching.push({'type': indexValue.type, 'color': blockColor});
            }

            let isSelected = false;
            if (this.state.activeBlockIndex === index) {
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
                moveBlock={this.moveBlock}
                onClickCallback={this.selectBlock}
                concrete
              />
            );
          })}
          <LastBlockTarget />
        </ul>
        <div className="divider" />
      </div>
    );
  }
}

