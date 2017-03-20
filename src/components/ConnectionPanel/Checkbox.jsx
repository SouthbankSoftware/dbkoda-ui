/**
 * input dom for connection profile panel
 */
import React from 'react';
import {observer} from 'mobx-react';
import {Checkbox} from '@blueprintjs/core';
import './style.scss';

export default observer(({field}) => (

  <div className={field.name + '-input-content pt-form-group pt-inline '}>
    <div className="input-content">
      <Checkbox className={field.name + '-input'} {...field.bind()} />
    </div>
  </div>
));
