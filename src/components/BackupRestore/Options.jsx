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

const TooltipDelay = 1000;

const getOptions = (options) => {
  return (
    <div className="options-panel pt-dark">
      {
        options.map((o, i) => {
          const key = i;
          if (o.type === 'selection') {
            const value = o.value;
            return (<div className="option-item-row" key={key}>
              <Tooltip
                content={o.tooltips}
                hoverOpenDelay={TooltipDelay}
                inline
                intent={Intent.PRIMARY}
                position={Position.TOP}
              >
                <div className="label field-label">{o.label}</div>
              </Tooltip>
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
                <Tooltip content={o.tooltips}
                  hoverOpenDelay={TooltipDelay}
                  inline
                  intent={Intent.PRIMARY}
                  position={Position.TOP}>
                  <div className="field-label">{o.label}</div>
                </Tooltip>
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
                hoverOpenDelay={TooltipDelay}
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
      label: action === BackupRestoreActions.DUMP_SERVER || action === BackupRestoreActions.EXPORT_SERVER ? globalString('backuprestore/parameters/allDatabases/label') : globalString('backuprestore/parameters/allCollections/label'),
      onChange: changeAllCollections,
      tooltips: '',
      checked: allCollections
    }
    ];
  return getOptions(options);
};

export const ExportDBOptions = ({pretty, jsonArray,
                                  changePretty, changeJsonArray, changeNoHeaderLine, noHeaderLine,
                                  query, changeQuery, readPreference, changeReadPreference,
                                  forceTableScan, changeForceTableScan, exportSort, changeExportSort,
  limit, changeLimit, skip, changeSkip, assertExists, changeAssertExists,
                                  changeExportType, exportType, outputFields, changeOutputFields}) => {
  const options = [
    {
      label: globalString('backuprestore/parameters/outputOptions/label'),
      type: 'separator'
    }, {
      label: 'Type',
      onChange: changeExportType,
      type: 'selection',
      value: exportType,
    }, {
      label: globalString('backuprestore/parameters/pretty/label'),
      onChange: changePretty,
      tooltips: '',
      checked: pretty
    }, {
      label: globalString('backuprestore/parameters/jsonArray/label'),
      onChange: changeJsonArray,
      tooltips: globalString('backuprestore/parameters/jsonArray/tooltip'),
      checked: jsonArray
    }, {
      label: 'noHeaderLine',
      onChange: changeNoHeaderLine,
      checked: noHeaderLine,
    }, {
      label: globalString('backuprestore/parameters/fields/label'),
      type: 'input',
      value: outputFields,
      onChange: changeOutputFields,
      tooltips: globalString('backuprestore/parameters/fields/tooltip')
    }, {
      label: globalString('backuprestore/parameters/queryOptions/label'),
      type: 'separator'
    }, {
      label: globalString('backuprestore/parameters/forceTableScan/label'),
      value: forceTableScan,
      onChange: changeForceTableScan,
    }, {
      label: globalString('backuprestore/parameters/assertExists/label'),
      value: assertExists,
      onChange: changeAssertExists,
    }, {
      label: globalString('backuprestore/parameters/query/label'),
      type: 'input',
      value: query,
      onChange: changeQuery,
    }, {
      label: globalString('backuprestore/parameters/readPreference/label'),
      type: 'input',
      value: readPreference,
      onChange: changeReadPreference,
    }, {
      label: globalString('backuprestore/parameters/skip/label'),
      type: 'input',
      inputType: 'number',
      value: skip,
      onChange: changeSkip,
    }, {
      label: globalString('backuprestore/parameters/limit/label'),
      type: 'input',
      inputType: 'number',
      value: limit,
      onChange: changeLimit,
    }, {
      label: globalString('backuprestore/parameters/sort/label'),
      type: 'input',
      value: exportSort,
      onChange: changeExportSort,
    }
  ];
  return getOptions(options);
};

export const DumpOptions = ({gzip, changeGZip, repair, changeRepair,
                              dumpDbUsersAndRoles, changeDumpDbUsersAndRoles,
                              numParallelCollections, changeNumParallelCollections,
                              forceTableScan, changeForceTableScan,
                              readPreference, changeReadPreference,
                              query, changeQuery,
                              viewsAsCollections, changeViewsAsCollections}) => {
  const options = [
    {
      label: globalString('backuprestore/parameters/outputOptions/label'),
      type: 'separator',
    }, {
      label: 'gzip',
      onChange: changeGZip,
      tooltips: '',
      checked: gzip,
    }, {
      label: globalString('backuprestore/parameters/repair/label'),
      onChange: changeRepair,
      tooltips: '',
      checked: repair,
    }, {
      label: globalString('backuprestore/parameters/dumpDbUsersAndRoles/label'),
      onChange: changeDumpDbUsersAndRoles,
      checked: dumpDbUsersAndRoles,
      tooltips: '',
    }, {
      label: globalString('backuprestore/parameters/viewsAsCollections/label'),
      checked: viewsAsCollections,
      tooltips: '',
      onChange: changeViewsAsCollections,
    }, {
      label: globalString('backuprestore/parameters/numParallelCollections/label'),
      onChange: changeNumParallelCollections,
      type: 'input',
      inputType: 'number',
      value: numParallelCollections
    }, {
      label: globalString('backuprestore/parameters/queryOptions/label'),
      type: 'separator'
    }, {
      label: globalString('backuprestore/parameters/forceTableScan/label'),
      value: forceTableScan,
      onChange: changeForceTableScan,
    }, {
      label: globalString('backuprestore/parameters/readPreference/label'),
      type: 'input',
      value: readPreference,
      onChange: changeReadPreference,
    }, {
      label: globalString('backuprestore/parameters/query/label'),
      type: 'input',
      value: query,
      onChange: changeQuery,
    }
  ];
  return getOptions(options);
};

export const RestoreOptions = ({drop, changeDrop, dryRun, changeDryRun, writeConcern, changeWriteConcern,
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
      label: globalString('backuprestore/parameters/restoreOptions/label'),
      type: 'separator',
    }, {
      label: globalString('backuprestore/parameters/drop/label'),
      onChange: changeDrop,
      tooltips: '',
      checked: drop,
    }, {
      label: globalString('backuprestore/parameters/dryRun/label'),
      onChange: changeDryRun,
      tooltips: '',
      checked: dryRun,
    }, {
      label: globalString('backuprestore/parameters/writeConcern/label'),
      onChange: changeWriteConcern,
      checked: writeConcern,
      type: 'input',
      tooltips: '',
    }, {
      label: globalString('backuprestore/parameters/noIndexRestore/label'),
      checked: noIndexRestore,
      tooltips: '',
      onChange: changeNoIndexRestore,
    }, {
      label: globalString('backuprestore/parameters/noOptionsRestore/label'),
      onChange: changeNoOptionsRestore,
      value: noOptionsRestore
    }, {
      label: globalString('backuprestore/parameters/keepIndexVersion/label'),
      onChange: changeKeepIndexVersion,
      value: keepIndexVersion
    }, {
      label: globalString('backuprestore/parameters/maintainInsertionOrder/label'),
      onChange: changeMaintainInsertionOrder,
      value: maintainInsertionOrder
    }, {
      label: globalString('backuprestore/parameters/numParallelCollections/label'),
      onChange: changeNumParallelCollections,
      value: numParallelCollections,
      type: 'input',
      inputType: 'number',
    }, {
      label: globalString('backuprestore/parameters/numInsertionWorkers/label'),
      onChange: changeNumInsertionWorkersPerCollection,
      value: numInsertionWorkersPerCollection,
      type: 'input',
      inputType: 'number',
    }, {
      label: globalString('backuprestore/parameters/stopOnError/label'),
      onChange: changeStopOnError,
      value: stopOnError
    }, {
      label: globalString('backuprestore/parameters/bypassDocumentValidation/label'),
      onChange: changeBypassDocumentValidation,
      value: bypassDocumentValidation
    }, {
      label: globalString('backuprestore/parameters/inputOptions/label'),
      type: 'separator'
    }, {
      label: globalString('backuprestore/parameters/objcheck/label'),
      value: objcheck,
      onChange: changeObjcheck,
    }, {
      label: globalString('backuprestore/parameters/oplogReplay/label'),
      type: 'input',
      value: oplogReplay,
      onChange: changeOplogReplay,
    }, {
      label: globalString('backuprestore/parameters/oplogLimit/label'),
      type: 'input',
      value: oplogLimit,
      onChange: changeOplogLimit,
    }, {
      label: globalString('backuprestore/parameters/restoreDbUsersAndRoles/label'),
      value: restoreDbUsersAndRoles,
      onChange: changeRestoreDbUsersAndRoles,
    }, {
      label: globalString('backuprestore/parameters/gzip/label'),
      value: gzip,
      onChange: changeGzip,
    }
  ];
  return getOptions(options);
};

export const ImportOptions = ({outputFields, changeOutputFields, headerLine, changeHeaderLine, jsonArray, changeJsonArray,
                                parseGrace, changeParseGrace, exportType, changeExportType,
                                columnsHaveTypes, changeColumnsHaveTypes,
                                drop, changeDrop, ignoreBlanks, changeIgnoreBlanks,
                                maintainInsertionOrder, changeMaintainInsertionOrder,
                                numInsertionWorkers, changeNumInsertionWorkers,
                                stopOnError, changeStopOnError, mode, changeMode,
                                upsertFields, changeUpsertFields, writeConcern, changeWriteConcern,
                                bypassDocumentValidation, changeBypassDocumentValidation}) => {
  const options = [
    {
      label: globalString('backuprestore/parameters/inputOptions/label'),
      type: 'separator',
    }, {
      label: globalString('backuprestore/parameters/fields/label'),
      type: 'input',
      value: outputFields,
      onChange: changeOutputFields,
    }, {
      label: globalString('backuprestore/parameters/headerLine/label'),
      onChange: changeHeaderLine,
      checked: headerLine,
    }, {
      label: globalString('backuprestore/parameters/jsonArray/label'),
      onChange: changeJsonArray,
      checked: jsonArray,
    }, {
      label: globalString('backuprestore/parameters/parseGrace/label'),
      onChange: changeParseGrace,
      type: 'selection',
      value: parseGrace,
      tooltips: globalString('backuprestore/parameters/parseGrace/tooltip')
    }, {
      label: globalString('backuprestore/parameters/type/label'),
      onChange: changeExportType,
      type: 'selection',
      value: exportType,
    }, {
      label: globalString('backuprestore/parameters/columnsHaveTypes/label'),
      onChange: changeColumnsHaveTypes,
      type: 'input',
      value: columnsHaveTypes,
    }, {
      label: globalString('backuprestore/parameters/ingestOptions/label'),
      type: 'separator',
    }, {
      label: globalString('backuprestore/parameters/drop/label'),
      onChange: changeDrop,
      checked: drop,
    }, {
      label: globalString('backuprestore/parameters/ignoreBlanks/label'),
      onChange: changeIgnoreBlanks,
      checked: ignoreBlanks,
    }, {
      label: globalString('backuprestore/parameters/maintainInsertionOrder/label'),
      onChange: changeMaintainInsertionOrder,
      checked: maintainInsertionOrder,
    }, {
      label: globalString('backuprestore/parameters/numInsertionWorkers/label'),
      type: 'input',
      value: numInsertionWorkers,
      onChange: changeNumInsertionWorkers,
    }, {
      label: globalString('backuprestore/parameters/stopOnError/label'),
      onChange: changeStopOnError,
      checked: stopOnError,
    }, {
      label: globalString('backuprestore/parameters/mode/label'),
      onChange: changeMode,
      type: 'selection',
      value: mode,
    }, {
      label: globalString('backuprestore/parameters/upsertFields/label'),
      type: 'input',
      value: upsertFields,
      onChange: changeUpsertFields,
    }, {
      label: globalString('backuprestore/parameters/writeConcern/label'),
      type: 'input',
      value: writeConcern,
      onChange: changeWriteConcern,
    }, {
      label: globalString('backuprestore/parameters/bypassDocumentValidation/label'),
      onChange: changeBypassDocumentValidation,
      checked: bypassDocumentValidation,
    }
  ];
  return getOptions(options);
};
