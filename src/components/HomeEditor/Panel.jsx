/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-29T21:57:08+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-29T23:55:07+10:00
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

import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { action, runInAction } from 'mobx';
import EnhancedSplitPane, { resizerStates } from '#/common/EnhancedSplitPane';
import { SidebarPanel } from '#/SidebarPanel';
import { EditorPanel } from '#/EditorPanel';
import { OutputPanel } from '#/OutputPanel';

@inject(allStores => ({
  store: allStores.store,
  layout: allStores.store.layout
}))
@observer
class MailPanel extends React.Component<*, *> {
  splitPane2Style = {
    display: 'flex',
    flexDirection: 'column'
  };

  @action.bound
  updateRightSplitPos(pos) {
    this.props.layout.rightSplitPos = pos;
  }

  @action.bound
  updateRightSplitResizerState(state, prevState) {
    if (prevState === resizerStates.S_HIDDEN) {
      // output panel just toggled on

      const {
        store: {
          outputPanel,
          editorPanel: { activeEditorId }
        }
      } = this.props;
      const { currentTab } = outputPanel;

      if (currentTab !== 'Default' && currentTab === activeEditorId) {
        // it's a raw output

        // we need to refresh the raw output so that the latest value of the codemirror instance
        // is rendered
        outputPanel.currentTab = 'Default';
        setTimeout(() =>
          runInAction(() => {
            outputPanel.currentTab = activeEditorId;
          })
        );
      }
    }

    this.props.layout.rightSplitResizerState = state;
  }

  render() {
    const { rightSplitPos, rightSplitResizerState } = this.props.layout;

    return (
      <EnhancedSplitPane
        className="RightSplitPane"
        split="horizontal"
        size={rightSplitPos}
        onDragFinished={this.updateRightSplitPos}
        resizerState={rightSplitResizerState}
        onResizerStateChanged={this.updateRightSplitResizerState}
        minSize={200}
        maxSize={1000}
        pane2Style={this.splitPane2Style}
      >
        <EditorPanel />
        <OutputPanel />
      </EnhancedSplitPane>
    );
  }
}

@inject(allStores => ({
  store: allStores.store,
  layout: allStores.store.layout
}))
@observer
export default class HomeEditor extends React.Component<*, *> {
  @action.bound
  updateOverallSplitPos(pos: *) {
    this.props.layout.overallSplitPos = pos;
  }

  @action.bound
  updateOverallSplitResizerState(state: *) {
    this.props.layout.overallSplitResizerState = state;
  }

  render() {
    const { overallSplitPos, overallSplitResizerState } = this.props.layout;

    return (
      <EnhancedSplitPane
        className="EditorSplitPane"
        split="vertical"
        size={overallSplitPos}
        onDragFinished={this.updateOverallSplitPos}
        resizerState={overallSplitResizerState}
        onResizerStateChanged={this.updateOverallSplitResizerState}
        minSize={350}
        maxSize={750}
        allowedResizerState={[resizerStates.P_HIDDEN]}
      >
        <SidebarPanel />
        <MailPanel />
      </EnhancedSplitPane>
    );
  }
}
