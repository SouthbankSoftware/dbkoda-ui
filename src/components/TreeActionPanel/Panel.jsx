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
 * @Last modified by:   chris
 * @Last modified time: 2017-06-09T09:57:43+10:00
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
      const formBuilder = new FormBuilder();
      this.formPromise = formBuilder.createForm(
        treeActionPanel,
        updateDynamicFormCode,
        editor
      );
      this.formPromise
        .then((res) => {
          this.dynamicForm = res;
          this.showForm(true);
          this.dynamicForm.getData();
        })
        .catch((reason) => {
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
  @action showForm(value) {
    this.bForm = value;
  }
  @action updateMsg(value) {
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
    console.log(this);
    return (
      <div className="dynamic-form">
        {this.bForm && <View
          title={this.dynamicForm.title}
          mobxForm={this.dynamicForm.mobxForm}
        />}
        {!this.bForm &&
          <div>
            <div className="tree-msg-div">
              <span>{this.msg}</span>
            </div>
            <button
              className="pt-button pt-intent-primary right-button"
              onClick={this.close}>
              {globalString('tree/closeButton')}
            </button>
          </div>}
      </div>
    );
  }
}
