/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:49:08+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-03T16:18:22+10:00
 */

// This will get the mobx-react-form and create dynamic fields for that form

import React from 'react';
import { action } from 'mobx';
import { observer, inject } from 'mobx-react';
import { DrawerPanes } from '#/common/Constants';
import FormTable from './Components/FormTable';
import TextField from './Components/TextField';
import SelectField from './Components/SelectField';

import './View.scss';

@inject(allStores => ({
  setDrawerChild: allStores.store.setDrawerChild,
  treeActionPanel: allStores.store.treeActionPanel,
}))
@observer
export default class TreeActionView extends React.Component {
  @action.bound
  close() {
    this.props.setDrawerChild(DrawerPanes.DEFAULT);
    this.props.treeActionPanel.treeActionEditorId = '';
    this.props.treeActionPanel.isNewFormValues = false;
  }
  render() {
    const { mobxForm, title } = this.props;
    const formFields = [];
    if (mobxForm && mobxForm.fields.size > 0) {
      for (const key of mobxForm.fields._keys) {
        if (mobxForm.fields.get(key).type == 'Text') {
          formFields.push(<TextField key={key} field={mobxForm.$(key)} />);
        } else if (mobxForm.fields.get(key).type == 'Table') {
          formFields.push(<FormTable key={key} members={mobxForm.$(key)} />);
        } else if (mobxForm.fields.get(key).type == 'Select') {
          formFields.push(<SelectField key={key} field={mobxForm.$(key)} />);
        }
      }
    }
    return (
      <div className="pt-dark ">
        <h3 className="profile-title">{title}</h3>
        <form onChange={mobxForm.onValueChange(mobxForm)}>
          {formFields}
          <button
            className="pt-button pt-large pt-intent-primary right-button"
            onClick={this.close}
          >
            Close
          </button>
          <button
            className="pt-button pt-large pt-intent-success right-button"
            type="submit"
            onClick={mobxForm.onSubmit}
          >
            Update
          </button>
          <p>{mobxForm.error}</p>
        </form>
      </div>
    );
  }
}
