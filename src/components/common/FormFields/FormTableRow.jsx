/*
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-18T13:51:12+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-01-31T12:37:45+11:00
 */

import React from 'react';
import { observer } from 'mobx-react';

import FieldControl from './FieldControls';
import TextField from './TextField';
import SelectField from './SelectField';
import NumericField from './NumericField';
import BooleanField from './BooleanField';
import ComboField from './ComboField';
import CodeMirrorField from './CodeMirrorField';

export default observer(({ member }) => {
  const rowFields = [];
  member.map(col => {
    if (col.type == 'Text') {
      rowFields.push(
        <TextField
          key={member.id + col.key}
          field={col}
          showLabel={false}
          formGroup
        />
      );
    } else if (col.type == 'Select') {
      rowFields.push(
        <SelectField
          key={member.id + col.key}
          field={col}
          showLabel={false}
          formGroup
        />
      );
    } else if (col.type == 'CodeMirror') {
      rowFields.push(
        <CodeMirrorField
          key={member.id + col.key}
          field={col}
          showLabel={false}
          formGroup
        />
      );
    } else if (col.type == 'Numeric') {
      rowFields.push(
        <NumericField
          key={member.id + col.key}
          field={col}
          showLabel={false}
          formGroup
        />
      );
    } else if (col.type == 'Boolean') {
      rowFields.push(
        <BooleanField key={member.id + col.key} field={col} formGroup />
      );
    } else if (col.type == 'Combo') {
      rowFields.push(
        <ComboField
          key={member.id + col.key}
          field={col}
          showLabel={false}
          formGroup
        />
      );
    }
  });

  return (
    <div className="tableFields">
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
