/**
 * input dom for connection profile panel
 */
import React from 'react';
import {observer} from 'mobx-react';
import './style.scss';

export default observer(({field}) => (

  <div className={field.name + '-input-content pt-form-group pt-inline '}>
    <label className="pt-label" htmlFor={field.id}>{field.label}</label>
    <div className="input-content">
      <input className={field.name + '-input'} {...field.bind()} />
    </div>
  </div>
));
