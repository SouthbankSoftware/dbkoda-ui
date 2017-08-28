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
 * @Last modified time: 2017-08-28T09:13:36+10:00
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
    const currentJson = this.props.getDocumentAtLine(this.props.outputId, lineNumber, 1, lines);
    if (lines.status === 'Invalid') {
      this.setState({ moreNext: false });
      return;
    }
    this.setState({ morePrevious: true, moreNext: true });
    this.props.api.initJsonView(currentJson, this.props.outputId, 'enhancedJson', lines);
  }

  getPreviousDoc() {
    const lineNumber = this.props.enhancedJson.firstLine - 1;
    const lines = { start: 0, end: 0, status: '' };
    const currentJson = this.props.getDocumentAtLine(this.props.outputId, lineNumber, -1, lines);
    if (lines.status === 'Invalid') {
      this.setState({ morePrevious: false });
      return;
    }
    this.setState({ morePrevious: true, moreNext: true });
    this.props.api.initJsonView(currentJson, this.props.outputId, 'enhancedJson', lines);
  }

  render() {
    return (<div className="enhanced-json-panel">
      <nav className="pt-navbar pt-dark">
        <div className="pt-navbar-group pt-align-left previous-button">
          <button type="button"
            id="prevBtn"
            className="pt-button pt-icon-large pt-icon-chevron-left"
            onClick={this.getPreviousDoc}
            disabled={!this.state.morePrevious} />
        </div>
        <div className="pt-navbar-group pt-align-right">
          <button type="button"
            className="pt-button pt-icon-large pt-icon-chevron-right next-button"
            onClick={this.getNextDoc}
            disabled={!this.state.moreNext} />
        </div>
        <div className="pt-navbar-group collapse-group">
          <div className="pt-navbar-heading">Expand </div>
          <button type="button"
            className={(this.state.collapseDepth === 1) ? 'pt-button active' : 'pt-button'}
            onClick={() => (this.setState({ collapseDepth: 1 }))}>
            1
          </button>
          <button type="button"
            className={(this.state.collapseDepth === 2) ? 'pt-button active' : 'pt-button'}
            onClick={() => (this.setState({ collapseDepth: 2 }))}>
            2
          </button>
          <button type="button"
            className={(this.state.collapseDepth === 3) ? 'pt-button active' : 'pt-button'}
            onClick={() => (this.setState({ collapseDepth: 3 }))}>
            3
          </button>
          <button type="button"
            className={(this.state.collapseDepth === false) ? 'pt-button active' : 'pt-button'}
            onClick={() => (this.setState({ collapseDepth: false }))}>
            All
          </button>
        </div>
      </nav>
      <ReactJson
        src={this.props.enhancedJson.json}
        theme={{
          base00: '#fff',
          base01: '#fff',
          base02: 'rgb(64, 110, 101)',
          base03: '#fff',
          base04: 'rgb(93, 92, 93)',
          base05: '#fff',
          base06: '#fff',
          base07: '#FFB795',
          base08: 'rgb(1, 139, 147)',
          base09: 'rgb(58, 178, 98)',
          base0A: 'rgb(191, 204, 214)',
          base0B: 'rgb(1, 139, 147)',
          base0C: '#575a6a',
          base0D: '#535253',
          base0E: '#535253',
          base0F: 'rgb(1, 139, 147)'
        }}
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
/*  Theme guide:
  base00: Default Background (Overwritten by styles)
  base01: Lighter Background
  base02: NULL background, Expand line (Selection background)
  base03: ? (Comments, Invisibles, Line Highlighting)
  base04: Item count text (Dark Foreground)
  base05: ? (Default Foreground)
  base06: ? (Light Foreground)
  base07: Key text (Light Background)
  base08: ? (Variables, XML Tags, Markup Link Text, Markup Lists, Diff Deleted)
  base09: String values (Integers, Boolean, Constants, XML Attributes, Markup Link Url)
  base0A: NULL text (Classes, Markup Bold, Search Text Background)
  base0B: Floating point text (Strings, Inherited Class, Markup Code, Diff Inserted)
  base0C: Array Index text (Support, Regular Expressions, Escape Characters, Markup Quotes)
  base0D: Expanded arrows (Functions, Methods, Attribute IDs, Headings)
  base0E: Boolean text, Closed Arrows (Keywords, Storage, Selector, Markup Italic, Diff Changed)
  base0F: Copy icon, also Integer text (Deprecated, Opening/Closing Embedded Language Tags)
 */
