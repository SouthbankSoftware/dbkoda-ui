/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-23T13:15:39+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-30T15:24:21+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

export default observer(({
  field,
  data
}) => {
  const fldClassName = 'pt-table pt-interactive pt-striped';

  const tableHeaders = [];
  const tableRows = [];

  for (const header of field.columns) {
    tableHeaders.push(<th>{header.label}</th>);
  }

  try {
    for (const row of data) {
      const tableCells = [];
      for (const header of field.columns) {
        const cellVal = row[header.name] + '';
        if (isNaN(Number(cellVal.replace(/,/g, '')))) {
          tableCells.push(<td>{cellVal}</td>);
        } else {
          tableCells.push(<td style={{ textAlign: 'right'}}>{cellVal}</td>);
        }
      }
      tableRows.push(<tr>{tableCells}</tr>);
    }
  } catch (e) {
    console.log(e);
  }



  return (
    <div className="div-field-container" style={field.width && {width: field.width}}>
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
    </div>
  );
});
