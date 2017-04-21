/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-21T10:47:14+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-21T14:08:10+10:00
 */



/**
 * input dom for connection profile panel
 */
import React from 'react';
import {observer} from 'mobx-react';
import {Radio} from '@blueprintjs/core';
import './style.scss';

export default observer(({field, showLabel = false, onChange = null, }) => (

  <div className={field.name + '-input-content'}>
    <div className="pt-form-content">
      <Radio className={field.name + '-radio-input'} {...field.bind()} label={showLabel ? field.label : ''} checked={field.get('value')}
        onChange={onChange} />
    </div>
  </div>
));
