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
 * @Last modified time: 2017-09-13 15:23:46
 */

/* eslint no-prototype-builtins:warn */

import React from 'react';
import { action } from 'mobx';
import JSONViewer from './react-json-viewer/JSONViewer.jsx';
import Toolbar from './Toolbar.jsx';

import './style.scss';

export default class Panel extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      hideDeep: true,
      expandAll: false,
      collapseAll: false,
      arrayState: { 0: true },
    };
  }

  @action.bound
  onHeaderClick(string) {
    if (false) console.log(string);
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
    for (let i = 0; i < this.props.tableJson.json.length + 2; i += 1) {
      this.state.arrayState[i] = false;
    }
    this.forceUpdate();
  }

  @action.bound
  expandAll() {
    for (let i = 0; i < this.props.tableJson.json.length + 2; i += 1) {
      this.state.arrayState[i] = true;
    }
    this.forceUpdate();
  }

  render() {
    if (this.props.tableJson.json === false) {
      return (
        <div className="table-json-panel">
          <h2 className="errorMessage">
            {globalString('output/editor/tabularError')}
          </h2>
        </div>
      );
    }
    return (
      <div className="tableViewWrapper">
        <Toolbar expandAll={this.expandAll} collapseAll={this.collapseAll} />
        <div className="table-json-panel">
          <JSONViewer
            json={this.props.tableJson.json}
            onHeaderClick={this.onHeaderClick}
            toggleShowDeep={this.toggleShowDeep}
            hideDeep={this.state.hideDeep}
            arrayState={this.state.arrayState}
          />
        </div>
      </div>
    );
  }
}
