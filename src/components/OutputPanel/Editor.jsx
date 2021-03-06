/*
 * @Author: Chris Trott <chris>
 * @Date:   2017-03-10T12:33:56+11:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-29T20:25:29+10:00
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

import _ from 'lodash';
import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, runInAction, reaction } from 'mobx';
import CodeMirrorEditor from '#/common/CodeMirror';
import CodeMirror from 'codemirror';
import { ContextMenuTarget, Menu, MenuItem, Intent } from '@blueprintjs/core';
import StaticApi from '~/api/static';
import { terminalTypes } from '~/api/Terminal';
import { NewToaster } from '#/common/Toaster';
import 'codemirror/theme/material.css';
import 'codemirror/mode/shell/shell';
import 'codemirror/addon/comment/comment.js';
import OutputTerminal from './Terminal';

/**
 * Renders the window through which all output is shown for a specific editor
 * instance. Handles connection setup and view scrolling.
 */
@inject(allStores => ({
  store: allStores.store,
  api: allStores.api
}))
@observer
@ContextMenuTarget
export default class Editor extends React.Component {
  _reactions = [];

  /**
   * @param {Object} props - The properties passed to the component.
   * Contains:
   *    @param {number} id - The unique id of the allocated editor
   *    @param {number} connId - The id of the allocated connection
   *    @param {number} shellId - The shellId of the allocated connection
   *    @param {Object} store - The mobx global store object (injected)
   */

  constructor(props) {
    super(props);

    this.outputObj = this.props.store.outputs.get(this.props.id);

    if (this.outputObj) {
      this.cmOptions = {
        value: this.outputObj.doc,
        smartIndent: true,
        theme: 'material',
        readOnly: true,
        lineWrapping: false,
        tabSize: 2,
        matchBrackets: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        scrollbarStyle: null,
        foldOptions: {
          widget: '...'
        },
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        keyMap: 'sublime',
        extraKeys: {
          'Ctrl-Space': 'autocomplete',
          'Ctrl-Q': function(cm) {
            cm.foldCode(cm.getCursor());
          }
        },
        undoDepth: 0,
        mode: 'shell'
      };
    }

    this.renderContextMenu = this.renderContextMenu.bind(this);
    this.getClickedDocument = this.getClickedDocument.bind(this);

    this._reactions.push(
      reaction(
        () => this.props.store.outputPanel.currentTab,
        currentTab => {
          if (currentTab === this.props.id) {
            requestAnimationFrame(() => {
              this.refresh();
            });
          }
        }
      )
    );
  }

  componentDidMount() {
    this.props.setEditorRef(this.props.id, this.editor);
    requestAnimationFrame(() => {
      this.refresh();
    });
  }

  componentWillUnmount() {
    if (this.editor) {
      const cm = this.editor.getCodeMirror();
      const scrollInfo = cm.getScrollInfo();
      runInAction(() => {
        this.outputObj.lastScrollPos = { left: scrollInfo.left, top: scrollInfo.top };
      });
    }

    _.forEach(this._reactions, r => r());
  }

  @action
  refresh = () => {
    if (this.editor) {
      const cm = this.editor.getCodeMirror();
      cm.refresh();
      if (this.outputObj.shouldScrollToBottom) {
        this.outputObj.scrollToButtom(cm);
        this.outputObj.shouldScrollToBottom = false;
      } else if (this.outputObj.lastScrollPos) {
        const { lastScrollPos } = this.outputObj;
        cm.scrollTo(lastScrollPos.left, lastScrollPos.top);
      }
    }
  };

  /**
   * Action for handling a drop event from a drag-and-drop action.
   * @param {Object} item - The item being dropped.
   */
  @action
  handleDrop(item) {
    //eslint-disable-line
    this.props.store.dragItem.item = item;
    if (!this.props.store.dragItem.dragDropTerminal) {
      this.props.store.dragItem.dragDropTerminal = true;
    } else {
      this.props.store.dragItem.dragDropTerminal = false;
      const setDragDropTrueLater = () => {
        // This hack is done to fix the state in case of exception where the value is preserved as true while it is not draging
        runInAction('set drag drop to true', () => {
          this.props.store.dragItem.dragDropTerminal = true;
        });
      };
      setTimeout(setDragDropTrueLater, 500);
    }
  }

