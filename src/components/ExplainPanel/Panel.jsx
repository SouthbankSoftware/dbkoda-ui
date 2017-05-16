/**
 * show explain graphically
 *
 */
import React from 'react';
import {Button} from '@blueprintjs/core';
import './style.scss';

import RawJson from './RawJson';
import ExplainView from './ExplainView';

export const Header = ({viewType, switchExplainView}) => {
  return (<div className="explain-header">
    <span className="explain-label">Explain</span>
    <Button className="pt-label explain-view-switch-button" onClick={switchExplainView}>{viewType === 0 ? 'Raw Json' : 'Explain'}</Button>
  </div>);
};

const Panel = ({editor, switchExplainView, viewType}) => {
  if (editor.explains && editor.explains.error) {
    return (<div>{editor.explains.error}</div>);
  }
  return (<div className="explain-panel">
    <Header switchExplainView={switchExplainView} viewType={viewType} />
    {
      viewType === 0 ? <ExplainView explains={editor.explains} /> : <RawJson explains={editor.explains} />
    }
  </div>);
};

export default Panel;
