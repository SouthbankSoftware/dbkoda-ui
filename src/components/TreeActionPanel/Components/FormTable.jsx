/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-18T13:31:39+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-04-18T16:17:11+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

import FormTableRow from './FormTableRow';

export default observer(({ members }) => {
  const labels = [];
  if (members.value && members.value.length > 0) {
    const cols = members.value[0];
    for (const lbl in cols) {
      labels.push(
        <div className="pt-form-group form-group-inline">
        <label>{lbl}</label>
        </div>
      );
    }
  }

  return (
    <fieldset>

      <div className="clearfix">
        <div className="left">
          <b>{members.label}</b>
        </div>

        {/* <div className="right">
        <FieldControl
          field={members}
          labels={false}
          controls={{
            onAdd: true,
            onClear: true,
            onReset: true,
          }}
        />
      </div> */}
      </div>

      <hr />
      {labels}
      {members.map(member => <FormTableRow key={member.key} member={member} />)}

    </fieldset>
  );
});
