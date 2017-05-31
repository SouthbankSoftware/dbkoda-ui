/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-21T10:47:14+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-21T16:38:47+10:00
 */

/**
 * input dom for connection profile panel
 */
import React from 'react';
import {observer} from 'mobx-react';
import './style.scss';

export default observer(({
  field,
  showLabel = false,
  disable = false,
  divOnClick = () => {}
}) => (
  <div // eslint-disable-line
    className={field.name + '-input-content pt-form-group pt-inline'}
    onClick={divOnClick}>
    {showLabel && <label
      className={field.name + '-label pt-label field-inline pt-label-r'}
      htmlFor={field.id}>
      {field.label}
    </label>}
    <div className="pt-form-content field-inline">
      <input
        className={field.name + '-input pt-input'}
        {...field.bind()}
        disabled={disable
        ? 'disabled'
        : ''} />
      <p className="pt-form-helper-text">{field.error}</p>
    </div>
  </div>
));
