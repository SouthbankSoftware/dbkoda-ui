/**
 * input dom for connection profile panel
 */
import React from 'react';
import {observer} from 'mobx-react';
import './style.scss';

export default observer(({field, showLabel = false, disable = false}) => (

  <div className={field.name + '-input-content  cell-container'}>
    {
      showLabel ? <label className="pt-label" htmlFor={field.id}>{field.label}</label> : null
    }
    <div className="input-content">
      <input className={field.name + '-input pt-input profile-connection-input'} {...field.bind()} disabled={disable ? 'disabled' : ''} />
    </div>
  </div>
));

