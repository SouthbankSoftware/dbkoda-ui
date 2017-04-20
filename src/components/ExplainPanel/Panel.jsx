/**
 * show explain graphically
 *
 */
import React from 'react';
import {Button, Tab2, Tabs2} from '@blueprintjs/core';
import './style.scss';

import RawJson from './RawJson';
import ExplainView from './ExplainView';

const Panel = ({editor}) => {
  if (editor.explains && editor.explains.error) {
    return (<div>{editor.explains.error}</div>);
  }
  return (<div className="explain-panel">
    <Tabs2 className="explain-tabs" vertical>
      <Tab2 className="explain-tab" id={editor.shellId}

        title={<Button className="field-label pt-label explain-tab-title-button">Explain</Button>}
        panel={<ExplainView explains={editor.explains} />} />
      <Tab2 className="explain-tab" id={editor.shellId + '-raw-json'}
        title={<Button className="field-label pt-label explain-tab-title-button">Raw Json</Button>}
        panel={<RawJson explains={editor.explains} />} />
    </Tabs2>
  </div>);
};

export default Panel;
