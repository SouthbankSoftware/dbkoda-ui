/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-18T13:51:12+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-15T15:00:45+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

import FieldControl from './FieldControls';
import TextField from './TextField';
import SelectField from './SelectField';
import NumericField from './NumericField';
import BooleanField from './BooleanField';
import ComboField from './ComboField';

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
      rowFields.push(<BooleanField key={member.id + col.key} field={col} formGroup />);
    } else if (col.type == 'Combo') {
      rowFields.push(<ComboField key={member.id + col.key} field={col} showLabel={false} formGroup />);
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