  getClickedDocument(coords, lines) {
    const cm = this.editor.getCodeMirror();
    const lineNumber = cm.lineAtHeight(coords.y);
    return this.props.getDocumentAtLine(this.props.id, lineNumber, 0, lines);
  }

  renderContextMenu(event) {
    const coords = { x: event.clientX, y: event.clientY };
    const lines = { start: 0, end: 0, status: '' };
    const currentJson = this.getClickedDocument(coords, lines);

    const menuItems = [];
    menuItems.push(
      <div className="menuItemWrapper showJsonView" id="showJsonViewMenuItem">
        <MenuItem
          onClick={() => {
            this.props.api.initJsonView(currentJson, this.props.id, 'enhancedJson', lines);
          }}
          text={globalString('output/editor/contextJson')}
          icon="panel-stats"
          intent={Intent.NONE}
        />
      </div>
    );
    menuItems.push(
      <div className="menuItemWrapper showTableView" id="showTableViewMenuItem">
        <MenuItem icon="th" text={globalString('output/editor/contextTable')} intent={Intent.NONE}>
          <MenuItem
            onClick={() => {
              this.props.api.initJsonView(
                currentJson,
                this.props.id,
                'tableJson',
                lines,
                this.editor,
                true
              );
            }}
            text={globalString('output/editor/contextTableSingle')}
            icon="th"
            intent={Intent.NONE}
          />
          <MenuItem
            onClick={() => {
              this.props.api.initJsonView(
                currentJson,
                this.props.id,
                'tableJson',
                lines,
                this.editor,
                false
              );
            }}
            text={globalString('output/editor/contextTableMulti')}
            icon="th"
            intent={Intent.NONE}
          />
        </MenuItem>
      </div>
    );
    menuItems.push(
      <div key={menuItems.length} className="menuItemWrapper">
        <MenuItem
          className="profileListContextMenu newLocalTerminal"
          onClick={() => {
            const { addTerminal } = this.props.api;
            addTerminal(terminalTypes.local);
          }}
          text={globalString('profile/menu/newLocalTerminal')}
          intent={Intent.NONE}
          icon="new-text-box"
        />
      </div>
    );
    menuItems.push(
      <div className="menuItemWrapper showChartView" id="showChartViewMenuItem">
        <MenuItem
          onClick={() => {
            const editorId = this.props.id;

            StaticApi.parseTableJson(currentJson, lines, this.editor.getCodeMirror(), editorId)
              .then(result => {
                runInAction(() => {
                  this.props.api.outputApi.showChartPanel(editorId, result, 'loaded');
                });
              })
              .catch(err => {
                l.error(err);

                const message = globalString('output/editor/parseJsonError') + err;
                runInAction(() => {
                  NewToaster.show({
                    message,
                    className: 'danger',
                    icon: ''
                  });
                });

                runInAction(() => {
                  this.props.api.outputApi.showChartPanel(editorId, {}, 'error', message);
                });
              });
          }}
          text={globalString('output/editor/contextChart')}
          icon="th"
          intent={Intent.NONE}
        />
      </div>
    );

    return <Menu className="outputContextMenu">{menuItems}</Menu>;
  }

  render() {
    if (!this.outputObj) {
      return <div className="outputEditor" />;
    }

    return (
      <div className="outputEditor">
        <CodeMirrorEditor
          ref={ref => (this.editor = ref)}
          codeMirrorInstance={CodeMirror}
          options={this.cmOptions}
        />
        <OutputTerminal
          id={this.props.id}
          profileId={this.props.profileId}
          shellId={this.props.shellId}
          title={this.props.title}
          onDrop={item => this.handleDrop(item)}
          getDocumentAtLine={this.props.getDocumentAtLine}
        />
      </div>
    );
  }
}
