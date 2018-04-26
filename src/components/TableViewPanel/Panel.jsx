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
 *
 *
 * @Author: chris
 * @Date:   2017-08-16T12:05:28+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   mike
 * @Last modified time: 2017-09-15 12:35:13
 */

/* eslint no-prototype-builtins:warn */

import React from 'react';
import { action, reaction, runInAction } from 'mobx';
import { inject } from 'mobx-react';
import { Broker, EventType } from '~/helpers/broker';
import JSONViewer from './react-json-viewer/JSONViewer.jsx';
import Toolbar from './Toolbar.jsx';

import './style.scss';

@inject(allStores => ({
  store: allStores.store,
  api: allStores.api
}))
export default class Panel extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      hideDeep: true,
      expandAll: false,
      collapseAll: false,
      isLoading: false,
      arrayState: { 0: true }
    };

    // Enables developer console logging.
    this.debug = false;
    Broker.emit(EventType.FEATURE_USE, 'TableView');

    if (this.props.store.outputPanel.expandTable || this.props.store.outputPanel.collapseTable) {
      this.props.store.outputPanel.expandTable = false;
      this.props.store.outputPanel.collapseTable = false;
    }
    this.reactionToExpandAll = reaction(
      () => this.props.store.outputPanel.expandTable,
      () => this.expandAll()
    );

    this.reactionToCollapseAll = reaction(
      () => this.props.store.outputPanel.collapseTable,
      () => this.collapseAll()
    );
  }

  componentDidMount() {}

  componentWillUnmount() {
    this.reactionToExpandAll();
    this.reactionToCollapseAll();
  }

  @action.bound
  onHeaderClick(string) {
    if (this.debug) console.log('Clicked header: ', string);
  }

  @action.bound
  updateNestedState(number, state) {
    if (this.debug) console.log('Set ', number, 'to ', state);
    this.state.arrayState[number] = state;
  }

  @action.bound
  toggleShowDeep(number) {
    if (typeof this.state.arrayState[number] === 'undefined') {
      this.state.arrayState[number] = true;
    }

    if (this.state.arrayState[number]) {
      this.state.arrayState[number] = false;
    } else {
      this.state.arrayState[number] = true;
    }
    this.forceUpdate();
  }

  @action.bound
  collapseAll() {
    if (this.props.store.outputPanel.collapseTable) {
      this.setState({ collapseAll: true });
      runInAction(() => {
        this.props.store.outputPanel.collapseTable = false;
      });
    }
  }

  @action.bound
  expandAll() {
    if (this.props.store.outputPanel.expandTable) {
      this.setState({ expandAll: true });
      runInAction(() => {
        this.props.store.outputPanel.expandTable = false;
      });
    }
  }

  @action.bound
  openEnhancedJsonView(json) {
    json = JSON.stringify(json);
    this.props.api.initJsonView(json, this.props.store.editorPanel.activeEditorId, 'enhancedJson', {
      start: 0,
      end: 0,
      status: '',
      type: 'SINGLE'
    });
  }

  render() {
    if (this.props.tableJson.json[0] && this.props.tableJson.json[0].loading === 'isLoading') {
      // Probably loading. ;)
      this.state.isLoading = true;
    } else {
      this.state.isLoading = false;
    }

    if (this.state.isLoading) {
      return (
        <div className="table-json-panel">
          <div className="loaderWrapper">
            <div className="loader" />
          </div>
        </div>
      );
    }

    const expand = this.state.expandAll;
    const collapse = this.state.collapseAll;
    this.state.expandAll = false;
    this.state.collapseAll = false;

    if (this.props.tableJson.json === false) {
      return (
        <div className="table-json-panel">
          <h2 className="errorMessage">{globalString('output/editor/tabularError')}</h2>
        </div>
      );
    }
    if (this.debug) console.log(this.state.arrayState);
    return (
      <div className="tableViewWrapper">
        <Toolbar
          expandAll={this.expandAll}
          collapseAll={this.collapseAll}
          totalDocs={this.props.tableJson.json.length}
        />
        <div className="table-json-panel">
          <JSONViewer
            json={this.props.tableJson.json}
            onHeaderClick={this.onHeaderClick}
            toggleShowDeep={this.toggleShowDeep}
            updateNestedState={this.updateNestedState}
            hideDeep={this.state.hideDeep}
            arrayState={this.state.arrayState}
            openEnhancedJsonView={this.openEnhancedJsonView}
            expandAll={expand}
            collapseAll={collapse}
          />
        </div>
      </div>
    );
  }
}
