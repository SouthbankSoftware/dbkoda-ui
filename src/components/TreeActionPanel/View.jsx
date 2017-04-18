/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:49:08+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-18T15:54:08+10:00
 */

// This will get the mobx-react-form and create dynamic fields for that form

import React from 'react';
import { observer } from 'mobx-react';

import FormTable from './Components/FormTable';
import './View.scss';

@observer
export default class TreeActionView extends React.Component {
  getTextField(field) {
    return (
      <div className="pt-form-group pt-inline">
        <label className="pt-label pt-label-r-30" htmlFor={field.id}>
          {field.label}
        </label>
        <div className="pt-form-content">
          <input className="pt-input" {...field.bind()} />
          <p className="pt-form-helper-text">{field.error}</p>
        </div>
      </div>
    );
  }

  render() {
    const { mobxForm, title } = this.props;
    const formFields = [];
    if (mobxForm && mobxForm.fields.size > 0) {
      for (const key of mobxForm.fields._keys) {
        if (mobxForm.fields.get(key).type == 'Text') {
          formFields.push(this.getTextField(mobxForm.$(key)));
        } else if (mobxForm.fields.get(key).type == 'Table') {
          formFields.push(<FormTable members={mobxForm.$(key)} />);
        }
      }
    }
    return (
      <div className="pt-dark ">
        <h3 className="profile-title">{title}</h3>
        <form onChange={mobxForm.onValueChange(mobxForm)}>
          {formFields}

          <button className="pt-button pt-large pt-intent-primary right-button" type="submit" onClick={mobxForm.onSubmit}>Submit</button>
          <p>{mobxForm.error}</p>
        </form>
      </div>
    );
  }
}
