/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-18T13:51:12+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-18T16:19:29+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

export default observer(({ member }) => {
  const rowFields = [];
  member.map((col) => {
    rowFields.push(
      <div className="pt-form-group form-group-inline">
        {/* <label className="pt-label" htmlFor={col.id}>
          {col.label}
        </label> */}
        <div className="pt-form-content">
          <input className="pt-input pt-input-90" {...col.bind()} />
          <p className="pt-form-helper-text">{col.error}</p>
        </div>
      </div>,
    );
  });

  return (
    <div>
      {rowFields}
    </div>
  );
});
