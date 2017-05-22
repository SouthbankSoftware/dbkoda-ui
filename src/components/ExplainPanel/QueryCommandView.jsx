/**
 *
 * Created by joey on 22/5/17.
 */
import React from 'react';

import CodeMirror from 'react-codemirror';
import CM from 'codemirror';
import Prettier from 'prettier';
import './style.scss';

const options = {
  smartIndent: true,
  theme: 'material',
  readOnly: true,
  lineWrapping: false,
  tabSize: 2,
  matchBrackets: true,
  keyMap: 'sublime',
  mode: 'MongoScript'
};

const QueryCommandView = ({command, namespace}) => {
  let editor;
  try {
    const formatted = Prettier.format(command, {});
    setTimeout(() => {
      const cm = editor && editor.getCodeMirror();
      cm && cm.setValue(formatted);
    }, 500);
  } catch (_) {
    // do nothing
  }
  const namespacePanel = namespace ? (<div className="namespace">
    <div className="label">{globalString('explain/view/namespaceLabel')}</div>
    <div className="value">{namespace}</div>
  </div>) : null;
  return (<div className="explain-command-panel">
    {namespacePanel}
    <div className="codemirror">
      <div className="label">{globalString('explain/view/queryLabel')}</div>
      <CodeMirror
        ref={(cm) => {
          editor = cm;
        }}
        codeMirrorInstance={CM}
        value={command}
        options={options} />
    </div>
  </div>);
};

export default QueryCommandView;
