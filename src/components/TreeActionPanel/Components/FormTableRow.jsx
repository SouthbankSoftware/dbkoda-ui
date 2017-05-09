/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-18T13:51:12+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-09T16:43:23+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

import FieldControl from './FieldControls';
import TextField from './TextField';
import SelectField from './SelectField';
import NumericField from './NumericField';
import BooleanField from './BooleanField';

export default observer(({ member }) => {
  const rowFields = [];
  member.map((col) => {
    if (col.type == 'Text') {
      rowFields.push(<TextField key={member.id + col.key} field={col} showLabel={false} formGroup />);
    } else if (col.type == 'Select') {
      rowFields.push(<SelectField key={member.id + col.key} field={col} showLabel={false} formGroup />);
    } else if (col.type == 'Numeric') {
      rowFields.push(<NumericField key={member.id + col.key} field={col} showLabel={false} formGroup />);
    } else if (col.type == 'Boolean') {
      rowFields.push(<NumericField key={member.id + col.key} field={col} formGroup />);
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
