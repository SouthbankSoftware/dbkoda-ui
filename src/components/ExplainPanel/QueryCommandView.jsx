/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-06-07T15:03:32+10:00
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
import CodeMirror from 'react-codemirror';
import CM from 'codemirror';
import Prettier from 'prettier-standalone';
import './style.scss';

const options = {
  smartIndent: true,
  theme: 'material',
  readOnly: true,
  lineWrapping: false,
  tabSize: 2,
  matchBrackets: true,
  keyMap: 'sublime',
  mode: 'MongoScript',
};

const QueryCommandView = ({ command, namespace }) => {
  let editor;
  let content = command;
  try {
    content = Prettier.format(command, {});
  } catch (_) {
    // do nothing
    content = command;
  }
  setTimeout(() => {
    const cm = editor && editor.getCodeMirror();
    cm && cm.setValue(content);
  }, 500);
  const namespacePanel = namespace ? (
    <div className="namespace">
      <div className="label">{globalString('explain/view/namespaceLabel')}</div>
      <div className="value">{namespace}</div>
    </div>
  ) : null;

  return (
    <div className="explain-command-panel">
      {namespacePanel}
      <div className="codemirror">
        <div className="label">{globalString('explain/view/queryLabel')}</div>
        <CodeMirror
          ref={(cm) => {
            editor = cm;
          }}
          codeMirrorInstance={CM}
          value={command}
          options={options}
        />
      </div>
    </div>
  );
};

export default QueryCommandView;
