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

/**
 * @Author: chris
 * @Date:   2017-05-19T16:25:22+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-22T14:01:30+10:00
 */

/**
 * show explain graphically
 *
 */
import React from 'react';
import { Button } from '@blueprintjs/core';
import './style.scss';
import RawJson from './RawJson';
import ExplainView from './ExplainView';
import QueryCommandView from './QueryCommandView';

export const Header = ({ viewType, switchExplainView, suggestIndex }) => {
  return (
    <div className="explain-header">
      <span className="explain-label">{globalString('explain/heading')}</span>
      <Button className="pt-label explain-view-switch-button" onClick={switchExplainView}>
        {viewType === 0
          ? globalString('explain/panel/rawView')
          : globalString('explain/panel/explainView')}
      </Button>
      <Button className="pt-label explain-view-suggest-index-button" onClick={suggestIndex}>
        {globalString('explain/panel/suggestIndex')}
      </Button>
    </div>
  );
};

export default class Panel extends React.Component {
  render() {
    if (this.props.editor.explains && this.props.editor.explains.error) {
      return (
        <div className="explain-error-panel">
          <div className="header">
            Failed to parse explain output, <b>make sure to highlight entire statement.</b>
          </div>
          <QueryCommandView command={this.props.editor.explains.command} />
          <div className="output">{this.props.editor.explains.output}</div>
        </div>
      );
    }
    return (
      <div
        className="explain-panel"
        ref={el => {
          this.el = el;
        }}
      >
        {this.props.hasSuggestions && (
          <div className="suggest-index-panel">
            <div className="suggest-index-panel-header">
              <h2>{globalString('explain/panel/suggestIndex')}</h2>
              <Button
                className="pt-label explain-view-copy-suggested-index-button"
                onClick={this.props.copySuggestion}
              >
                {globalString('explain/panel/copySuggestedIndex')}
              </Button>
            </div>
            <QueryCommandView command={this.props.suggestionText} />
          </div>
        )}
        <Header
          switchExplainView={this.props.switchExplainView}
          viewType={this.props.viewType}
          suggestIndex={this.props.suggestIndex}
        />{' '}
        {this.props.viewType === 0 ? (
          <ExplainView explains={this.props.editor.explains} />
        ) : (
          <RawJson explains={this.props.editor.explains} />
        )}
      </div>
    );
  }
}
