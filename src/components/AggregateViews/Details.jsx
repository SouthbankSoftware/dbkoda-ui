/**
 * @Author: Michael Harrison
 * @Date:   2017-07-19 11:17:46
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-25T13:35:54+10:00
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

/* eslint import/no-dynamic-require: warn */

import _ from 'lodash';
import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable, reaction, runInAction } from 'mobx';
import { Button, AnchorButton, Intent, Tooltip, Position } from '@blueprintjs/core';
import { Broker, EventType } from '~/helpers/broker';
import FormBuilder from '#/TreeActionPanel/FormBuilder';
import View from '#/TreeActionPanel/View';
import LoadingView from '#/common/LoadingView';
import { BlockTypes } from './AggregateBlocks/BlockTypes.js';
import BYOBlock from './AggregateBlocks/BYOBlock.jsx';
import CodeIcon from '../../styles/icons/code-icon.svg';
import HideIcon from '../../styles/icons/close-profile-icon.svg';
import './style.scss';

@inject(allStores => ({
  api: allStores.store.api,
  store: allStores.store
}))
@observer
export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: null,
      previousActiveBlock: null,
      reproduceCode: false,
      debug: false
    };
    this.reactionToUpdateDetails = reaction(
      () => this.props.store.editorPanel.updateAggregateDetails,
      () => this.updateDetails()
    );

    // Get variables for action:
    this.editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);

    /**
     * Resolve the prefetch arguments and return them as params
     * @param  {Array}  args     Arguments array as provided from DDD file
     * @return {Object}          Object containing params for prefetch function
     *
     */
    this.resolveArguments = args => {
      const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
      const params = {};
      let myCount = 1;
      if (args.length > 0) {
        for (let i = 0; i < args.length; i += 1) {
          const arg = args[i];
          if (arg.reference) {
            // Field references another field in the form.
            params[arg.name] = editor.blockList[editor.selectedBlock].fields[arg.reference];
            // Create a list of references so the editor knows when to re-fetch results.
            if (editor.blockList[editor.selectedBlock].references) {
              editor.blockList[editor.selectedBlock].references[arg.reference] = true;
            } else {
              editor.blockList[editor.selectedBlock].references = {};
              editor.blockList[editor.selectedBlock].references[arg.reference] = true;
            }
          } else {
            switch (arg.value) {
              case 'collection':
                params[arg.name] = this.currentCollection;
                break;
              case 'database':
                params[arg.name] = this.currentDB;
                break;
              case 'prevAttributes':
                // Check if attributeList has been gathered, if so, return, if not, wait
                while (!editor.blockList[editor.selectedBlock].attributeList && myCount < 10000) {
                  myCount += 1;
                }
                params[arg.name] = editor.blockList[editor.selectedBlock].attributeList;
                break;
              default:
                l.error(
                  'Invalid arguments to Aggregate Block (This should not really happen :( - ',
                  args
                );
            }
          }
        }
      }
      return params;
    };
    this.formBuilder = new FormBuilder();
  }

  componentWillUnmount() {
    this.reactionToUpdateDetails();
  }
  updateDetails() {
    if (this.state.debug) l.debug('Update Details for: ', this.editor.id);
    if (this.props.store.editorPanel.updateAggregateDetails) {
      this.props.store.editorPanel.updateAggregateDetails = false;
      this.state.reproduceCode = true;
      this.editor.isAggregateDetailsLoading = false;
      this.forceUpdate();
      // Current hack to handle the async nature of the mobx form builder.
      _.delay(() => {
        this.forceUpdate();
      }, 100);
    }
  }

  // Triggered when a mobx field is changed, this will update the store to reflect the new values.
  @action.bound
  updateBlockFields(fields, editorObject) {
    const selectedBlock = editorObject.selectedBlock;
    editorObject.blockList[selectedBlock].modified = true;
    for (const key in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        const oldKey = editorObject.blockList[selectedBlock].fields[key];
        editorObject.blockList[selectedBlock].fields[key] = fields[key];

        if (!(oldKey === fields[key])) {
          if (editorObject.blockList[selectedBlock].references) {
            if (editorObject.blockList[selectedBlock].references[key]) {
              this.state.form = null;
              this.props.store.editorPanel.updateAggregateDetails = true;
            }
          }
        }
      }
    }

    // Update Editor Contents.
    this.props.store.treeActionPanel.formValues = this.props.store.api.generateCode(editorObject);
    this.props.store.treeActionPanel.isNewFormValues = true;
    // this.editor.isAggregateDetailsLoading = false;
  }

  formPromise;
  dynamicForm;
  @observable msg = '';
  @observable bForm = false;
  @action
  showForm(value) {
    this.bForm = value;
  }
  @action
  updateMsg(value) {
    this.msg = value;
  }

  @action.bound
  byoCode() {
    // Get current block.
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    editor.blockList[editor.selectedBlock].byoCode = true;
    // eslint-disable-next-line
    const formTemplate = require('./AggregateBlocks/BlockTemplates/' +
      editor.blockList[editor.selectedBlock].type +
      '.hbs');
    editor.blockList[editor.selectedBlock].code = formTemplate(
      editor.blockList[editor.selectedBlock].fields
    );
    this.forceUpdate();
  }

  @action.bound
  nonBYOCode() {
    // Get current block.
    const editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    editor.blockList[editor.selectedBlock].byoCode = false;
    this.forceUpdate();
  }

  @action.bound
  _onApplyBlock() {
    this.props.store.outputPanel.currentTab = this.props.store.editorPanel.activeEditorId;
    Broker.emit(EventType.AGGREGATE_UPDATE(this.props.store.editorPanel.activeEditorId));
  }

  render() {
    const activeEditor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    this.editor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    let activeBlock;
    let blockIndex;
    if (this.editor && this.editor.collection) {
      this.currentDB = this.editor.collection.refParent.text;
      this.currentCollection = this.editor.collection.text;
      blockIndex = activeEditor.selectedBlock;
      activeBlock = activeEditor.blockList[blockIndex];
    }
    runInAction(() => {
      this.props.store.editorPanel.updateAggregateDetails = false;
    });
    // Check if this is a BYOcode block, if so, render BYO fragment.
    if (activeBlock && activeBlock.byoCode) {
      // Update Handlebars first:
      // Update Editor Contents.
      runInAction(() => {
        this.props.store.treeActionPanel.formValues = this.props.store.api.generateCode(
          activeEditor
        );
        this.props.store.treeActionPanel.isNewFormValues = true;
      });
      return (
        <div className="aggregateDetailsWrapper">
          <nav className="aggregateDetailsToolbar pt-navbar pt-dark">
            <h2 className="currentBlockChoice">
              {' '}
              {globalString('aggregate_builder/details_title')}
            </h2>
            <div className="pt-align-right">
              <Tooltip
                intent={Intent.PRIMARY}
                hoverOpenDelay={1000}
                inline
                content={globalString('aggregate_builder/hide_left_panel')}
                tooltipClassName="pt-dark"
                position={Position.BOTTOM}
              >
                <AnchorButton
                  className="hideLeftPanelButton circleButton"
                  intent={Intent.SUCCESS}
                  onClick={this.props.store.api.onHideLeftPanelClicked}
                >
                  <HideIcon className="dbKodaSVG" width={50} height={50} />
                </AnchorButton>
              </Tooltip>
              {activeBlock &&
                activeBlock.type.toUpperCase() !== 'START' && (
                  <Tooltip
                    intent={Intent.PRIMARY}
                    hoverOpenDelay={1000}
                    inline
                    content={globalString('aggregate_builder/byo_code')}
                    tooltipClassName="pt-dark"
                    position={Position.BOTTOM}
                  >
                    <AnchorButton
                      className="byoCodeButton circleButton"
                      intent={Intent.SUCCESS}
                      onClick={this.nonBYOCode}
                    >
                      <CodeIcon className="dbKodaSVG" width={50} height={50} />
                    </AnchorButton>
                  </Tooltip>
                )}
            </div>
          </nav>
          <div className="aggregateDetailsContent">
            <BYOBlock onChangeCallback={this.props.store.api.generateCode} />
          </div>
        </div>
      );
    }

    // Check if activeBlock has changed, if so, rebuild the form.
    if (
      activeBlock &&
      (activeBlock !== this.state.previousActiveBlock || this.state.reproduceCode)
    ) {
      this.state.reproduceCode = false;
      this.state.previousActiveBlock = activeBlock;
      this.formPromise = this.formBuilder.createForm(
        this.resolveArguments,
        this.updateBlockFields,
        activeEditor,
        {
          action: activeBlock.type,
          aggregate: true
        }
      );
      this.formPromise
        .then(res => {
          this.dynamicForm = res;
          this.showForm(true);
          this.setState({ form: this.dynamicForm });
          this.dynamicForm.getData();
        })
        .catch(reason => {
          this.updateMsg(reason);
        });
    }
    let maxColumns = 2;
    if (this.state.form) {
      maxColumns = BlockTypes[this.state.form.title.toUpperCase()].columns;
      if (!maxColumns) {
        maxColumns = 2;
      }
    }
    return (
      <div className="aggregateDetailsWrapper">
        <nav className="aggregateDetailsToolbar pt-navbar pt-dark">
          <h2 className="currentBlockChoice">{globalString('aggregate_builder/details_title')}</h2>
          <div className="pt-align-right">
            <Tooltip
              intent={Intent.PRIMARY}
              hoverOpenDelay={1000}
              inline
              content={globalString('aggregate_builder/hide_left_panel')}
              tooltipClassName="pt-dark"
              position={Position.BOTTOM}
            >
              <AnchorButton
                className="hideLeftPanelButton circleButton"
                intent={Intent.SUCCESS}
                onClick={this.props.store.api.onHideLeftPanelClicked}
              >
                <HideIcon className="dbKodaSVG" width={50} height={50} />
              </AnchorButton>
            </Tooltip>
            {activeBlock &&
              activeBlock.type.toUpperCase() !== 'START' && (
                <Tooltip
                  intent={Intent.PRIMARY}
                  hoverOpenDelay={1000}
                  inline
                  content={globalString('aggregate_builder/byo_code')}
                  tooltipClassName="pt-dark"
                  position={Position.BOTTOM}
                >
                  <AnchorButton
                    className="byoCodeButton circleButton"
                    intent={Intent.SUCCESS}
                    onClick={this.byoCode}
                  >
                    <CodeIcon className="dbKodaSVG" width={50} height={50} />
                  </AnchorButton>
                </Tooltip>
              )}
          </div>
        </nav>
        {this.props.store.editors.get(this.props.store.editorPanel.activeEditorId) &&
        !this.props.store.editors.get(this.props.store.editorPanel.activeEditorId)
          .isAggregateDetailsLoading &&
        !this.props.store.editorToolbar.isActiveExecuting ? (
          <div className="aggregateDetailsContent">
            {activeBlock && <h2 className="aggregateBlockType">{activeBlock.type}</h2>}
            {activeBlock && (
              <p className="aggregateBlockDescription">
                {BlockTypes[activeBlock.type.toUpperCase()].description}
              </p>
            )}
            {activeBlock && (
              <div className={'dynamic-form columns-' + maxColumns + '-max'}>
                {this.state.form && <View mobxForm={this.state.form.mobxForm} isAggregate />}
                {!this.bForm && (
                  <div>
                    <div className="tree-msg-div">
                      {this.msg && <span>{this.msg}</span>}
                      {!this.msg && <LoadingView />}
                    </div>
                  </div>
                )}
                <Tooltip
                  className="applyButton pt-tooltip-indicator pt-tooltip-indicator-form"
                  content={globalString('aggregate_builder/applyTooltip')}
                  hoverOpenDelay={1000}
                  inline
                  intent={Intent.PRIMARY}
                  position={Position.BOTTOM}
                >
                  <Button
                    className="reset-button pt-button pt-intent-primary"
                    text={globalString('aggregate_builder/apply')}
                    disabled={!activeBlock}
                    onClick={this._onApplyBlock}
                  />
                </Tooltip>
              </div>
            )}
            {!activeBlock && (
              <div className="aggregateDetailsContent">
                <p> {globalString('aggregate_builder/no_block_selected')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="loaderWrapper">
            <div className="loader" />
          </div>
        )}
      </div>
    );
  }
}
