/**
 * input dom for connection profile panel
 */
import React from 'react';
import {observer} from 'mobx-react';
import './style.scss';

export default observer(({field, showLabel = true, disable = false}) => (

  <div className={field.name + '-input-content pt-form-group pt-inline '}>
    {
      showLabel ? <label className="pt-label" htmlFor={field.id}>{field.label}</label> : null
    }
    <div className="input-content">
      <input className={field.name + '-input'} {...field.bind()} disabled={disable ? 'disabled' : ''}/>
    </div>
  </div>
));
