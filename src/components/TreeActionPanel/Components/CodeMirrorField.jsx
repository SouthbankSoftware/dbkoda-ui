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
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-19T15:43:32+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-30T16:00:49+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

import { Intent, Position, Tooltip } from '@blueprintjs/core';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/dialog/dialog.css';
import 'codemirror/addon/search/matchesonscrollbar.css';
import CodeMirror from '#/common/LegacyCodeMirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/display/autorefresh.js';
import 'codemirror/addon/edit/matchbrackets.js';
// Patched for codemirror@5.28.0. Need to check this file when upgrade codemirror
import '#/common/closebrackets.js';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/comment-fold.js';
import 'codemirror/addon/fold/xml-fold.js';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/javascript-hint.js';
import 'codemirror/keymap/sublime.js';
import 'codemirror-formatting';
import '#/common/MongoScript.js';
import 'codemirror/theme/material.css';

export default observer(({ field, showLabel = true, formGroup = false }) => {
  const code = field.default;
  const cmOptions = {
    value: code,
    theme: 'material',
    lineNumbers: 'true',
    indentUnit: 2,
    styleActiveLine: 'true',
    scrollbarStyle: null,
    smartIndent: true,
    styleSelectedText: false,
    tabSize: 2,
    matchBrackets: true,
    autoCloseBrackets: true,
    foldOptions: {
      widget: '...'
    },
    foldGutter: true,
    gutters: [
      'CodeMirror-linenumbers',
      'CodeMirror-foldgutter' // , 'CodeMirror-lint-markers'
    ],
    keyMap: 'sublime',
    mode: 'MongoScript'
  };

  const fldClassName = formGroup
    ? 'pt-form-group form-group-inline'
    : 'pt-form-group pt-top-level';
  let inputClassName = 'pt-input codemirrorInput';
  let tooltipClassName = 'pt-tooltip-indicator pt-tooltip-indicator-form';
  if (formGroup) {
    if (field.options && field.options.tooltip) {
      tooltipClassName += ' table-field-90';
      inputClassName += ' table-field-100';
    } else {
      inputClassName += ' table-field-90';
    }
  }
  const updateField = newVal => {
    field.value = newVal;
    field.state.form.submit();
  };
  return (
    <div className={fldClassName}>
      {showLabel && (
        <label className="pt-label pt-label-r-30" htmlFor={field.id}>
          {field.label}
        </label>
      )}
      <div className="pt-form-content codeMirror">
        {field.options &&
          field.options.tooltip && (
            <Tooltip
              className={tooltipClassName}
              content={field.options.tooltip}
              hoverOpenDelay={1000}
              inline
              intent={Intent.PRIMARY}
              position={Position.TOP}
            >
              <CodeMirror
                className={inputClassName}
                options={cmOptions}
                onChange={val => {
                  updateField(val);
                }}
              />
            </Tooltip>
          )}
        {(!field.options || !field.options.tooltip) && (
          <div>
            <CodeMirror
              className={inputClassName}
              options={cmOptions}
              onChange={val => {
                updateField(val);
              }}
            />
          </div>
        )}
        <p className="pt-form-helper-text">{field.error}</p>
      </div>
    </div>
  );
});
