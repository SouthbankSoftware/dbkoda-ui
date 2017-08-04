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
 * @Last modified time: 2017-07-19T12:34:59+10:00
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
import ReactJson from 'react-json-view';
import './style.scss';

/**
 * Displays JSON in an enhanced form
 *
 */
@inject('store')
@observer
export default class Panel extends React.Component {
  parseEJSON(eJson) {
    let json = eJson.replace(/ObjectId\("([0-9a-z]*)"\)/gm, '"$1"')
      .replace(/NumberLong\("([0-9]*)"\)/gm, '$1')
      .replace(/NumberDecimal\("([0-9.]*)"\)/gm, '$1')
      .replace(/BinData\("([0-9a-zA-Z]*)"\)/gm, '"$1"')
      .replace(/Timestamp\("([0-9], *)"\)/gm, '"$1"')
      .replace(/\n/gm, '')
      .replace(/<(.*)>/gm, (contents) => {
        return contents.replace(/(<[^>])*\/([^>]>)*/gm, '$1\\\/$2')
          .replace(/="([^"]*)"/gm, '=\\\"$1\\\"');
      });
    json = JSON.parse(json);
    return json;
  }

  render() {
    return (<div className="enhanced-json-panel">
      <ReactJson src={this.parseEJSON(this.props.currentJson)}
        theme="monokai"
        indentWidth={2}
        collapseStringsAfterLength={20}
        enableClipboard
        displayObjectSize
        displayDataTypes={false}
         />
    </div>);
  }
}
