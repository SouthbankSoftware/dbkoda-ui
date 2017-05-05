/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-18T13:51:12+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-05T15:58:04+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

import FieldControl from './FieldControls';
import TextField from './TextField';
import SelectField from './SelectField';

export default observer(({ member }) => {
  const rowFields = [];
  member.map((col) => {
    if (col.type == 'Text') {
      rowFields.push(<TextField field={col} showLabel={false} formGroup />);
    } else if (col.type == 'Select') {
      rowFields.push(<SelectField field={col} showLabel={false} formGroup />);
    }
  });

  return (
    <div>
      {rowFields}
      <FieldControl
        field={member}
        controls={{
          onDel: true
        }}
      />
    </div>
  );
});
