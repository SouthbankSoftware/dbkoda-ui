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
      label: action === BackupRestoreActions.DUMP_SERVER || action === BackupRestoreActions.EXPORT_SERVER ? globalString('backup/database/allDatabases') : globalString('backup/database/allCollections'),
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
      tooltips: globalString('backup/tooltips/jsonArray'),
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
      tooltips: globalString('backup/tooltips/fields')
    }, {
      label: globalString('backup/database/queryOptions'),
      type: 'separator'
    }, {
      label: globalString('backup/database/forceTableScan'),
      value: forceTableScan,
      onChange: changeForceTableScan,
    }, {
      label: globalString('backup/database/assertExists'),
      value: assertExists,
      onChange: changeAssertExists,
    }, {
      label: globalString('backup/database/query'),
      type: 'input',
      value: query,
      onChange: changeQuery,
    }, {
      label: globalString('backup/database/readPreference'),
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

export const DumpOptions = ({gzip, changeGZip, repair, changeRepair,
                              dumpDbUsersAndRoles, changeDumpDbUsersAndRoles,
                              numParallelCollections, changeNumParallelCollections,
                              forceTableScan, changeForceTableScan,
                              readPreference, changeReadPreference,
                              query, changeQuery,
                              viewsAsCollections, changeViewsAsCollections}) => {
  const options = [
    {
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
      label: globalString('backup/database/dumpDbUsersAndRoles'),
      onChange: changeDumpDbUsersAndRoles,
      checked: dumpDbUsersAndRoles,
      tooltips: '',
    }, {
      label: globalString('backup/database/viewsAsCollections'),
      checked: viewsAsCollections,
      tooltips: '',
      onChange: changeViewsAsCollections,
    }, {
      label: globalString('backup/database/numParallelCollections'),
      onChange: changeNumParallelCollections,
      type: 'input',
      inputType: 'number',
      value: numParallelCollections
    }, {
      label: globalString('backup/database/queryOptions'),
      type: 'separator'
    }, {
      label: globalString('backup/database/forceTableScan'),
      value: forceTableScan,
      onChange: changeForceTableScan,
    }, {
      label: globalString('backup/database/readPreference'),
      type: 'input',
      value: readPreference,
      onChange: changeReadPreference,
    }, {
      label: globalString('backup/database/query'),
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
      label: globalString('backup/database/restoreOptions'),
      type: 'separator',
    }, {
      label: globalString('backup/database/drop'),
      onChange: changeDrop,
      tooltips: '',
      checked: drop,
    }, {
      label: globalString('backup/database/dryRun'),
      onChange: changeDryRun,
      tooltips: '',
      checked: dryRun,
    }, {
      label: globalString('backup/database/writeConcern'),
      onChange: changeWriteConcern,
      checked: writeConcern,
      type: 'input',
      tooltips: '',
    }, {
      label: globalString('backup/database/noIndexRestore'),
      checked: noIndexRestore,
      tooltips: '',
      onChange: changeNoIndexRestore,
    }, {
      label: globalString('backup/database/noOptionsRestore'),
      onChange: changeNoOptionsRestore,
      value: noOptionsRestore
    }, {
      label: globalString('backup/database/keepIndexVersion'),
      onChange: changeKeepIndexVersion,
      value: keepIndexVersion
    }, {
      label: globalString('backup/database/maintainInsertionOrder'),
      onChange: changeMaintainInsertionOrder,
      value: maintainInsertionOrder
    }, {
      label: globalString('backup/database/numParallelCollections'),
      onChange: changeNumParallelCollections,
      value: numParallelCollections,
      type: 'input',
      inputType: 'number',
    }, {
      label: globalString('backup/database/numInsertionWorkers'),
      onChange: changeNumInsertionWorkersPerCollection,
      value: numInsertionWorkersPerCollection,
      type: 'input',
      inputType: 'number',
    }, {
      label: globalString('backup/database/stopOnError'),
      onChange: changeStopOnError,
      value: stopOnError
    }, {
      label: globalString('backup/database/bypassDocumentValidation'),
      onChange: changeBypassDocumentValidation,
      value: bypassDocumentValidation
    }, {
      label: globalString('backup/database/inputOptions'),
      type: 'separator'
    }, {
      label: globalString('backup/database/objcheck'),
      value: objcheck,
      onChange: changeObjcheck,
    }, {
      label: globalString('backup/database/oplogReplay'),
      type: 'input',
      value: oplogReplay,
      onChange: changeOplogReplay,
    }, {
      label: globalString('backup/database/oplogLimit'),
      type: 'input',
      value: oplogLimit,
      onChange: changeOplogLimit,
    }, {
      label: globalString('backup/database/restoreDbUsersAndRoles'),
      value: restoreDbUsersAndRoles,
      onChange: changeRestoreDbUsersAndRoles,
    }, {
      label: globalString('backup/database/gzip'),
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
      label: globalString('backup/database/inputOptions'),
      type: 'separator',
    }, {
      label: globalString('backup/database/fields'),
      type: 'input',
      value: outputFields,
      onChange: changeOutputFields,
    }, {
      label: globalString('backup/database/headerLine'),
      onChange: changeHeaderLine,
      checked: headerLine,
    }, {
      label: globalString('backup/database/jsonArray'),
      onChange: changeJsonArray,
      checked: jsonArray,
    }, {
      label: globalString('backup/database/parseGrace'),
      onChange: changeParseGrace,
      type: 'selection',
      value: parseGrace,
      tooltips: globalString('backup/tooltips/parseGrace')
    }, {
      label: globalString('backup/database/type'),
      onChange: changeExportType,
      type: 'selection',
      value: exportType,
    }, {
      label: globalString('backup/database/columnsHaveTypes'),
      onChange: changeColumnsHaveTypes,
      type: 'input',
      value: columnsHaveTypes,
    }, {
      label: globalString('backup/database/ingestOptions'),
      type: 'separator',
    }, {
      label: globalString('backup/database/drop'),
      onChange: changeDrop,
      checked: drop,
    }, {
      label: globalString('backup/database/ignoreBlanks'),
      onChange: changeIgnoreBlanks,
      checked: ignoreBlanks,
    }, {
      label: globalString('backup/database/maintainInsertionOrder'),
      onChange: changeMaintainInsertionOrder,
      checked: maintainInsertionOrder,
    }, {
      label: globalString('backup/database/numInsertionWorkers'),
      type: 'input',
      value: numInsertionWorkers,
      onChange: changeNumInsertionWorkers,
    }, {
      label: globalString('backup/database/stopOnError'),
      onChange: changeStopOnError,
      checked: stopOnError,
    }, {
      label: globalString('backup/database/mode'),
      onChange: changeMode,
      type: 'selection',
      value: mode,
    }, {
      label: globalString('backup/database/upsertFields'),
      type: 'input',
      value: upsertFields,
      onChange: changeUpsertFields,
    }, {
      label: globalString('backup/database/writeConcern'),
      type: 'input',
      value: writeConcern,
      onChange: changeWriteConcern,
    }, {
      label: globalString('backup/database/bypassDocumentValidation'),
      onChange: changeBypassDocumentValidation,
      checked: bypassDocumentValidation,
    }
  ];
  return getOptions(options);
};
