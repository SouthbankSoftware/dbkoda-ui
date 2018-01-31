/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-16T13:45:03+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-16T14:47:20+10:00
 *
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

import React from 'react';
import { observer } from 'mobx-react';

import TextField from './TextField';
import SelectField from './SelectField';
import NumericField from './NumericField';
import BooleanField from './BooleanField';
import ComboField from './ComboField';
import CodeMirrorField from './CodeMirrorField';

export default observer(({ field }) => {
  const memberFields = [];
  field.map(member => {
    if (member.type == 'Text') {
      memberFields.push(
        <TextField key={member.id + member.key} field={member} />
      );
    } else if (member.type == 'Select') {
      memberFields.push(
        <SelectField key={member.id + member.key} field={member} />
      );
    } else if (member.type == 'CodeMirror') {
      memberFields.push(
        <CodeMirrorField key={member.id + member.key} field={member} />
      );
    } else if (member.type == 'Numeric') {
      memberFields.push(
        <NumericField key={member.id + member.key} field={member} />
      );
    } else if (member.type == 'Boolean') {
      memberFields.push(
        <BooleanField key={member.id + member.key} field={member} />
      );
    } else if (member.type == 'Combo') {
      memberFields.push(
        <ComboField key={member.id + member.key} field={member} />
      );
    }
  });
  return (
    <fieldset className="groupFieldSet">
      {field.label &&
        field.label != '--nolabel--' && (
          <div className="clearfix">
            <div className="left">
              <b>{field.label}</b>
            </div>
          </div>
        )}

      {field.label && field.label != '--nolabel--' && <hr />}
      {field.label && field.label == '--nolabel--' && <br />}
      {memberFields}
    </fieldset>
  );
});
