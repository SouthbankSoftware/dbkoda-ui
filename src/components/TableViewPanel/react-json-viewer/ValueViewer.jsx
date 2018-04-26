/**
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

import React, { Component } from 'react';
import { getType } from './util';

class ValueViewer extends Component {
  r() {
    switch (getType(this.props.value)) {
      case 'String':
        if (this.props.value.length <= 80) {
          return (
            <span className="string noWrap" style={{ color: 'rgb(255, 65, 60)' }}>
              {`"${this.props.value}"`}
            </span>
          );
        }
        return (
          <span className="string" style={{ color: 'rgb(255, 65, 60)' }}>
            {`"${this.props.value}"`}
          </span>
        );
      case 'Boolean':
        return (
          <span className="boolean" style={{ color: 'rgb(31, 48, 255)' }}>
            {`${this.props.value}`}
          </span>
        );
      case 'Number':
        return (
          <span className="number" style={{ color: 'rgb(31, 49, 255)' }}>
            {`${this.props.value}`}
          </span>
        );
      case 'Undefined':
        return (
          <i className="undefined" style={{ color: '#777777' }}>
            {'undefined'}
          </i>
        );
      case 'Null':
        return (
          <i className="null" style={{ color: '#777777' }}>
            {'null'}
          </i>
        );
      case 'Date':
        return (
          <i className="date" style={{ color: '#007bc7;' }}>
            {`${JSON.stringify(this.props.value)}`}
          </i>
        );
      default:
        return <span style={{ color: 'rgb(31, 49, 255)' }}>{`${this.props.value}`}</span>;
    }
  }

  render() {
    return <span>{this.r()}</span>;
  }
}
ValueViewer.propTypes = {};
ValueViewer.defaultProps = {};
export default ValueViewer;
