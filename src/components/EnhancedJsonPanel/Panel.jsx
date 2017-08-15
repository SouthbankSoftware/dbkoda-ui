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
 * @Last modified time: 2017-08-15T09:19:30+10:00
 */

import React from 'react';
import { inject } from 'mobx-react';
import ReactJson from 'react-json-view';
import './style.scss';

/**
 * Displays JSON in an enhanced form as a seperate output tab
 *  enhancedJson - a JSON object to be represented in the output tab
 */
 @inject(allStores => ({
   api: allStores.api,
 }))
export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { morePrevious: true, moreNext: true, collapseDepth: 1 };
    this.getNextDoc = this.getNextDoc.bind(this);
    this.getPreviousDoc = this.getPreviousDoc.bind(this);
  }

  getNextDoc() {
    const lineNumber = this.props.enhancedJson.lastLine + 1;
    const lines = { start: 0, end: 0, status: '' };
    let currentJson = this.props.getDocumentAtLine(this.props.outputId, lineNumber, lines);
    if (lines.status === 'Invalid') {
      lines.status = '';
      currentJson = this.props.getDocumentAtLine(this.props.outputId, lineNumber + 3, lines);
      if (lines.status === 'Invalid') {
        this.setState({ moreNext: false });
        return;
      }
    }
    this.props.api.initJsonView(currentJson, this.props.outputId, 'enhancedJson', lines);
  }

  getPreviousDoc() {
    const lineNumber = this.props.enhancedJson.firstLine - 1;
    const lines = { start: 0, end: 0, status: '' };
    let currentJson = this.props.getDocumentAtLine(this.props.outputId, lineNumber, lines);
    if (lines.status === 'Invalid') {
      lines.status = '';
      currentJson = this.props.getDocumentAtLine(this.props.outputId, lineNumber - 3, lines);
      if (lines.status === 'Invalid') {
        this.setState({ morePrevious: false });
        return;
      }
    }
    this.props.api.initJsonView(currentJson, this.props.outputId, 'enhancedJson', lines);
  }

  render() {
    return (<div className="enhanced-json-panel">
      <button type="button"
        id="enhancedJsonPrevBtn"
        className="pt-button pt-icon-arrow-left"
        onClick={this.getPreviousDoc}
        disabled={!this.state.morePrevious}>
        Previous
      </button>
      <button type="button"
        id="enhancedJsonNextBtn"
        className="pt-button pt-icon-arrow-right"
        onClick={this.getNextDoc}
        disabled={!this.state.moreNext}>
        Next
      </button>
      <ReactJson src={this.props.enhancedJson.json}
        theme="hopscotch"
        indentWidth={2}
        collapsed={this.state.collapseDepth}
        collapseStringsAfterLength={40}
        enableClipboard
        displayObjectSize
        displayDataTypes={false}
         />
    </div>);
  }
}
