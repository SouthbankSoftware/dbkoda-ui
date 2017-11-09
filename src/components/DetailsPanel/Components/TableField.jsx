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
 * @Date:   2017-05-23T13:15:39+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-06-07T10:20:40+10:00
 */

import React from 'react';
import { observer } from 'mobx-react';

export default observer(({ field, data }) => {
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
        let cellVal = row[header.name] + '';
        if (isNaN(Number(cellVal.replace(/,/g, '')))) {
          tableCells.push(<td>{cellVal}</td>);
        } else {
          cellVal = globalNumber(Number(cellVal.replace(/,/g, '')));
          tableCells.push(<td style={{ textAlign: 'right' }}>{cellVal}</td>);
        }
      }
      tableRows.push(<tr>{tableCells}</tr>);
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <div
      className="div-field-container"
      style={field.width && { width: field.width }}
    >
      <label htmlFor={field.name} className="pt-label pt-label-field">
        {field.label}
      </label>
      <table className={fldClassName}>
        <thead>{tableHeaders}</thead>
        <tbody>{tableRows}</tbody>
      </table>
    </div>
  );
});
