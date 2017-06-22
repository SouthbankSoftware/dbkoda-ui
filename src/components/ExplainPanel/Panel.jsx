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
import {Button} from '@blueprintjs/core';
import './style.scss';
import RawJson from './RawJson';
import ExplainView from './ExplainView';
import QueryCommandView from './QueryCommandView';

export const Header = ({viewType, switchExplainView}) => {
  return (
    <div className="explain-header">
      <span className="explain-label">
        {globalString('explain/heading')}
      </span>
      <Button
        className="pt-label explain-view-switch-button"
        onClick={switchExplainView}>
        {viewType === 0
          ? globalString('explain/panel/rawView')
          : globalString('explain/panel/explainView')
}
      </Button>
    </div>
  );
};

const Panel = ({editor, switchExplainView, viewType}) => {
  if (editor.explains && editor.explains.error) {
    return (
      <div className="explain-error-panel">
        <div className="header">Failed to parse explain output, <b>make sure to highlight entire statement.</b></div>
        <QueryCommandView command={editor.explains.command} />
        <div className="output">{editor.explains.output}</div>
      </div>
    );
  }
  return (
    <div className="explain-panel">
      <Header switchExplainView={switchExplainView} viewType={viewType} /> {viewType === 0
        ? <ExplainView explains={editor.explains} />
        : <RawJson explains={editor.explains} />
}
    </div>
  );
};

export default Panel;
