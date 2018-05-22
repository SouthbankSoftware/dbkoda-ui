/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-08-02T10:00:30+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-18T08:01:06+10:00
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

import _ from 'lodash';
import autobind from 'autobind-decorator';
import React from 'react';
import StorageSunburstView from '#/common/SunburstView';
import { action, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Broker, EventType } from '~/helpers/broker';
import { AnchorButton } from '@blueprintjs/core';
import RefreshIcon from '~/styles/icons/refresh-icon.svg';
import './Panel.scss';

// Raw tree data
// const data = require('./data-guy.json');

@inject(({ store, api }) => {
  return {
    store,
    api
  };
})
@observer
export default class StoragePanel extends React.Component {
  childData;
  @observable msg = 'Loading Storage View...';
  @observable bStorageView = false;

  constructor(props) {
    super(props);

    this.state = {
      data: {},
      selectedNode: null,
      bLoading: true
    };

    Broker.emit(EventType.FEATURE_USE, 'StorageView');
    this.loadData(false);
  }

  @action.bound
  loadData(showLoading = true) {
    if (showLoading) {
      this.showLoading(true);
    }
    this.props.api
      .getStorageData(this.props.profileId, this.props.shellId)
      .then(res => {
        try {
          this.setStorageData(res);
        } catch (err) {
          this.updateMsg('Unable to parse response from the query. ' + err.message);
        }
      })
      .catch(reason => {
        this.updateMsg('Error in SyncService: ' + reason);
      });
  }

  @autobind
  setStorageData(data) {
    const newData = data;
    this.addParent(newData);
    this.setState({
      data: newData
    });
    this.showLoading(false);
    this.showView(true);
  }

  @action.bound
  loadChildData(db, col, nodeData) {
    return new Promise(resolve => {
      this.showLoading(true);
      this.props.api
        .getChildStorageData(this.props.profileId, this.props.shellId, db, col)
        .then(res => {
          try {
            if (typeof res == 'string' && res.indexOf('Error') >= 0) {
              l.error(res);
            } else {
              l.info(res);
              if (!nodeData.children) {
                nodeData.children = res;
                if (this.getChildrenSize(nodeData) > 0) {
                  nodeData.size = 0;
                }
                this.addParent(nodeData);
              }
            }
            this.showLoading(false);
            resolve(true);
          } catch (err) {
            this.updateMsg('Unable to parse response from the query. ' + err.message);
          }
        })
        .catch(reason => {
          this.updateMsg('Error in SyncService: ' + reason);
        });
    });
  }

  // This function calculates the sum of the child size attribute
  @autobind
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
  @autobind
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

  @autobind
  showLoading(value) {
    this.setState({ bLoading: value });
  }

  @action
  updateMsg(value) {
    this.msg = value;
    if (value === 'Loading Storage View...') {
      this.showLoading(true);
    } else {
      this.showLoading(false);
    }
  }

  @autobind
  onChartBreadCrumbClick(node) {
    if (this.state.selectedNode != node) {
      this.setState({
        selectedNode: node
      });
    }
  }

  @autobind
  onChildDblClick(node) {
    // node is a tree Node in d3-hierachy (https://github.com/d3/d3-hierarchy) that just clicked by user
    if (this.state.selectedNode == node) {
      // root is clicked, we should move upward in the data tree
      if (node.parent) {
        this.setState({
          selectedNode: node.parent
        });
      }
    } else {
      // a child is clicked, we should move downward in the data tree
      this.setState({
        selectedNode: node
      });
      const dataNode = _.find(node.children, child => {
        return child.data.name === 'data';
      });
      if (dataNode) {
        l.info(dataNode);
        this.onChildClick(dataNode);
      }
    }
  }

  @autobind
  onChildClick(node) {
    const nodeData = node.data;
    if (
      nodeData.name == 'data' &&
      nodeData.parent &&
      nodeData.parent.parent &&
      nodeData.parent.parent.parent &&
      nodeData.parent.parent.parent.name == 'total' &&
      !nodeData.children
    ) {
      this.loadChildData(nodeData.parent.parent.name, nodeData.parent.name, nodeData);
    }
  }

  render() {
    return (
      <div className="StoragePanel">
        {!this.state.bLoading && (
          <nav className="storageToolbar pt-navbar pt-dark">
            <div className="pt-navbar-group pt-align-right">
              <AnchorButton className="refreshButton" onClick={() => this.loadData(true)}>
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
        {this.state.bLoading && (
          <div>
            <div className="details-msg-div">
              <div className="messageWrapper">
                {this.state.bLoading && (
                  <div className="iconWrapper">
                    <div className="loader" />
                  </div>
                )}
                {!this.state.bLoading &&
                  !this.bStorageView && <span className="failureText">{this.msg}</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
