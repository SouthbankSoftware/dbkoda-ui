/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-08-02T10:00:30+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-25T15:00:08+10:00
 */

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

import React from 'react';
import StorageSunburstView from '#/common/SunburstView';
import { SyncService } from '#/common/SyncService';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Broker, EventType } from '~/helpers/broker';
import { AnchorButton } from '@blueprintjs/core';
import RefreshIcon from '~/styles/icons/refresh-icon.svg';
import './Panel.scss';

// Raw tree data
// const data = require('./data-guy.json');

@inject('store')
@observer
export default class StoragePanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      selectedNode: null,
    };
    this.loadData = this.loadData.bind(this);
    Broker.emit(EventType.FEATURE_USE, 'StorageView');
    this.loadData();
  }
  @action
  loadData() {
    const selectedProfile = this.props.store.profileList.selectedProfile;
    if (
      !selectedProfile ||
      (selectedProfile && selectedProfile.status != 'OPEN')
    ) {
      this.props.store.profileList.selectedProfile.storageView.visible = false;
      return;
    }
    const editorId = this.props.store.editorPanel.activeEditorId;
    if (editorId) {
      this.showLoading(true);
      const editor = this.props.store.editors.get(editorId);
      SyncService.executeQuery(
        'dbe.storageAnalysis()',
        editor.shellId,
        editor.profileId,
      )
        .then((res) => {
          try {
            this.setStorageData(res);
            this.storageData = res;
          } catch (err) {
            this.updateMsg(
              'Unable to parse response from the query. ' + err.message,
            );
          }
        })
        .catch((reason) => {
          this.updateMsg('Error in SyncService: ' + reason);
        });
    }
  }
  setStorageData(data) {
    const newData = data;
    this.addParent(newData);
    this.setState({
      data: newData,
    });
    this.showLoading(false);
    this.showView(true);
  }
  loadChildData(db, col, nodeData) {
    return new Promise((resolve, reject) => {
      const editorId = this.props.store.editorPanel.activeEditorId;
      if (editorId) {
        this.showLoading(true);
        const editor = this.props.store.editors.get(editorId);
        SyncService.executeQuery(
          'dbe.collectionStorageAnalysis("' + db + '", "' + col + '" , 1000)',
          editor.shellId,
          editor.profileId,
        )
          .then((res) => {
            try {
              this.showLoading(false);
              if (!nodeData.children) {
                nodeData.children = res;
                if (this.getChildrenSize(nodeData) > 0) {
                  nodeData.size = 0;
                }
                this.addParent(nodeData);
              }
              resolve(true);
            } catch (err) {
              reject('Unable to parse response from the query. ' + err.message);
            }
          })
          .catch((reason) => {
            reject('Error in SyncService: ' + reason);
          });
      }
    });
  }
  storageData; // Keeps original storage Data to revert to from child node.
  childData;
  @observable msg = 'Loading Storage View...';
  @observable bLoading = false;
  @observable bStorageView = false;
  // This function calculates the sum of the child size attribute
  getChildrenSize(nodeData) {
    let size = 0;
    if (nodeData.children) {
      for (const child of nodeData.children) {
        if (isNaN(child.size)) {
          child.size = 0;
        }
        size += this.getChildrenSize(child);
      }
    } else {
      size += nodeData.size;
    }
    return size;
  }
  // Here we make the tree backward navigatable. You can use your own navigation strategy, for example, dynamic loading
  addParent(data) {
    if (data.children) {
      for (const child of data.children) {
        child.parent = data;
        this.addParent(child);
      }
    }
  }
  @action
  showView(value) {
    this.bStorageView = value;
  }
  @action
  showLoading(value) {
    this.bLoading = value;
  }
  @action
  updateMsg(value) {
    this.msg = value;
    if (value === 'Loading Storage View...') {
      this.bLoading = true;
    } else {
      this.bLoading = false;
    }
  }
  onChartBreadCrumbClick = (node) => {
    if (this.state.selectedNode != node) {
      this.setState({
        selectedNode: node,
      });
    }
  };
  onChildDblClick = (node) => {
    // node is a tree Node in d3-hierachy (https://github.com/d3/d3-hierarchy) that just clicked by user
    if (this.state.selectedNode == node) {
      // root is clicked, we should move upward in the data tree
      if (node.parent) {
        this.setState({
          selectedNode: node.parent,
        });
      }
    } else {
      // a child is clicked, we should move downward in the data tree
      this.setState({
        selectedNode: node,
      });
    }
  };

  onChildClick = (node) => {
    const nodeData = node.data;
    if (
      nodeData.name == 'data' &&
      nodeData.parent &&
      nodeData.parent.parent &&
      nodeData.parent.parent.parent &&
      nodeData.parent.parent.parent.name == 'total' &&
      !nodeData.children
    ) {
      this.loadChildData(
        nodeData.parent.parent.name,
        nodeData.parent.name,
        nodeData,
      )
        .then((res) => {
          if (res) {
            this.forceUpdate();
          }
          // this.setState({
          //   data: resNodeData,
          // });
        })
        .catch((reason) => {
          this.updateMsg(reason);
        });
    }
  };

  render() {
    return (
      <div className="StoragePanel">
        {!this.bLoading && (
          <nav className="storageToolbar pt-navbar pt-dark">
            <div className="pt-navbar-group pt-align-right">
              <AnchorButton className="refreshButton" onClick={this.loadData}>
                <RefreshIcon width={50} height={50} className="dbKodaSVG" />
              </AnchorButton>
            </div>
          </nav>
        )}
        {this.bStorageView && (
          <StorageSunburstView
            data={this.state.data}
            selectedNode={this.state.selectedNode}
            onClick={this.onChildClick}
            onDblClick={this.onChildDblClick}
            onBreadCrumbClick={this.onChartBreadCrumbClick}
            store={this.props.store}
          />
        )}
        {this.bLoading && (
          <div>
            <div className="details-msg-div">
              <div className="messageWrapper">
                {this.bLoading && (
                  <div className="iconWrapper">
                    <div className="loader" />
                  </div>
                )}
                {!this.bLoading &&
                !this.bStorageView && (
                  <span className="failureText">{this.msg}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
