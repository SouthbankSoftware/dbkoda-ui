/**
 * @Author: guiguan
 * @Date:   2017-03-07T13:47:00+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-03-07T18:49:59+11:00
 */

import React from 'react';
import SplitPane from 'react-split-pane';
import Drawer from 'react-motion-drawer';
import {Button} from '@blueprintjs/core';

import 'normalize.css/normalize.css';
import '@blueprintjs/core/dist/blueprint.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ambiance.css';

import EditorPanel from './editor/EditorPanel.jsx';

import '../styles/global.scss';
import './App.scss';

export default class App extends React.Component {
  state = {
    drawerOpen: open
  };

  render() {
    const {drawerOpen} = this.state;

    return (
      <div>
        <Drawer
          className="drawer"
          open={drawerOpen}
          width="36%"
          handleWidth={0}
          onChange={open => this.setState({drawerOpen: open})}>
          <div className="drawerPanel">
            <h3>Please close me!!!</h3>
          </div>
        </Drawer>
        <SplitPane split="vertical" defaultSize="30%">
          <SplitPane split="horizontal" defaultSize="50%">
            <div>
              <Button
                className="pt-intent-primary"
                iconName="pt-icon-menu-closed"
                onClick={() => {
                this.setState({drawerOpen: true});
              }} />
            </div>
            <div />
          </SplitPane>
          <SplitPane split="horizontal" defaultSize="70%">
            <EditorPanel />
            <div />
          </SplitPane>
        </SplitPane>
      </div>
    );
  }
}
