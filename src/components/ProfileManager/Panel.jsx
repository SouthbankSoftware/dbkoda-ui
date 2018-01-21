/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-01-05T16:32:20+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-19T13:01:33+11:00
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
import { Button, ButtonGroup, Position } from '@blueprintjs/core';
import RGL, { WidthProvider } from 'react-grid-layout';

import TextField from '#/TreeActionPanel/Components/TextField';
import NumericField from '#/TreeActionPanel/Components/NumericField';
import BooleanField from '#/TreeActionPanel/Components/BooleanField';

import { DBKodaToaster } from '#/common/Toaster';
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
    formTitle: globalString('connection/createHeading'),
    connecting: false
  };

  constructor(props: Props) {
    super(props);

    const { store, api } = this.props;
    this.form = new ConnectionForm(api);
    if (store && store.profileList.selectedProfile) {
      this.setState({ formTitle: globalString('connection/editHeading')});
      this.form.updateSchemaFromProfile(store.profileList.selectedProfile);
    }
    const showToaster = (strErrorCode, err) => {
      switch (strErrorCode) {
        case 'existingAlias':
          DBKodaToaster(Position.LEFT_BOTTOM).show({
            message: globalString('connection/existingAlias'),
            className: 'danger',
            iconName: 'pt-icon-thumbs-down',
          });
        break;
        case 'connectionFail':
          DBKodaToaster(Position.LEFT_BOTTOM).show({
            message: (<span dangerouslySetInnerHTML={{ __html: 'Error: ' + err.message.substring(0, 256) + '...' }} />), // eslint-disable-line react/no-danger
            className: 'danger',
            iconName: 'pt-icon-thumbs-down',
          });
        break;
        case 'connectionSuccess':
          DBKodaToaster(Position.RIGHT_TOP).show({
            message: globalString('connection/success'),
            className: 'success',
            iconName: 'pt-icon-thumbs-up'
          });
        break;
        default:
        break;
      }
    };
    api.setToasterCallback(showToaster);
  }

  renderUIFields(column) {
    const fields = this.form.getSubformFields(
      this.state.selectedSubform,
      column
    );
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
            <span>{this.state.formTitle}</span>
          </div>

          {this.renderMenu()}
        </div>
        <ReactGridLayout className="layout" cols={10} rowHeight={150} margin={[0, 10]}>
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
            className="no-border"
            data-grid={{ x: 7, y: 1.5, w: 3, h: 3, static: true }}
          >
            <span>Panel reserved for TIPs</span>
          </div>
          <div
            key="rowBottom"
            className="no-border"
            data-grid={{ x: 4, y: 4.5, w: 6, h: 2, static: true }}
          >
            <div className="pt-dark form-scrollable">
              <form className="formButtons">
                <div className="profile-button-panel">
                  <Button
                    className={
                      (this.form.formErrors.length > 0
                        ? 'inactive'
                        : 'active') +
                      ' connectButton pt-button pt-intent-success'
                    }
                    onClick={() => {
                      this.setState({ connecting: true });
                      this.form.onConnect()
                      .then(() => {
                        this.setState({ connecting: false });
                      })
                      .catch(() => this.setState({ connecting: false }));
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
                    onClick={() => this.form.onSave()}
                  />{' '}
                  <Button
                    className={
                      (this.form.formErrors.length > 0
                        ? 'inactive'
                        : 'active') + ' test-button pt-button pt-intent-primary'
                    }
                    onClick={() => this.form.onTest()}
                    text={globalString('connection/form/testButton')}
                    disabled={this.form.formErrors.length > 0}
                    loading={this.state.testing}
                  />
                  <Button
                    className="reset-button pt-button pt-intent-warning"
                    onClick={() => this.form.onReset()}
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
