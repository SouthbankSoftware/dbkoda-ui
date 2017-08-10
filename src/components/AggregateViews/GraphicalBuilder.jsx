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
import {
  AnchorButton,
  Intent,
} from '@blueprintjs/core';
import { DrawerPanes } from '#/common/Constants';
import { featherClient } from '~/helpers/feathers';
import Block from './AggregateBlocks/Block.jsx';
import FirstBlockTarget from './AggregateBlocks/FirstBlockTaget.jsx';
import LastBlockTarget from './AggregateBlocks/LastBlockTarget.jsx';
import './style.scss';
import { AggregateCommands } from './AggregateCommands.js';

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
      colorMatching: [],
      db: props.db,
      collection: props.collection
    };

    // Set up the aggregate builder in the shell.
    this.editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    this.profileId = this.editor.profileId;
    this.shell = this.editor.shellId;
    this.currentDB = this.editor.collection.refParent.text;
    this.currentCollection = this.editor.collection.text;

    // Add aggregate object to shell.
    const service = featherClient().service('/mongo-sync-execution');
    service.timeout = 30000;
    service
      .update(this.profileId, {
        shellId: this.shell, // eslint-disable-line
        commands: AggregateCommands.NEW_AGG_BUILDER(this.currentDB, this.currentCollection)
      })
    .then((res) => {
      this.editor.aggregateID = res;
      console.log('Debug: New Aggregate Builder Registered on Shell: ', res);
    })
    .catch((err) => {
      console.error(err);
    });
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
    this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).selectedBlock = this.state.activeBlockIndex;
    this.props.store.editorPanel.updateAggregateDetails = true;
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

  @action.bound
  onShowLeftPanelClicked() {
    console.log('Debug: Show left Panel');
    this.props.store.drawer.drawerChild = DrawerPanes.AGGREGATE;
  }

  render() {
    return (
      <div className="aggregateGraphicalBuilderWrapper">
        { this.props.store.drawer.drawerChild === DrawerPanes.DEFAULT &&
          <AnchorButton
            className="showLeftPanelButton"
            intent={Intent.SUCCESS}
            text={globalString('aggregate_builder/show_left_panel')}
            onClick={this.onShowLeftPanelClicked} />
        }
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
            if (this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).selectedBlock === index) {
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

