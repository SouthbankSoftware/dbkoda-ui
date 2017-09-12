import React, { Component } from 'react';
import ValueViewer from './ValueViewer';
import {
  loopObject,
  getType,
  getFirstEle,
  checkIfArrayIsAOB,
  checkIfObjectIsOOB,
} from './util';

/* eslint-disable */
const ZERO = 0;

export default class JSONViewer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      deep: false,
      renderArrayCount: 0,
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
      showCurrentInt = true;
    } else if (showCurrentInt === false) {
      showCurrentInt = false;
    } else if (showCurrentInt === true) {
      showCurrentInt = true;
    }
    if (this.state.deep && !showCurrentInt) {
      // Hide this objects.
      if (this.debug) console.log('Array ', currentInt, ' is hidden');
      return (
        <span
          className="expandButton"
          onClick={() => this.props.toggleShowDeep(currentInt)}
        >
          {globalString('output/editor/expand')}
        </span>
      );
    } else if (this.state.deep && showCurrentInt) {
      //Show deep objects
      if (this.debug) console.log('Array ', currentInt, ' is visible');
      if (getType(obj) === 'Array' && obj.length === ZERO) {
        return '[ ]';
      }
      return (
        <div className="deepObjectWrapper">
          <span
            className="hideButton"
            onClick={() => this.props.toggleShowDeep(currentInt)}
          >
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
                    >{`${key}`}</td>
                    {this.renderTd(v, key)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (getType(obj) === 'Array' && obj.length === ZERO) {
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
                >{`${key}`}</td>
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
      showCurrentInt = true;
    } else if (showCurrentInt === false) {
      showCurrentInt = false;
    } else if (showCurrentInt === true) {
      showCurrentInt = true;
    }
    if (this.state.deep && !showCurrentInt) {
      // Hide this objects.
      if (this.debug) console.log('Array ', currentInt, ' is hidden');
      return (
        <span
          className="expandButton"
          onClick={() => this.props.toggleShowDeep(currentInt)}
        >
          {globalString('output/editor/expand')}
        </span>
      );
    } else if (this.state.deep && showCurrentInt) {
      //Show deep objects
      if (this.debug) console.log('Array ', currentInt, ' is visible');
      return (
        <div className="deepObjectWrapper">
          <span
            className="hideButton"
            onClick={() => this.props.toggleShowDeep(currentInt)}
          >
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
    } else {
      // Root level object
      if (this.debug) console.log('Root level object.');
      this.state.deep = true;
      return (
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
      );
    }
  }

  render() {
    this.state.deep = false;
    this.state.renderArrayCount = 0;
    return <div>{this.decideAndRender(this.props.json)}</div>;
  }
}
JSONViewer.propTypes = {
  json: React.PropTypes.any.isRequired,
  tableProps: React.PropTypes.object,
  trProps: React.PropTypes.object,
  tdProps: React.PropTypes.object,
  thProps: React.PropTypes.object,
  tbodyProps: React.PropTypes.object,
  theadProps: React.PropTypes.object,
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
