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
import {Checkbox, Intent, Position, Tooltip, NumericInput} from '@blueprintjs/core';

import {BackupRestoreActions} from '../common/Constants';
import './Options.scss';

const getOptions = (options) => {
  return (
    <div className="options-panel pt-dark">
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
            return (<div className="pt-form-group" key={key}>
              <div className="pt-form-content option-form">
                <div className="field-label">{o.label}</div>
                {
                  (!o.inputType || o.inputType === 'text')
                    && <input className="pt-input" type={o.inputType ? o.inputType : 'text'} dir="auto" value={o.value} onChange={e => o.onChange(e.target.value)} />
                }
                {
                  o.inputType === 'number'
                    && <NumericInput className="pt-tooltip-indicator number-input" value={o.value} onValueChange={e => o.onChange(e)} />
                }
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

export const AllCollectionOption = ({allCollections, changeAllCollections, action}) => {
  const options = [
    {
      label: action === BackupRestoreActions.DUMP_SERVER || action === BackupRestoreActions.EXPORT_SERVER ? globalString('backup/database/allDatabases') : globalString('backup/database/allCollections'),
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

export const DumpOptions = ({ssl, changeSSL, gzip, changeGZip, repair, changeRepair,
                              dumpDbUsersAndRoles, changeDumpDbUsersAndRoles,
                              numParallelCollections, changeNumParallelCollections,
                              forceTableScan, changeForceTableScan,
                              readPreference, changeReadPreference,
                              query, changeQuery,
                              viewsAsCollections, changeViewsAsCollections}) => {
  const options = [
    {
      label: globalString('backup/database/ssl'),
      onChange: changeSSL,
      tooltips: '',
      checked: ssl,
    }, {
      label: globalString('backup/database/outputOptions'),
      type: 'separator',
    }, {
      label: 'gzip',
      onChange: changeGZip,
      tooltips: '',
      checked: gzip,
    }, {
      label: globalString('backup/database/repair'),
      onChange: changeRepair,
      tooltips: '',
      checked: repair,
    }, {
      label: 'dumpDbUsersAndRoles',
      onChange: changeDumpDbUsersAndRoles,
      checked: dumpDbUsersAndRoles,
      tooltips: '',
    }, {
      label: 'viewsAsCollections',
      checked: viewsAsCollections,
      tooltips: '',
      onChange: changeViewsAsCollections,
    }, {
      label: 'numParallelCollections',
      onChange: changeNumParallelCollections,
      type: 'input',
      inputType: 'number',
      value: numParallelCollections
    }, {
      label: globalString('backup/database/queryOptions'),
      type: 'separator'
    }, {
      label: 'forceTableScan',
      value: forceTableScan,
      onChange: changeForceTableScan,
    }, {
      label: 'Read Preference',
      type: 'input',
      value: readPreference,
      onChange: changeReadPreference,
    }, {
      label: 'Query',
      type: 'input',
      value: query,
      onChange: changeQuery,
    }
  ];
  return getOptions(options);
};

export const restoreOptions = ({ssl, changeSSL, drop, changeDrop, dryRun, changeDryRun, writeConcern, changeWriteConcern,
              noIndexRestore, changeNoIndexRestore, noOptionsRestore, changeNoOptionsRestore,
              keepIndexVersion, changeKeepIndexVersion, maintainInsertionOrder, changeMaintainInsertionOrder,
              numParallelCollections, changeNumParallelCollections,
              numInsertionWorkersPerCollection, changeNumInsertionWorkersPerCollection,
              stopOnError, changeStopOnError, bypassDocumentValidation, changeBypassDocumentValidation,
              objcheck, changeObjcheck, oplogReplay, changeOplogReplay,
              oplogLimit, changeOplogLimit, restoreDbUsersAndRoles, changeRestoreDbUsersAndRoles,
              gzip, changeGzip}) => {
  const options = [
    {
      label: globalString('backup/database/ssl'),
      onChange: changeSSL,
      tooltips: '',
      checked: ssl,
    }, {
      label: globalString('backup/database/restoreOptions'),
      type: 'separator',
    }, {
      label: 'drop',
      onChange: changeDrop,
      tooltips: '',
      checked: drop,
    }, {
      label: 'dryRun',
      onChange: changeDryRun,
      tooltips: '',
      checked: dryRun,
    }, {
      label: 'writeConcern',
      onChange: changeWriteConcern,
      checked: writeConcern,
      type: 'input',
      tooltips: '',
    }, {
      label: 'noIndexRestore',
      checked: noIndexRestore,
      tooltips: '',
      onChange: changeNoIndexRestore,
    }, {
      label: 'noOptionsRestore',
      onChange: changeNoOptionsRestore,
      value: noOptionsRestore
    }, {
      label: 'keepIndexVersion',
      onChange: changeKeepIndexVersion,
      value: keepIndexVersion
    }, {
      label: 'maintainInsertionOrder',
      onChange: changeMaintainInsertionOrder,
      value: maintainInsertionOrder
    }, {
      label: 'numParallelCollections',
      onChange: changeNumParallelCollections,
      value: numParallelCollections,
      type: 'input',
      inputType: 'number',
    }, {
      label: 'numInsertionWorkersPerCollection',
      onChange: changeNumInsertionWorkersPerCollection,
      value: numInsertionWorkersPerCollection,
      type: 'input',
      inputType: 'number',
    }, {
      label: 'stopOnError',
      onChange: changeStopOnError,
      value: stopOnError
    }, {
      label: 'bypassDocumentValidation',
      onChange: changeBypassDocumentValidation,
      value: bypassDocumentValidation
    }, {
      label: globalString('backup/database/inputOptions'),
      type: 'separator'
    }, {
      label: 'objcheck',
      value: objcheck,
      onChange: changeObjcheck,
    }, {
      label: 'oplogReplay',
      type: 'input',
      value: oplogReplay,
      onChange: changeOplogReplay,
    }, {
      label: 'oplogLimit',
      type: 'input',
      value: oplogLimit,
      onChange: changeOplogLimit,
    }, {
      label: 'restoreDbUsersAndRoles',
      value: restoreDbUsersAndRoles,
      onChange: changeRestoreDbUsersAndRoles,
    }, {
      label: 'gzip',
      value: gzip,
      onChange: changeGzip,
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

