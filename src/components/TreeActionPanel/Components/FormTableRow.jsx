/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-18T13:51:12+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-20T18:35:18+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

import FieldControl from './FieldControls';

export default observer(({ member }) => {
  const rowFields = [];
  member.map((col) => {
    rowFields.push(
      <div className="pt-form-group form-group-inline">
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
      <FieldControl
        field={member}
        controls={{
          onDel: true,
        }}
      />
    </div>
  );
});
