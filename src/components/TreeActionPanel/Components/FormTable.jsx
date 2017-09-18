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
 * @Date:   2017-04-18T13:31:39+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-31T15:36:40+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

import FormTableRow from './FormTableRow';
import FieldControl from './FieldControls';

export default observer(({ members }) => {
  const labels = [];
  if (members.value && members.value.length > 0) {
    const cols = members.map((member) => {
      return member.map((fld) => {
        if (fld.label != '') {
          return fld.label;
        }
        return fld.name;
      });
    })[0];
    for (const lbl of cols) {
      if (lbl !== 'last') {
        labels.push(
          <div key={'lbl' + lbl} className="pt-form-group form-group-inline">
            <label htmlFor={lbl}>{lbl}</label>
          </div>,
        );
      }
    }
    labels.push(
      <div
        key="lblCtrl"
        className="pt-form-group form-group-inline table-field-15"
      >
        <label htmlFor="ctrl" style={{ display: 'hidden' }} />
      </div>,
    );
  }

  return (
    <fieldset
      className="tableFieldSet"
      label={members.label ? members.label : members.name}
    >

      <div className="clearfix tableHeader">
        <div className="left">
          <b>{members.label}</b>
        </div>

        <div className="right">
          <FieldControl
            field={members}
            controls={{
              onAdd: true,
              onClear: true,
            }}
          />
        </div>
      </div>
      <div className="tableColumnHeader">
        {labels}
      </div>
      <div className="scrollableDiv field-group">
        {members.map(member => (
          <FormTableRow key={member.id} member={member} />
        ))}
      </div>

    </fieldset>
  );
});
