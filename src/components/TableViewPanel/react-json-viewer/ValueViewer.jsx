import React, { Component } from 'react';
import { getType } from './util';

class ValueViewer extends Component {
  r() {
    switch (getType(this.props.value)) {
      case 'String':
        return (
          <span style={{ color: 'rgb(255, 65, 60)' }}>{`"${this.props
            .value}"`}</span>
        );
      case 'Boolean':
        return (
          <span style={{ color: 'rgb(31, 48, 255)' }}>{`${this.props
            .value}`}</span>
        );
      case 'Number':
        return (
          <span style={{ color: 'rgb(31, 49, 255)' }}>{`${this.props
            .value}`}</span>
        );
      case 'Undefined':
        return <i style={{ color: '#777777' }}>{'undefined'}</i>;
      case 'Null':
        return <i style={{ color: '#777777' }}>{'null'}</i>;
      case 'Date':
        return (
          <i style={{ color: '#007bc7;' }}>{`${JSON.stringify(
            this.props.value,
          )}`}</i>
        );
      default:
        return (
          <span style={{ color: 'rgb(31, 49, 255)' }}>{`${this.props
            .value}`}</span>
        );
    }
  }

  render() {
    return <span>{this.r()}</span>;
  }
}
ValueViewer.propTypes = {};
ValueViewer.defaultProps = {};
export default ValueViewer;
