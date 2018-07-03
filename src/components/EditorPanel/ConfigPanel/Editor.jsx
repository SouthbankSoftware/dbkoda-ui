/*
 * @flow
 *
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

import React from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';

type EditorConfig = {
  editor: {
    fontFamily: string,
    fontSize: string,
    fontWeight: number,
    lineHeight: number
  }
};

type Props = {
  settings: EditorConfig,
  updateValue: Function,
  renderFieldLabel: Function
};

@observer
export default class Editor extends React.Component<Props> {
  onStringInputChange = (event: SyntheticEvent<HTMLInputElement>) => {
    if (!(event.target instanceof window.HTMLInputElement)) {
      return;
    }
    const fieldName = event.target.id;
    const fieldValue = event.target.value;
    l.debug(`updateValue(${fieldName}, ${fieldValue})`);
    this.props.updateValue(fieldName, fieldValue || null);
  };

  onNumericalInputChange = (event: SyntheticEvent<HTMLInputElement>) => {
    if (!(event.target instanceof window.HTMLInputElement)) {
      return;
    }
    const fieldName = event.target.id;
    const rawValue = event.target.value;
    let fieldValue;

    if (rawValue === '') {
      fieldValue = rawValue;
    } else {
      fieldValue = Number(rawValue);

      if (_.isNaN(fieldValue)) {
        fieldValue = rawValue;
      }
    }

    this.props.updateValue(fieldName, fieldValue);
  };

  render() {
    return (
      <div className="formContentWrapper EditorPreferences">
        <div className="sectionHeader"> {globalString('editor/config/sections/editor')}</div>
        <div className="form-row">
          {this.props.renderFieldLabel('editor.fontFamily')}
          <input
            type="text"
            id="editor.fontFamily"
            value={this.props.settings.editor.fontFamily}
            onChange={this.onStringInputChange}
          />
        </div>
        <div className="form-row">
          {this.props.renderFieldLabel('editor.fontSize')}
          <input
            type="text"
            id="editor.fontSize"
            value={this.props.settings.editor.fontSize}
            onChange={this.onStringInputChange}
          />
        </div>
        <div className="form-row">
          {this.props.renderFieldLabel('editor.fontWeight')}
          <input
            type="text"
            id="editor.fontWeight"
            value={this.props.settings.editor.fontWeight}
            onChange={this.onNumericalInputChange}
          />
        </div>
        <div className="form-row">
          {this.props.renderFieldLabel('editor.lineHeight')}
          <input
            type="text"
            id="editor.lineHeight"
            value={this.props.settings.editor.lineHeight}
            onChange={this.onNumericalInputChange}
          />
        </div>
      </div>
    );
  }
}
