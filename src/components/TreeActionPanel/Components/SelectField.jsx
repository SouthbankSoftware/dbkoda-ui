/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-03T14:42:55+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-04T15:15:07+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

export default observer(({ field }) => (
  <div className="pt-form-group pt-inline">
    <label htmlFor={field.id} className="pt-label pt-label-r-30">
      {field.label}
    </label>
    <div className="pt-form-content">
      <select className="pt-select" id={field.id} value={field.value}>
        {field.options && field.options.map(val =>
          <option key={val} value={val}>{val}</option>)}
      </select>
      <p className="pt-form-helper-text">{field.error}</p>
    </div>
  </div>
));
