/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:49:08+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-07T16:22:04+10:00
 */

// This will get the mobx-react-form and create dynamic fields for that form

import React from 'react';
import { observer } from 'mobx-react';

@observer
export default class TreeActionView extends React.Component {
  componentWillMount() {

  }
  getTextField(form, key) {
    return (
      <div className="pt-form-group pt-inline">
        <label className="pt-label" htmlFor={form.$(key).id}>
          {form.$(key).label}
        </label>
        <div className="pt-form-content">
          <input className="pt-input" {...form.$(key).bind()} />
          <p className="pt-form-helper-text">{form.$(key).error}</p>
        </div>
      </div>
    );
  }

  render() {
    const { form, title } = this.props;
    const formFields = [];
    if (form && form.fields.size > 0) {
      for (const key of form.fields._keys) {
        if (form.fields.get(key).type == 'Text') {
          formFields.push(this.getTextField(form, key));
        }
      }
    }
    return (
      <div className="pt-dark ">
        <h3 className="profile-title">{title}</h3>
        <form>
          {formFields}

          <button type="submit" onClick={form.onSubmit}>Submit</button>
          <p>{form.error}</p>
        </form>
      </div>
    );
  }
}
