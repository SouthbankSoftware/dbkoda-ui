/**
 * input dom for connection profile panel
 */
import React from 'react';
import {observer} from 'mobx-react';
import {Radio} from '@blueprintjs/core';
import './style.scss';

export default observer(({field, onChange = null}) => (

  <div className={field.name + '-input-content pt-form-group pt-inline '}>
    <div className="input-content">
      <Radio className={field.name + '-radio-input'} {...field.bind()} checked={field.get('value')}
             onChange={onChange.bind(this)}/>
    </div>
  </div>
));
