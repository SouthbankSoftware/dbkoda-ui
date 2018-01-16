/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-05T16:32:20+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-16T15:21:01+11:00
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
import { Button, ButtonGroup } from '@blueprintjs/core';
import RGL, { WidthProvider } from 'react-grid-layout';

import TextField from '#/TreeActionPanel/Components/TextField';
import NumericField from '#/TreeActionPanel/Components/NumericField';
import BooleanField from '#/TreeActionPanel/Components/BooleanField';

import { ConnectionForm } from './ConnectionForm';
import './Panel.scss';

const ReactGridLayout = WidthProvider(RGL);

type Props = {
  store: any,
  api: *
};

type State = {
  selectedSubform: string
};
@inject(({ store, api }) => {
  return {
    store,
    api
  };
})
@observer
export default class ProfileManager extends React.Component<Props, State> {
  form: null;

  static defaultProps = {
    store: null,
    api: null
  };

  state = {
    selectedSubform: 'basic',
    connecting: false
  };

  constructor(props: Props) {
    super(props);

    const { store } = this.props;
    this.form = new ConnectionForm();
    if (store && store.profileList.selectedProfile) {
      this.form.updateSchemaFromProfile(
        store.profileList.selectedProfile
      );
    }
  }

  renderUIFields(column) {
    const fields = this.form.getSubformFields(this.state.selectedSubform, column);
    const uiFields = [];
    if (fields) {
      fields.forEach((field) => {
        let uiField;
        if (field.type == 'text' || field.type == 'password') {
          uiField = <TextField key={field.name} field={field} />;
        } else if (field.type == 'number') {
          uiField = <NumericField key={field.name} field={field} />;
        } else if (field.type == 'checkbox') {
          uiField = <BooleanField key={field.name} field={field} />;
        }

        uiFields.push(uiField);
      });
    }
    return uiFields;
  }

  renderMenu() {
    const menuBtns = [];
    const subforms = this.form.getSubForms();
    subforms.forEach((formStr) => {
      const subForm = this.form.formSchema[formStr];
      menuBtns.push(
        <Button
          active={this.state.selectedSubform == formStr}
          key={formStr}
          onClick={() => {
            this.setState({
              selectedSubform: formStr
            });
          }}
        >
          {subForm.name}
        </Button>
      );
    });

    return (
      <ButtonGroup className="menuBtns" minimal={false} large vertical fill>
        {menuBtns}
      </ButtonGroup>
    );
  }

  render() {
    const { store } = this.props;
    return (
      <div className="ProfileManager">
        <div key="column0" className="connectionLeftPane">
          <div className="form-title">
            <span>Create New Connection</span>
          </div>

          {this.renderMenu()}
        </div>
        <ReactGridLayout className="layout" rowHeight={150} margin={[0, 10]}>
          <div
            key="column1"
            data-grid={{ x: 0, y: 1.5, w: 3.5, h: 3, static: true }}
          >
            <div className="pt-dark form-scrollable">
              <form>{this.renderUIFields(1)}</form>
            </div>
          </div>
          <div
            key="column2"
            data-grid={{ x: 3.5, y: 1.5, w: 3.5, h: 3, static: true }}
          >
            <div className="pt-dark form-scrollable">
              <form>{this.renderUIFields(2)}</form>
            </div>
          </div>
          <div
            key="column3"
            data-grid={{ x: 7, y: 1.5, w: 3, h: 3, static: true }}
          >
            <div className="pt-dark form-scrollable">
              <form>
                <div className="profile-button-panel">
                  <Button
                    className={
                      (this.form.formErrors.length > 0
                        ? 'inactive'
                        : 'active') +
                      ' connectButton pt-button pt-intent-success'
                    }
                    onClick={() => {
                      this.form.onConnect(this.form.formSchema);
                    }}
                    text={globalString('connection/form/connectButton')}
                    disabled={this.form.formErrors.length > 0}
                    loading={this.state.connecting}
                  />
                </div>
                <div className="profile-button-panel">
                  <Button
                    className="save-button pt-button pt-intent-primary"
                    text={globalString('connection/form/saveButton')}
                    onClick={() => this.form.onSave(this.form.formSchema)}
                  />{' '}
                  <Button
                    className={
                      (this.form.formErrors.length > 0
                        ? 'inactive'
                        : 'active') + ' test-button pt-button pt-intent-primary'
                    }
                    onClick={() => this.form.onTest(this.form.formSchema)}
                    text={globalString('connection/form/testButton')}
                    disabled={this.form.formErrors.length > 0}
                    loading={this.state.testing}
                  />
                  <Button
                    className="reset-button pt-button pt-intent-warning"
                    onClick={() => this.form.onReset(this.form.formSchema)}
                    text={globalString('connection/form/resetButton')}
                  />
                </div>
              </form>
            </div>
          </div>
        </ReactGridLayout>
        <Button
          className="close-button pt-button pt-intent-primary"
          text="X"
          onClick={() => store.hideConnectionPane()}
        />
      </div>
    );
  }
}
