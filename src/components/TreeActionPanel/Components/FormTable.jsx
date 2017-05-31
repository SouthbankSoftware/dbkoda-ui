/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-18T13:31:39+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-31T09:38:28+10:00
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
      labels.push(
        <div key={'lbl' + lbl} className="pt-form-group form-group-inline">
          <label htmlFor={lbl}>{lbl}</label>
        </div>
      );
    }
  }

  return (
    <fieldset className="tableFieldSet" label={members.label ? members.label : members.name}>

      <div className="clearfix tableHeader">
        <div className="left">
          <b>{members.label}</b>
        </div>

        <div className="right">
          <FieldControl
            field={members}
            controls={{
              onAdd: true,
              onClear: true
            }}
          />
        </div>
      </div>

      <div className="field-group">
        {labels}
        {members.map(member => (
          <FormTableRow key={member.id} member={member} />
        ))}
      </div>

    </fieldset>
  );
});
