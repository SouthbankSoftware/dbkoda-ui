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
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-07T10:53:19+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-08-09T10:01:34+10:00
 */

import React from 'react';
import ReactJson from 'react-json-view';
import './style.scss';

/**
 * Displays JSON in an enhanced form as a seperate output tab
 *  enhancedJson -
 */
export default class Panel extends React.Component {
  render() {
    return (<div className="enhanced-json-panel">
      <ReactJson src={this.props.enhancedJson}
        theme="hopscotch"
        indentWidth={2}
        collapsed={2}
        collapseStringsAfterLength={40}
        enableClipboard
        displayObjectSize
        displayDataTypes={false}
         />
    </div>);
  }
}
