/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-18T13:31:39+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-26T11:04:15+10:00
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

      <div className="clearfix">
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

      <hr />
      {labels}
      <div className="scrollableDiv">
        {members.map(member => (
          <FormTableRow key={member.id} member={member} />
        ))}
      </div>

    </fieldset>
  );
});
