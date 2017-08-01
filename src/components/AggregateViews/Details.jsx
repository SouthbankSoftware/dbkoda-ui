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
 * @Author: Michael Harrison
 * @Date:   2017-07-19 11:17:46
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   Mike
 * @Last modified time: 2017-07-19 11:17:49
 */

import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable, reaction } from 'mobx';
import FormBuilder from '#/TreeActionPanel/FormBuilder';
import View from '#/TreeActionPanel/View';
import './style.scss';

@inject(allStores => ({
  store: allStores.store,
}))
@observer
export default class Details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      form: null,
      previousActiveBlock: null
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
     */
    this.resolveArguments = (args) => {
      const params = {};
      if (args.length > 0 && treeActionPanel.treeNode) {
        for (let i = 0; i < args.length; i += 1) {
          const arg = args[i];
          switch (arg.value) {
            case 'treeNode.parentDB':
              if (treeActionPanel.treeNode.type == 'user') {
                params[arg.name] = treeActionPanel.treeNode.json.db;
              } else if (treeActionPanel.treeNode.type == 'collection') {
                params[arg.name] = treeActionPanel.treeNode.refParent.json.text;
              } else if (treeActionPanel.treeNode.type == 'index') {
                params[arg.name] = treeActionPanel.treeNode.refParent.refParent.json.text;
              }
              break;

            case 'treeNode.parentCOL':
              if (treeActionPanel.treeNode.type == 'index') {
                params[arg.name] = treeActionPanel.treeNode.refParent.json.text;
              }
              break;
            default:
              params[arg.name] = treeActionPanel.treeNode.json.text;
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
    if (this.props.store.editorPanel.updateAggregateDetails) {
      this.props.store.editorPanel.updateAggregateDetails = false;
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
    for (const key in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        editorObject.blockList[selectedBlock].fields[key] = fields[key];
      }
    }
  }

  formPromise;
  dynamicForm;
  @observable msg = '';
  @observable bForm = false;
  @action showForm(value) {
    this.bForm = value;
  }
  @action updateMsg(value) {
    this.msg = value;
  }
  render() {
    const activeEditor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
    const blockIndex = activeEditor.selectedBlock;
    const activeBlock = activeEditor.blockList[blockIndex];
    // Check if activeBlock has changed, if so, rebuild the form.
    if (activeBlock && activeBlock !== this.state.previousActiveBlock) {
      this.state.previousActiveBlock = activeBlock;
      this.formPromise = this.formBuilder.createForm(
        this.resolveArguments,
        this.updateBlockFields,
        this.editor,
        {
          action: activeBlock.type,
          aggregate: true
        }
     );
      this.formPromise
        .then((res) => {
          this.dynamicForm = res;
          this.showForm(true);
          this.setState({form: this.dynamicForm});
          this.dynamicForm.getData();
        })
        .catch((reason) => {
          this.updateMsg(reason);
        });
    }
    return (
      <div className="aggregateDetailsWrapper">
        <nav className="aggregateDetailsToolbar pt-navbar pt-dark">
          <h2 className="currentBlockChoice">
            Block Details
          </h2>
        </nav>
        { activeBlock &&
          <div className="aggregateDetailsContent">
            <p>
              Some fields will go here based on type {activeBlock.type}
            </p>
            <div className="dynamic-form">
              {this.state.form && <View
                title={this.state.form.title}
                mobxForm={this.state.form.mobxForm}
                isAggregate
              />}
              {!this.bForm &&
                <div>
                  <div className="tree-msg-div">
                    <span>{this.msg}</span>
                  </div>
                </div>}
            </div>
          </div>}
        { !activeBlock &&
          <div className="aggregateDetailsContent">
            <p>
              No block selected.
            </p>
          </div>}
      </div>
    );
  }
}

