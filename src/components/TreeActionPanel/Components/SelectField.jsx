/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-03T14:42:55+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-05T15:54:41+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

export default observer(({
  field,
  showLabel = true,
  formGroup = false
}) => {
  const className = (formGroup) ? 'pt-form-group form-group-inline' : 'pt-form-group pt-inline';
  return (
    <div className={className}>
      {showLabel &&
        <label htmlFor={field.id} className="pt-label pt-label-r-30">
          {field.label}
        </label>}
      <div className="pt-form-content">
        <select
          className="pt-select"
          id={field.id}
          value={field.value}
          {...field.bind()}
        >
          {field.options &&
            field.options.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
        </select>
        <p className="pt-form-helper-text">{field.error}</p>
      </div>
    </div>
  );
});
