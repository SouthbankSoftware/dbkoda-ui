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
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:56:11+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-07-26T12:52:15+10:00
 */

import React from 'react';

import { action, observable, runInAction } from 'mobx';
import { inject, observer } from 'mobx-react';
import { DrawerPanes } from '#/common/Constants';
import View from './View';
import FormBuilder from './FormBuilder';

@inject('store')
@observer
export default class TreeActionPanel extends React.Component {
  componentWillMount() {
    const { treeActionPanel, updateDynamicFormCode } = this.props.store;

    const profile = this.props.store.profileList.selectedProfile;
    if (profile && profile.status == 'OPEN') {
      const editor = this.props.store.editors.get(
        this.props.store.treeActionPanel.treeActionEditorId
      );
      /**
       * Resolve the prefetch arguments and return them as params
       * @param  {Array}  args     Arguments array as provided from DDD file
       * @return {Object}          Object containing params for prefetch function
       */
      const resolveArguments = args => {
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
                } else if (treeActionPanel.treeNode.type == 'role') {
                  params[arg.name] = treeActionPanel.treeNode.refParent.json.text;
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

      const formBuilder = new FormBuilder();
      this.formPromise = formBuilder.createForm(
        resolveArguments,
        updateDynamicFormCode,
        editor,
        treeActionPanel.treeAction
      );
      this.formPromise
        .then(res => {
          this.dynamicForm = res;
          this.showForm(true);
          this.dynamicForm.getData();
        })
        .catch(reason => {
          this.updateMsg(reason);
        });
    } else {
      runInAction('reset to default view', () => {
        this.props.store.setDrawerChild(DrawerPanes.DEFAULT);
        this.props.store.treeActionPanel.treeActionEditorId = '';
        this.props.store.treeActionPanel.isNewFormValues = false;
      });
    }
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
  close(e) {
    e.preventDefault();
    this.props.store.setDrawerChild(DrawerPanes.DEFAULT);
    this.props.store.treeActionPanel.treeActionEditorId = '';
    this.props.store.treeActionPanel.isNewFormValues = false;
  }
  render() {
    return (
      <div className="dynamic-form">
        {this.bForm && <View title={this.dynamicForm.title} mobxForm={this.dynamicForm.mobxForm} />}
        {!this.bForm && (
          <div>
            <div className="tree-msg-div">
              <span>{this.msg}</span>
            </div>
            <button className="pt-button pt-intent-primary right-button" onClick={this.close}>
              {globalString('tree/closeButton')}
            </button>
          </div>
        )}
      </div>
    );
  }
}
