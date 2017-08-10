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
      label: globalString('backuprestore/parameters/noHeaderLine/label'),
      onChange: changeNoHeaderLine,
      checked: noHeaderLine,
      tooltips: globalString('backuprestore/parameters/noHeaderLine/tooltip')
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
      tooltips: globalString('backuprestore/parameters/forceTableScan/tooltip'),
    }, {
      label: globalString('backuprestore/parameters/assertExists/label'),
      value: assertExists,
      onChange: changeAssertExists,
      tooltips: globalString('backuprestore/parameters/assertExists/tooltip'),
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
      tooltips: globalString('backuprestore/parameters/readPreference/tooltip'),
    }, {
      label: globalString('backuprestore/parameters/skip/label'),
      type: 'input',
      inputType: 'number',
      value: skip,
      onChange: changeSkip,
      tooltips: globalString('backuprestore/parameters/skip/tooltip'),
    }, {
      label: globalString('backuprestore/parameters/limit/label'),
      type: 'input',
      inputType: 'number',
      value: limit,
      onChange: changeLimit,
      tooltips: globalString('backuprestore/parameters/limit/tooltip'),
    }, {
      label: globalString('backuprestore/parameters/sort/label'),
      type: 'input',
      value: exportSort,
      onChange: changeExportSort,
      tooltips: globalString('backuprestore/parameters/sort/tooltip'),
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
      label: globalString('backuprestore/parameters/gzip/label'),
      tooltips: globalString('backuprestore/parameters/gzip/tooltip'),
      onChange: changeGZip,
      checked: gzip,
    }, {
      label: globalString('backuprestore/parameters/repair/label'),
      onChange: changeRepair,
      tooltips: globalString('backuprestore/parameters/repair/tooltip'),
      checked: repair,
    }, {
      label: globalString('backuprestore/parameters/dumpDbUsersAndRoles/label'),
      onChange: changeDumpDbUsersAndRoles,
      checked: dumpDbUsersAndRoles,
      tooltips: globalString('backuprestore/parameters/dumpDbUsersAndRoles/tooltip'),
    }, {
      label: globalString('backuprestore/parameters/viewsAsCollections/label'),
      checked: viewsAsCollections,
      tooltips: globalString('backuprestore/parameters/viewsAsCollections/tooltip'),
      onChange: changeViewsAsCollections,
    }, {
      label: globalString('backuprestore/parameters/numParallelCollections/label'),
      tooltips: globalString('backuprestore/parameters/numParallelCollections/tooltip'),
      onChange: changeNumParallelCollections,
      type: 'input',
      inputType: 'number',
      value: numParallelCollections
    }, {
      label: globalString('backuprestore/parameters/queryOptions/label'),
      type: 'separator'
    }, {
      label: globalString('backuprestore/parameters/forceTableScan/label'),
      tooltips: globalString('backuprestore/parameters/forceTableScan/tooltip'),
      value: forceTableScan,
      onChange: changeForceTableScan,
    }, {
      label: globalString('backuprestore/parameters/readPreference/label'),
      tooltips: globalString('backuprestore/parameters/readPreference/tooltip'),
      type: 'input',
      value: readPreference,
      onChange: changeReadPreference,
    }, {
      label: globalString('backuprestore/parameters/query/label'),
      tooltips: globalString('backuprestore/parameters/query/tooltip'),
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
      tooltips: globalString('backuprestore/parameters/drop/tooltip'),
      checked: drop,
    }, {
      label: globalString('backuprestore/parameters/dryRun/label'),
      onChange: changeDryRun,
      tooltips: globalString('backuprestore/parameters/dryRun/tooltip'),
      checked: dryRun,
    }, {
      label: globalString('backuprestore/parameters/writeConcern/label'),
      onChange: changeWriteConcern,
      checked: writeConcern,
      type: 'input',
      tooltips: globalString('backuprestore/parameters/writeConcern/tooltip'),
    }, {
      label: globalString('backuprestore/parameters/noIndexRestore/label'),
      checked: noIndexRestore,
      tooltips: globalString('backuprestore/parameters/noIndexRestore/tooltip'),
      onChange: changeNoIndexRestore,
    }, {
      label: globalString('backuprestore/parameters/noOptionsRestore/label'),
      onChange: changeNoOptionsRestore,
      value: noOptionsRestore,
      tooltips: globalString('backuprestore/parameters/noOptionsRestore/tooltip'),
    }, {
      label: globalString('backuprestore/parameters/keepIndexVersion/label'),
      tooltips: globalString('backuprestore/parameters/keepIndexVersion/tooltip'),
      onChange: changeKeepIndexVersion,
      value: keepIndexVersion
    }, {
      label: globalString('backuprestore/parameters/maintainInsertionOrder/label'),
      tooltips: globalString('backuprestore/parameters/maintainInsertionOrder/tooltip'),
      onChange: changeMaintainInsertionOrder,
      value: maintainInsertionOrder
    }, {
      label: globalString('backuprestore/parameters/numParallelCollections/label'),
      tooltips: globalString('backuprestore/parameters/numParallelCollections/tooltip'),
      onChange: changeNumParallelCollections,
      value: numParallelCollections,
      type: 'input',
      inputType: 'number',
    }, {
      label: globalString('backuprestore/parameters/numInsertionWorkers/label'),
      tooltips: globalString('backuprestore/parameters/numInsertionWorkers/tooltip'),
      onChange: changeNumInsertionWorkersPerCollection,
      value: numInsertionWorkersPerCollection,
      type: 'input',
      inputType: 'number',
    }, {
      label: globalString('backuprestore/parameters/stopOnError/label'),
      tooltips: globalString('backuprestore/parameters/stopOnError/tooltip'),
      onChange: changeStopOnError,
      value: stopOnError
    }, {
      label: globalString('backuprestore/parameters/bypassDocumentValidation/label'),
      tooltips: globalString('backuprestore/parameters/bypassDocumentValidation/tooltip'),
      onChange: changeBypassDocumentValidation,
      value: bypassDocumentValidation
    }, {
      label: globalString('backuprestore/parameters/inputOptions/label'),
      type: 'separator'
    }, {
      label: globalString('backuprestore/parameters/objcheck/label'),
      tooltips: globalString('backuprestore/parameters/objcheck/tooltip'),
      value: objcheck,
      onChange: changeObjcheck,
    }, {
      label: globalString('backuprestore/parameters/oplogReplay/label'),
      tooltips: globalString('backuprestore/parameters/oplogReplay/tooltip'),
      value: oplogReplay,
      onChange: changeOplogReplay,
    }, {
      label: globalString('backuprestore/parameters/oplogLimit/label'),
      tooltips: globalString('backuprestore/parameters/oplogLimit/tooltip'),
      type: 'input',
      value: oplogLimit,
      onChange: changeOplogLimit,
    }, {
      label: globalString('backuprestore/parameters/restoreDbUsersAndRoles/label'),
      tooltips: globalString('backuprestore/parameters/restoreDbUsersAndRoles/tooltip'),
      value: restoreDbUsersAndRoles,
      onChange: changeRestoreDbUsersAndRoles,
    }, {
      label: globalString('backuprestore/parameters/gzip/label'),
      tooltips: globalString('backuprestore/parameters/gzip/tooltip'),
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
      tooltips: globalString('backuprestore/parameters/fields/tooltip'),
      type: 'input',
      value: outputFields,
      onChange: changeOutputFields,
    }, {
      label: globalString('backuprestore/parameters/headerLine/label'),
      tooltips: globalString('backuprestore/parameters/headerLine/tooltip'),
      onChange: changeHeaderLine,
      checked: headerLine,
    }, {
      label: globalString('backuprestore/parameters/jsonArray/label'),
      tooltips: globalString('backuprestore/parameters/jsonArray/tooltip'),
      onChange: changeJsonArray,
      checked: jsonArray,
    }, {
      label: globalString('backuprestore/parameters/parseGrace/label'),
      tooltips: globalString('backuprestore/parameters/parseGrace/tooltip'),
      onChange: changeParseGrace,
      type: 'selection',
      value: parseGrace,
    }, {
      label: globalString('backuprestore/parameters/type/label'),
      tooltips: globalString('backuprestore/parameters/type/tooltip'),
      onChange: changeExportType,
      type: 'selection',
      value: exportType,
    }, {
      label: globalString('backuprestore/parameters/columnsHaveTypes/label'),
      tooltips: globalString('backuprestore/parameters/columnsHaveTypes/tooltip'),
      onChange: changeColumnsHaveTypes,
      type: 'input',
      value: columnsHaveTypes,
    }, {
      label: globalString('backuprestore/parameters/ingestOptions/label'),
      type: 'separator',
    }, {
      label: globalString('backuprestore/parameters/drop/label'),
      tooltips: globalString('backuprestore/parameters/drop/tooltip'),
      onChange: changeDrop,
      checked: drop,
    }, {
      label: globalString('backuprestore/parameters/ignoreBlanks/label'),
      tooltips: globalString('backuprestore/parameters/ignoreBlanks/tooltip'),
      onChange: changeIgnoreBlanks,
      checked: ignoreBlanks,
    }, {
      label: globalString('backuprestore/parameters/maintainInsertionOrder/label'),
      tooltips: globalString('backuprestore/parameters/maintainInsertionOrder/tooltip'),
      onChange: changeMaintainInsertionOrder,
      checked: maintainInsertionOrder,
    }, {
      label: globalString('backuprestore/parameters/numInsertionWorkers/label'),
      tooltips: globalString('backuprestore/parameters/numInsertionWorkers/tooltip'),
      type: 'input',
      value: numInsertionWorkers,
      onChange: changeNumInsertionWorkers,
    }, {
      label: globalString('backuprestore/parameters/stopOnError/label'),
      tooltips: globalString('backuprestore/parameters/stopOnError/tooltip'),
      onChange: changeStopOnError,
      checked: stopOnError,
    }, {
      label: globalString('backuprestore/parameters/mode/label'),
      tooltips: globalString('backuprestore/parameters/mode/tooltip'),
      onChange: changeMode,
      type: 'selection',
      value: mode,
    }, {
      label: globalString('backuprestore/parameters/upsertFields/label'),
      tooltips: globalString('backuprestore/parameters/upsertFields/tooltip'),
      type: 'input',
      value: upsertFields,
      onChange: changeUpsertFields,
    }, {
      label: globalString('backuprestore/parameters/writeConcern/label'),
      tooltips: globalString('backuprestore/parameters/writeConcern/tooltip'),
      type: 'input',
      value: writeConcern,
      onChange: changeWriteConcern,
    }, {
      label: globalString('backuprestore/parameters/bypassDocumentValidation/label'),
      tooltips: globalString('backuprestore/parameters/bypassDocumentValidation/tooltip'),
      onChange: changeBypassDocumentValidation,
      checked: bypassDocumentValidation,
    }
  ];
  return getOptions(options);
};
