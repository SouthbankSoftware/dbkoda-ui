/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-19T15:43:32+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-05T16:20:19+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

export default observer(({
  field,
  showLabel = true,
  formGroup = false
}) => {
  const fldClassName = (formGroup) ? 'pt-form-group form-group-inline' : 'pt-form-group pt-inline';
  const inputClassName = (formGroup) ? 'pt-input pt-input-90' : 'pt-input';
  return (
    <div className={fldClassName}>
      {showLabel &&
        <label className="pt-label pt-label-r-30" htmlFor={field.id}>
          {field.label}
        </label>}
      <div className="pt-form-content">
        <input className={inputClassName} {...field.bind()} />
        <p className="pt-form-helper-text">{field.error}</p>
      </div>
    </div>
  );
});
