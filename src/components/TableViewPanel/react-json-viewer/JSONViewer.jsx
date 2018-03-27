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

/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint react/require-default-props: 0 */
/* eslint react/forbid-prop-types: 0 */
/* eslint react/no-array-index-key: 0 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { action } from 'mobx';
import { ContextMenu, Menu, MenuItem, MenuDivider } from '@blueprintjs/core';
import ValueViewer from './ValueViewer';
import { loopObject, getType, getFirstEle, checkIfArrayIsAOB, checkIfObjectIsOOB } from './util';

export default class JSONViewer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      deep: false,
      renderArrayCount: 0,
      isContextMenuOpen: false,
    };

    this.debug = false;
  }

  renderHeaderByKeys(keys, addExtra) {
    return (
      <thead {...this.props.theadProps}>
        <tr {...this.props.trProps}>
          {(() => {
            if (addExtra === 'addExtra') {
              return (
                <th
                  onClick={() => this.props.onHeaderClick('header')}
                  {...this.props.thProps}
                  style={this.constructor.styles.td}
                >
                  <span style={{ color: 'rgb(111, 11, 11)' }} />
                </th>
              );
            }
          })()}
          {keys.map((key, i) => {
            return (
              <th
                onClick={() => this.props.onHeaderClick('header')}
                {...this.props.tdProps}
                key={i}
                style={this.constructor.styles.td}
              >
                <span style={{ color: 'rgb(111, 11, 11)' }}>{key}</span>
              </th>
            );
          })}
        </tr>
      </thead>
    );
  }

  objToTable(obj) {
    if (JSON.stringify(obj) === '{}') {
      return '{ }';
    }
    return (
      <table {...this.props.tableProps}>
        {this.renderHeaderByKeys(Object.keys(obj))}
        <tbody>
          <tr {...this.props.trProps}>
            {loopObject(obj, (v, key) => {
              return this.renderTd(v, key);
            })}
          </tr>
        </tbody>
      </table>
    );
  }

  arrayToTable(obj) {
    this.state.renderArrayCount += 1;
    const currentInt = this.state.renderArrayCount;
    let showCurrentInt = this.props.arrayState[currentInt];
    if (typeof showCurrentInt === 'undefined') {
      showCurrentInt = false;
    } else if (showCurrentInt === false) {
      showCurrentInt = false;
    } else if (showCurrentInt === true) {
      showCurrentInt = true;
    }
    if (this.props.collapseAll === true) showCurrentInt = false;
    if (this.props.expandAll === true) showCurrentInt = true;

    this.props.updateNestedState(currentInt, showCurrentInt);

    if (this.state.deep && !showCurrentInt) {
      return (
        <span className="expandButton" onClick={() => this.props.toggleShowDeep(currentInt)}>
          {globalString('output/editor/expand')}
        </span>
      );
    } else if (this.state.deep && showCurrentInt) {
      // Show deep objects
      if (getType(obj) === 'Array' && obj.length === 0) {
        return '[ ]';
      }
      return (
        <div className="deepObjectWrapper">
          <span className="hideButton" onClick={() => this.props.toggleShowDeep(currentInt)}>
            {globalString('output/editor/hide')}
          </span>
          <table {...this.props.tableProps}>
            <tbody>
              {loopObject(obj, (v, key) => {
                return (
                  <tr {...this.props.trProps}>
                    <td
                      onClick={() => this.props.onCellClick('cell in array')}
                      {...this.props.tdProps}
                      style={this.constructor.styles.td}
                    >{`${key}`}
                    </td>
                    {this.renderTd(v, key)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (getType(obj) === 'Array' && obj.length === 0) {
      return '[ ]';
    }
    return (
      <table {...this.props.tableProps}>
        <tbody>
          {loopObject(obj, (v, key) => {
            return (
              <tr {...this.props.trProps}>
                <td
                  onClick={() => this.props.onCellClick('cell in array')}
                  {...this.props.tdProps}
                  style={this.constructor.styles.td}
                >{`${key}`}
                </td>
                {this.renderTd(v, key)}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  oobToTable(aob) {
    return (
      <table {...this.props.tableProps}>
        {this.renderHeaderByKeys(Object.keys(getFirstEle(aob)), 'addExtra')}
        <tbody>
          {loopObject(aob, (row, j) => {
            return (
              <tr {...this.props.trProps} key={j}>
                <td
                  onClick={() => this.props.onCellClick('cell')}
                  {...this.props.tdProps}
                  style={this.constructor.styles.td}
                >
                  <ValueViewer value={j} />
                </td>
                {loopObject(getFirstEle(aob), (val, key) => {
                  return this.renderTd(row[key], key);
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  renderTd(guess, index) {
    return (
      <td
        onClick={() => this.props.onHeaderClick('cell')}
        {...this.props.tdProps}
        key={index}
        style={this.constructor.styles.td}
      >
        {this.decideAndRender(guess)}
      </td>
    );
  }

  decideAndRender(guess) {
    if (getType(guess) === 'Array') {
      if (checkIfArrayIsAOB(guess)) {
        return this.aobToTable(guess);
      }
      return this.arrayToTable(guess);
    }
    if (getType(guess) === 'Object') {
      if (checkIfObjectIsOOB(guess)) {
        return this.oobToTable(guess);
      }
      return this.objToTable(guess);
    }
    return <ValueViewer value={guess} />;
  }

  aobToTable(aob) {
    this.state.renderArrayCount += 1;
    const currentInt = this.state.renderArrayCount;
    let showCurrentInt = this.props.arrayState[currentInt];
    if (typeof showCurrentInt === 'undefined') {
      showCurrentInt = false;
    } else if (showCurrentInt === false) {
      showCurrentInt = false;
    } else if (showCurrentInt === true) {
      showCurrentInt = true;
    }
    // Button override.
    if (this.props.collapseAll === true) showCurrentInt = false;
    if (this.props.expandAll === true) showCurrentInt = true;

    this.props.updateNestedState(currentInt, showCurrentInt);

    if (this.state.deep && !showCurrentInt) {
      // Hide this objects.
      return (
        <span className="expandButton" onClick={() => this.props.toggleShowDeep(currentInt)}>
          {globalString('output/editor/expand')}
        </span>
      );
    } else if (this.state.deep && showCurrentInt) {
      // Show deep objects
      return (
        <div className="deepObjectWrapper">
          <span className="hideButton" onClick={() => this.props.toggleShowDeep(currentInt)}>
            {globalString('output/editor/hide')}
          </span>
          <table {...this.props.tableProps}>
            {this.renderHeaderByKeys(Object.keys(getFirstEle(aob)))}
            <tbody {...this.props.tbodyProps}>
              {loopObject(aob, (row, j) => {
                return (
                  <tr {...this.props.trProps} key={j}>
                    {loopObject(getFirstEle(aob), (val, key) => {
                      return this.renderTd(row[key], key);
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    // Root level object
    this.state.deep = true;
    return (
      <table {...this.props.tableProps}>
        {this.renderHeaderByKeys(Object.keys(getFirstEle(aob)))}
        <tbody {...this.props.tbodyProps}>
          {loopObject(aob, (row, j) => {
            return (
              <tr
                {...this.props.trProps}
                key={j}
                onContextMenu={(e) => {
                  this.showContextMenu(e, j, row);
                }}
              >
                {loopObject(getFirstEle(aob), (val, key) => {
                  return this.renderTd(row[key], key);
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  @action.bound
  showContextMenu(e, row, json) {
    // invoke static API, getting coordinates from mouse event
    ContextMenu.show(
      <Menu>
        <MenuItem
          icon="search-around"
          text="Enhanced JSON View"
          onClick={() => this.props.openEnhancedJsonView(json)}
        />
        <MenuDivider />
        <MenuItem disabled text={'Clicked on row ' + row + 1} />
      </Menu>,
      { left: e.clientX, top: e.clientY },
      () => this.setState({ isContextMenuOpen: false }),
    );
    // indicate that context menu is open so we can add a CSS class to this element
    this.setState({ isContextMenuOpen: true });
  }

  render() {
    this.state.deep = false;
    this.state.renderArrayCount = 0;
    return <div>{this.decideAndRender(this.props.json)}</div>;
  }
}

JSONViewer.propTypes = {
  json: PropTypes.any.isRequired,
  tableProps: PropTypes.object,
  trProps: PropTypes.object,
  tdProps: PropTypes.object,
  thProps: PropTypes.object,
  tbodyProps: PropTypes.object,
  theadProps: PropTypes.object,
};

JSONViewer.defaultProps = {};

JSONViewer.styles = {
  td: {
    border: '1px solid #cccccc',
    textAlign: 'left',
    margin: 0,
    padding: '6px 13px',
  },
  th: {
    border: '1px solid #cccccc',
    textAlign: 'left',
    margin: 0,
    padding: '6px 13px',
    fontWeight: 'bold',
  },
};
