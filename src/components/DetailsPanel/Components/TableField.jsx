/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-23T13:15:39+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-23T16:39:51+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

export default observer(({
  field,
  data
}) => {
  console.log('TableField field:', field);
  console.log('TableField data:', data);
  const fldClassName = 'pt-table pt-interactive';

  const tableHeaders = [];
  const tableRows = [];

  for (const header of field.columns) {
    tableHeaders.push(<th>{header.label}</th>);
  }

  for (const row of data) {
    const tableCells = [];
    for (const header of field.columns) {
      tableCells.push(<td>{row[header.name]}</td>);
    }
    tableRows.push(<tr>{tableCells}</tr>);
  }

  return (
    <fieldset className="detailsFieldSet">
      <label htmlFor={field.name} className="pt-label pt-label-field">
        {field.label}
      </label>
      <table className={fldClassName}>
        <thead>
          {tableHeaders}
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </table>
    </fieldset>
  );
});
