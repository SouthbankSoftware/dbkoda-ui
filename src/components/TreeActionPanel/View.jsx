/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:49:08+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-11T09:16:23+10:00
 */

// This will get the mobx-react-form and create dynamic fields for that form

import React from 'react';
import { observer } from 'mobx-react';

@observer
export default class TreeActionView extends React.Component {
  componentWillMount() {

  }
  getTextField(mobxForm, key) {
    return (
      <div className="pt-form-group pt-inline">
        <label className="pt-label" htmlFor={mobxForm.$(key).id}>
          {mobxForm.$(key).label}
        </label>
        <div className="pt-form-content">
          <input className="pt-input" {...mobxForm.$(key).bind()} />
          <p className="pt-form-helper-text">{mobxForm.$(key).error}</p>
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
          formFields.push(this.getTextField(mobxForm, key));
        }
      }
    }
    return (
      <div className="pt-dark ">
        <h3 className="profile-title">{title}</h3>
        <form onChange={mobxForm.onValueChange(mobxForm)}>
          {formFields}

          <button type="submit" onClick={mobxForm.onSubmit}>Submit</button>
          <p>{mobxForm.error}</p>
        </form>
      </div>
    );
  }
}
