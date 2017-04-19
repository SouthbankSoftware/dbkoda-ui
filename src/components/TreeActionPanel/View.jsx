/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-05T15:49:08+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-19T16:00:00+10:00
 */

// This will get the mobx-react-form and create dynamic fields for that form

import React from 'react';
import { observer } from 'mobx-react';

import FormTable from './Components/FormTable';
import TextField from './Components/TextField';
import './View.scss';

@observer
export default class TreeActionView extends React.Component {
  render() {
    const { mobxForm, title } = this.props;
    const formFields = [];
    if (mobxForm && mobxForm.fields.size > 0) {
      for (const key of mobxForm.fields._keys) {
        if (mobxForm.fields.get(key).type == 'Text') {
          formFields.push(<TextField field={mobxForm.$(key)} />);
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
          <button className="pt-button pt-large pt-intent-primary right-button" type="submit" onClick={mobxForm.onSubmit}>Update</button>
          <p>{mobxForm.error}</p>
        </form>
      </div>
    );
  }
}
