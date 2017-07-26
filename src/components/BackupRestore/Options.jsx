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
 * Created by joey on 21/7/17.
 */

import React from 'react';
import {Checkbox, Intent, Position, Tooltip} from '@blueprintjs/core';
import {BackupRestoreActions} from '../common/Constants';
import './Options.scss';

const getOptions = (options) => {
  return (
    <div className="options-panel">
      {
        options.map((o, i) => {
          const key = i;
          if (o.type === 'selection') {
            const value = o.value;
            return (<div className="option-item-row" key={key}>
              <span className="label">{o.label}</span>
              <div className="pt-select">
                <select className="select" defaultValue={value.selected}
                  onChange={(item) => {
                        o.onChange(item.target.value);
                      }}
                  value={value.selected}
              >
                  {
                  value.options.map((o, i) => {
                    const id = i;
                    return (<option key={id}>{o}</option>);
                  })
                }
                </select>
              </div>
            </div>);
          } else if (o.type === 'separator') {
            return (<div className="separator" key={key}>{o.label}</div>);
          } else if (o.type === 'input') {
            return (<div className="pt-form-group">
              <div className="pt-form-content option-form">
                <div className="field-label">{o.label}</div>
                <input className="pt-input" type={o.inputType ? o.inputType : 'text'} dir="auto" value={o.value} onChange={e => o.onChange(e.target.value)} />
              </div>
            </div>);
          }
          return (
            <div className="option-item-row" key={key}>
              <Tooltip
                content={o.tooltips}
                hoverOpenDelay={1000}
                inline
                intent={Intent.PRIMARY}
                position={Position.TOP}
              >
                <Checkbox
                  checked={o.checked}
                  label={o.label}
                  onChange={() => o.onChange()}
                />
              </Tooltip>
            </div>
          );
        })
      }
    </div>
  );
};

export const AllCollectionOption = ({allCollections, changeAllCollections}) => {
  const options = [
    {
      label: globalString('backup/database/allCollections'),
      onChange: changeAllCollections,
      tooltips: '',
      checked: allCollections
    }
    ];
  return getOptions(options);
};

export const ExportDBOptions = ({ssl, pretty, jsonArray, changeSSL,
                                  changePretty, changeJsonArray, changeNoHeaderLine, noHeaderLine,
                                  query, changeQuery, readPreference, changeReadPreference,
                                  forceTableScan, changeForceTableScan, exportSort, changeExportSort,
  limit, changeLimit, skip, changeSkip, assertExists, changeAssertExists,
                                  changeExportType, exportType, outputFields, changeOutputFields}) => {
  const options = [
    {
      label: globalString('backup/database/ssl'),
      onChange: changeSSL,
      checked: ssl,
      tooltips: '',
    }, {
      label: globalString('backup/database/outputOptions'),
      type: 'separator'
    }, {
      label: 'Type',
      onChange: changeExportType,
      type: 'selection',
      value: exportType,
    }, {
      label: globalString('backup/database/pretty'),
      onChange: changePretty,
      tooltips: '',
      checked: pretty
    }, {
      label: globalString('backup/database/jsonArray'),
      onChange: changeJsonArray,
      tooltips: '',
      checked: jsonArray
    }, {
      label: 'noHeaderLine',
      onChange: changeNoHeaderLine,
      checked: noHeaderLine,
    }, {
      label: globalString('backup/database/fields'),
      type: 'input',
      value: outputFields,
      onChange: changeOutputFields,
    }, {
      label: globalString('backup/database/queryOptions'),
      type: 'separator'
    }, {
      label: 'forceTableScan',
      value: forceTableScan,
      onChange: changeForceTableScan,
    }, {
      label: 'assertExists',
      value: assertExists,
      onChange: changeAssertExists,
    }, {
      label: 'Query',
      type: 'input',
      value: query,
      onChange: changeQuery,
    }, {
      label: 'Read Preference',
      type: 'input',
      value: readPreference,
      onChange: changeReadPreference,
    }, {
      label: globalString('backup/database/skip'),
      type: 'input',
      inputType: 'number',
      value: skip,
      onChange: changeSkip,
    }, {
      label: globalString('backup/database/limit'),
      type: 'input',
      inputType: 'number',
      value: limit,
      onChange: changeLimit,
    }, {
      label: globalString('backup/database/sort'),
      type: 'input',
      value: exportSort,
      onChange: changeExportSort,
    }
  ];
  return getOptions(options);
};

export const ExportCollectionOptions = ({ssl, pretty, jsonArray, changeSSL, changePretty, changeJsonArray}) => {
  const options = [
    {
      id: 1,
      label: globalString('backup/database/ssl'),
      onChange: changeSSL,
      checked: ssl,
      tooltips: '',
    },
    {
      id: 2,
      label: globalString('backup/database/pretty'),
      onChange: changePretty,
      tooltips: '',
      checked: pretty
    },
    {
      id: 3,
      label: globalString('backup/database/jsonArray'),
      onChange: changeJsonArray,
      tooltips: '',
      checked: jsonArray
    }
  ];
  return getOptions(options);
};

export const DumpOptions = ({ssl, changeSSL, gzip, changeGZip, repair, changeRepair,
                              dumpDbUsersAndRoles, changeDumpDbUsersAndRoles,
                              viewsAsCollections, changeViewsAsCollections}) => {
  const options = [
    {
      id: 1,
      label: globalString('backup/database/ssl'),
      onChange: changeSSL,
      tooltips: '',
      checked: ssl,
    }, {
      id: 2,
      label: 'gzip',
      onChange: changeGZip,
      tooltips: '',
      checked: gzip,
    }, {
      id: 3,
      label: globalString('backup/database/repair'),
      onChange: changeRepair,
      tooltips: '',
      checked: repair,
    }, {
      id: 4,
      label: 'dumpDbUsersAndRoles',
      onChange: changeDumpDbUsersAndRoles,
      checked: dumpDbUsersAndRoles,
      tooltips: '',
    }, {
      id: 5,
      label: 'viewsAsCollections',
      checked: viewsAsCollections,
      tooltips: '',
      onChange: changeViewsAsCollections,
    }
  ];
  return getOptions(options);
};

/**
 * the option panel for database export
 * @constructor
 */
export const Options = ({action, ssl, allCollections, pretty, jsonArray, changeSSL, changeAllCollections, changePretty, changeJsonArray}) => {
  if (action === BackupRestoreActions.EXPORT_DATABASE || action === BackupRestoreActions.EXPORT_COLLECTION) {
    return ExportDBOptions({
      ssl,
      allCollections,
      pretty,
      jsonArray,
      changeSSL,
      changeAllCollections,
      changePretty,
      changeJsonArray
    });
  }
  return null;
};

