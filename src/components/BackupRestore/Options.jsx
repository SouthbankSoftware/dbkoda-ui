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
import _ from 'lodash';
import { Checkbox, Intent, Position, Tooltip, NumericInput } from '@blueprintjs/core';

import { BackupRestoreActions } from '../common/Constants';
import './Options.scss';

const TooltipDelay = 1000;
const HoverCloseDelay = 10;

const getOptions = options => {
  const filterOptions = _.filter(options, o => !o.hide);
  return (
    <div className="options-panel pt-dark">
      {filterOptions.map((o, i) => {
        const key = i;
        if (o.type === 'selection') {
          const value = o.value;
          return (
            <div className="option-item-row" key={key}>
              <Tooltip
                className="parameter-tooltip"
                content={o.tooltips}
                hoverOpenDelay={TooltipDelay}
                inline
                intent={Intent.PRIMARY}
                position={Position.TOP}
                hoverCloseDelay={HoverCloseDelay}
              >
                <div className="label field-label">{o.label}</div>
              </Tooltip>
              <div className="pt-select">
                <select
                  className={`select db-backup-${o.name}`}
                  defaultValue={value.selected}
                  onChange={item => {
                    o.onChange(item.target.value);
                  }}
                  value={value.selected}
                >
                  {value.options.map((o, i) => {
                    const id = i;
                    return <option key={id}>{o}</option>;
                  })}
                </select>
              </div>
            </div>
          );
        } else if (o.type === 'separator') {
          return (
            <div className="separator" key={key}>
              {o.label}
            </div>
          );
        } else if (o.type === 'input') {
          return (
            <div className="pt-form-group" key={key}>
              <div className="pt-form-content option-form">
                <Tooltip
                  content={o.tooltips}
                  className="parameter-tooltip"
                  hoverOpenDelay={TooltipDelay}
                  inline
                  intent={Intent.PRIMARY}
                  hoverCloseDelay={HoverCloseDelay}
                  position={Position.TOP}
                >
                  <div className="field-label">{o.label}</div>
                </Tooltip>
                {(!o.inputType || o.inputType === 'text') && (
                  <input
                    className={`pt-input db-backup-${o.name}`}
                    type={o.inputType ? o.inputType : 'text'}
                    dir="auto"
                    value={o.value}
                    onChange={e => o.onChange(e.target.value)}
                  />
                )}
                {o.inputType === 'number' && (
                  <NumericInput
                    className={`pt-tooltip-indicator number-input db-backup-${o.name}`}
                    value={o.value}
                    onValueChange={e => o.onChange(e)}
                  />
                )}
              </div>
            </div>
          );
        }
        return (
          <div className="option-item-row pt-form-group" key={key}>
            <Tooltip
              className="parameter-tooltip"
              content={o.tooltips}
              hoverOpenDelay={TooltipDelay}
              inline
              intent={Intent.PRIMARY}
              position={Position.TOP}
              hoverCloseDelay={HoverCloseDelay}
            >
              <Checkbox
                checked={o.checked}
                label={o.label}
                className={`db-backup-${o.name}`}
                onChange={() => o.onChange()}
              />
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
};

export const AllCollectionOption = ({ allCollections, changeAllCollections, action }) => {
  const options = [
    {
      label:
        action === BackupRestoreActions.DUMP_SERVER || action === BackupRestoreActions.EXPORT_SERVER
          ? globalString('backuprestore/parameters/allDatabases/label')
          : globalString('backuprestore/parameters/allCollections/label'),
      onChange: changeAllCollections,
      tooltips: '',
      checked: allCollections,
      name: 'all-collections'
    }
  ];
  return getOptions(options);
};

export const ExportDBOptions = ({
  pretty,
  jsonArray,
  changePretty,
  changeJsonArray,
  changeNoHeaderLine,
  noHeaderLine,
  query,
  changeQuery,
  readPreference,
  changeReadPreference,
  forceTableScan,
  changeForceTableScan,
  exportSort,
  changeExportSort,
  limit,
  changeLimit,
  skip,
  changeSkip,
  assertExists,
  changeAssertExists,
  changeExportType,
  exportType,
  outputFields,
  changeOutputFields
}) => {
  const options = [
    {
      label: globalString('backuprestore/parameters/outputOptions/label'),
      type: 'separator'
    },
    {
      label: 'Type',
      onChange: changeExportType,
      type: 'selection',
      value: exportType,
      name: 'type'
    },
    {
      label: globalString('backuprestore/parameters/pretty/label'),
      onChange: changePretty,
      tooltips: '',
      checked: pretty,
      name: 'pretty'
    },
    {
      label: globalString('backuprestore/parameters/jsonArray/label'),
      onChange: changeJsonArray,
      tooltips: globalString('backuprestore/parameters/jsonArray/tooltip'),
      checked: jsonArray,
      name: 'json-array'
    },
    {
      label: globalString('backuprestore/parameters/noHeaderLine/label'),
      onChange: changeNoHeaderLine,
      checked: noHeaderLine,
      tooltips: globalString('backuprestore/parameters/noHeaderLine/tooltip'),
      name: 'no-header-line'
    },
    {
      label: globalString('backuprestore/parameters/fields/label'),
      type: 'input',
      value: outputFields,
      onChange: changeOutputFields,
      name: 'output-fields',
      tooltips: globalString('backuprestore/parameters/fields/tooltip')
    },
    {
      label: globalString('backuprestore/parameters/queryOptions/label'),
      type: 'separator'
    },
    {
      label: globalString('backuprestore/parameters/forceTableScan/label'),
      value: forceTableScan,
      onChange: changeForceTableScan,
      tooltips: globalString('backuprestore/parameters/forceTableScan/tooltip'),
      name: 'force-table-scan'
    },
    {
      label: globalString('backuprestore/parameters/assertExists/label'),
      value: assertExists,
      onChange: changeAssertExists,
      tooltips: globalString('backuprestore/parameters/assertExists/tooltip'),
      name: 'assert-exists'
    },
    {
      label: globalString('backuprestore/parameters/query/label'),
      type: 'input',
      value: query,
      onChange: changeQuery,
      name: 'query'
    },
    {
      label: globalString('backuprestore/parameters/readPreference/label'),
      type: 'input',
      value: readPreference,
      onChange: changeReadPreference,
      tooltips: globalString('backuprestore/parameters/readPreference/tooltip'),
      name: 'read-preference'
    },
    {
      label: globalString('backuprestore/parameters/skip/label'),
      type: 'input',
      inputType: 'number',
      value: skip,
      onChange: changeSkip,
      tooltips: globalString('backuprestore/parameters/skip/tooltip'),
      name: 'skip'
    },
    {
      label: globalString('backuprestore/parameters/limit/label'),
      type: 'input',
      inputType: 'number',
      value: limit,
      onChange: changeLimit,
      tooltips: globalString('backuprestore/parameters/limit/tooltip'),
      name: 'limit'
    },
    {
      label: globalString('backuprestore/parameters/sort/label'),
      type: 'input',
      value: exportSort,
      onChange: changeExportSort,
      tooltips: globalString('backuprestore/parameters/sort/tooltip'),
      name: 'export-sort'
    }
  ];
  return getOptions(options);
};

export const DumpOptions = ({
  gzip,
  archive,
  changeArchive,
  changeGZip,
  repair,
  changeRepair,
  dumpDbUsersAndRoles,
  changeDumpDbUsersAndRoles,
  numParallelCollections,
  changeNumParallelCollections,
  forceTableScan,
  changeForceTableScan,
  readPreference,
  changeReadPreference,
  query,
  changeQuery,
  viewsAsCollections,
  changeViewsAsCollections
}) => {
  const options = [
    {
      label: globalString('backuprestore/parameters/outputOptions/label'),
      type: 'separator'
    },
    {
      label: globalString('backuprestore/parameters/gzip/label'),
      tooltips: globalString('backuprestore/parameters/gzip/tooltip'),
      onChange: changeGZip,
      checked: gzip,
      name: 'gzip'
    },
    {
      label: globalString('backuprestore/parameters/archive/label'),
      tooltips: globalString('backuprestore/parameters/archive/tooltip'),
      onChange: changeArchive,
      checked: archive,
      name: 'archive'
    },
    {
      label: globalString('backuprestore/parameters/repair/label'),
      onChange: changeRepair,
      tooltips: globalString('backuprestore/parameters/repair/tooltip'),
      checked: repair,
      name: 'repair'
    },
    {
      label: globalString('backuprestore/parameters/dumpDbUsersAndRoles/label'),
      onChange: changeDumpDbUsersAndRoles,
      checked: dumpDbUsersAndRoles,
      tooltips: globalString('backuprestore/parameters/dumpDbUsersAndRoles/tooltip'),
      name: 'dump-db-users-and-roles'
    },
    {
      label: globalString('backuprestore/parameters/viewsAsCollections/label'),
      checked: viewsAsCollections,
      tooltips: globalString('backuprestore/parameters/viewsAsCollections/tooltip'),
      onChange: changeViewsAsCollections,
      name: 'views-as-collections'
    },
    {
      label: globalString('backuprestore/parameters/numParallelCollections/label'),
      tooltips: globalString('backuprestore/parameters/numParallelCollections/tooltip'),
      onChange: changeNumParallelCollections,
      type: 'input',
      inputType: 'number',
      value: numParallelCollections,
      name: 'num-parallel-collections'
    },
    {
      label: globalString('backuprestore/parameters/queryOptions/label'),
      type: 'separator'
    },
    {
      label: globalString('backuprestore/parameters/forceTableScan/label'),
      tooltips: globalString('backuprestore/parameters/forceTableScan/tooltip'),
      value: forceTableScan,
      onChange: changeForceTableScan,
      name: 'force-table-scan'
    },
    {
      label: globalString('backuprestore/parameters/readPreference/label'),
      tooltips: globalString('backuprestore/parameters/readPreference/tooltip'),
      type: 'input',
      value: readPreference,
      onChange: changeReadPreference,
      name: 'read-preference'
    },
    {
      label: globalString('backuprestore/parameters/query/label'),
      tooltips: globalString('backuprestore/parameters/query/tooltip'),
      type: 'input',
      value: query,
      onChange: changeQuery,
      name: 'query'
    }
  ];
  return getOptions(options);
};

export const RestoreOptions = ({
  drop,
  changeDrop,
  dryRun,
  changeDryRun,
  writeConcern,
  changeWriteConcern,
  noIndexRestore,
  changeNoIndexRestore,
  noOptionsRestore,
  changeNoOptionsRestore,
  keepIndexVersion,
  changeKeepIndexVersion,
  maintainInsertionOrder,
  changeMaintainInsertionOrder,
  numParallelCollections,
  changeNumParallelCollections,
  numInsertionWorkersPerCollection,
  changeNumInsertionWorkersPerCollection,
  stopOnError,
  changeStopOnError,
  bypassDocumentValidation,
  changeBypassDocumentValidation,
  objcheck,
  changeObjcheck,
  oplogReplay,
  changeOplogReplay,
  oplogLimit,
  changeOplogLimit,
  restoreDbUsersAndRoles,
  sslAllowInvalidCertificates,
  changeSslAllowInvalidCertificates,
  changeRestoreDbUsersAndRoles,
  gzip,
  changeGzip,
  archive,
  changeArchive
}) => {
  const options = [
    {
      label: globalString('backuprestore/parameters/restoreOptions/label'),
      type: 'separator',
      name: 'separator'
    },
    {
      label: globalString('backuprestore/parameters/drop/label'),
      onChange: changeDrop,
      tooltips: globalString('backuprestore/parameters/drop/tooltip'),
      checked: drop,
      name: 'drop'
    },
    {
      label: globalString('backuprestore/parameters/dryRun/label'),
      onChange: changeDryRun,
      tooltips: globalString('backuprestore/parameters/dryRun/tooltip'),
      checked: dryRun,
      name: 'dry-run'
    },
    {
      label: globalString('backuprestore/parameters/writeConcern/label'),
      onChange: changeWriteConcern,
      checked: writeConcern,
      type: 'input',
      name: 'write-concern',
      tooltips: globalString('backuprestore/parameters/writeConcern/tooltip')
    },
    {
      label: globalString('backuprestore/parameters/noIndexRestore/label'),
      checked: noIndexRestore,
      name: 'no-index-restore',
      tooltips: globalString('backuprestore/parameters/noIndexRestore/tooltip'),
      onChange: changeNoIndexRestore
    },
    {
      label: globalString('backuprestore/parameters/noOptionsRestore/label'),
      onChange: changeNoOptionsRestore,
      value: noOptionsRestore,
      name: 'no-options-restore',
      tooltips: globalString('backuprestore/parameters/noOptionsRestore/tooltip')
    },
    {
      label: globalString('backuprestore/parameters/keepIndexVersion/label'),
      tooltips: globalString('backuprestore/parameters/keepIndexVersion/tooltip'),
      onChange: changeKeepIndexVersion,
      value: keepIndexVersion,
      name: 'keep-index-version'
    },
    {
      label: globalString('backuprestore/parameters/maintainInsertionOrder/label'),
      tooltips: globalString('backuprestore/parameters/maintainInsertionOrder/tooltip'),
      onChange: changeMaintainInsertionOrder,
      value: maintainInsertionOrder,
      name: 'maintain-insertion-order'
    },
    {
      label: globalString('backuprestore/parameters/numParallelCollections/label'),
      tooltips: globalString('backuprestore/parameters/numParallelCollections/tooltip'),
      onChange: changeNumParallelCollections,
      value: numParallelCollections,
      type: 'input',
      inputType: 'number',
      name: 'num-parallel-collections'
    },
    {
      label: globalString('backuprestore/parameters/numInsertionWorkers/label'),
      tooltips: globalString('backuprestore/parameters/numInsertionWorkers/tooltip'),
      onChange: changeNumInsertionWorkersPerCollection,
      value: numInsertionWorkersPerCollection,
      type: 'input',
      inputType: 'number',
      name: 'num-insertion-workers'
    },
    {
      label: globalString('backuprestore/parameters/stopOnError/label'),
      tooltips: globalString('backuprestore/parameters/stopOnError/tooltip'),
      onChange: changeStopOnError,
      value: stopOnError,
      name: 'stop-on-error'
    },
    {
      label: globalString('backuprestore/parameters/bypassDocumentValidation/label'),
      tooltips: globalString('backuprestore/parameters/bypassDocumentValidation/tooltip'),
      onChange: changeBypassDocumentValidation,
      value: bypassDocumentValidation,
      name: 'bypass-document-validation'
    },
    {
      label: globalString('backuprestore/parameters/inputOptions/label'),
      type: 'separator'
    },
    {
      label: globalString('backuprestore/parameters/objcheck/label'),
      tooltips: globalString('backuprestore/parameters/objcheck/tooltip'),
      value: objcheck,
      onChange: changeObjcheck,
      name: 'objcheck'
    },
    {
      label: globalString('backuprestore/parameters/oplogReplay/label'),
      tooltips: globalString('backuprestore/parameters/oplogReplay/tooltip'),
      value: oplogReplay,
      onChange: changeOplogReplay,
      name: 'oplog-replay'
    },
    {
      label: globalString('backuprestore/parameters/oplogLimit/label'),
      tooltips: globalString('backuprestore/parameters/oplogLimit/tooltip'),
      type: 'input',
      value: oplogLimit,
      onChange: changeOplogLimit,
      name: 'oplog-limit'
    },
    {
      label: globalString('backuprestore/parameters/restoreDbUsersAndRoles/label'),
      tooltips: globalString('backuprestore/parameters/restoreDbUsersAndRoles/tooltip'),
      value: restoreDbUsersAndRoles,
      onChange: changeRestoreDbUsersAndRoles,
      name: 'restore-db-users-and-roles'
    },
    {
      label: globalString('backuprestore/parameters/archive/label'),
      tooltips: globalString('backuprestore/parameters/archive/tooltip'),
      value: archive,
      onChange: changeArchive,
      name: 'archive'
    },
    {
      label: globalString('backuprestore/parameters/sslAllowInvalidCertificates/label'),
      tooltips: globalString('backuprestore/parameters/sslAllowInvalidCertificates/tooltip'),
      value: sslAllowInvalidCertificates,
      onChange: changeSslAllowInvalidCertificates,
      name: 'sslAllowInvalidCertificates'
    },
    {
      label: globalString('backuprestore/parameters/gzip/label'),
      tooltips: globalString('backuprestore/parameters/gzip/tooltip'),
      value: gzip,
      onChange: changeGzip,
      name: 'gzip'
    }
  ];
  return getOptions(options);
};

export const ImportOptions = ({
  outputFields,
  changeOutputFields,
  headerLine,
  changeHeaderLine,
  jsonArray,
  changeJsonArray,
  parseGrace,
  changeParseGrace,
  exportType,
  changeExportType,
  columnsHaveTypes,
  changeColumnsHaveTypes,
  drop,
  changeDrop,
  ignoreBlanks,
  changeIgnoreBlanks,
  maintainInsertionOrder,
  changeMaintainInsertionOrder,
  numInsertionWorkers,
  changeNumInsertionWorkers,
  stopOnError,
  changeStopOnError,
  mode,
  changeMode,
  upsertFields,
  changeUpsertFields,
  writeConcern,
  changeWriteConcern,
  shellVersion,
  bypassDocumentValidation,
  changeBypassDocumentValidation
}) => {
  let options = [
    {
      label: globalString('backuprestore/parameters/inputOptions/label'),
      type: 'separator'
    },
    {
      label: globalString('backuprestore/parameters/jsonArray/label'),
      tooltips: globalString('backuprestore/parameters/jsonArray/tooltip'),
      onChange: changeJsonArray,
      checked: jsonArray,
      name: 'json-array'
    },
    {
      label: globalString('backuprestore/parameters/parseGrace/label'),
      tooltips: globalString('backuprestore/parameters/parseGrace/tooltip'),
      onChange: changeParseGrace,
      type: 'selection',
      value: parseGrace,
      name: 'parse-grace'
    },
    {
      label: globalString('backuprestore/parameters/type/label'),
      tooltips: globalString('backuprestore/parameters/type/tooltip'),
      onChange: changeExportType,
      type: 'selection',
      value: exportType,
      name: 'export-type'
    },
    {
      label: globalString('backuprestore/parameters/headerLine/label'),
      tooltips: globalString('backuprestore/parameters/headerLine/tooltip'),
      onChange: changeHeaderLine,
      checked: headerLine,
      name: 'change-header-line',
      hide: exportType.selected === 'json'
    },
    {
      label: globalString('backuprestore/parameters/columnsHaveTypes/label'),
      tooltips: globalString('backuprestore/parameters/columnsHaveTypes/tooltip'),
      onChange: changeColumnsHaveTypes,
      type: 'input',
      value: columnsHaveTypes,
      name: 'columns-have-types'
    },
    {
      label: globalString('backuprestore/parameters/fields/label'),
      tooltips: globalString('backuprestore/parameters/fields/tooltip'),
      type: 'input',
      value: outputFields,
      onChange: changeOutputFields,
      name: 'output-fields'
    },
    {
      label: globalString('backuprestore/parameters/ingestOptions/label'),
      type: 'separator'
    },
    {
      label: globalString('backuprestore/parameters/drop/label'),
      tooltips: globalString('backuprestore/parameters/drop/tooltip'),
      onChange: changeDrop,
      checked: drop,
      name: 'drop'
    },
    {
      label: globalString('backuprestore/parameters/ignoreBlanks/label'),
      tooltips: globalString('backuprestore/parameters/ignoreBlanks/tooltip'),
      onChange: changeIgnoreBlanks,
      checked: ignoreBlanks,
      name: 'ignore-blanks'
    },
    {
      label: globalString('backuprestore/parameters/maintainInsertionOrder/label'),
      tooltips: globalString('backuprestore/parameters/maintainInsertionOrder/tooltip'),
      onChange: changeMaintainInsertionOrder,
      checked: maintainInsertionOrder,
      name: 'maintain-insertion-order'
    },
    {
      label: globalString('backuprestore/parameters/numInsertionWorkers/label'),
      tooltips: globalString('backuprestore/parameters/numInsertionWorkers/tooltip'),
      type: 'input',
      inputType: 'number',
      value: numInsertionWorkers,
      onChange: changeNumInsertionWorkers,
      name: 'num-insertion-workers'
    },
    {
      label: globalString('backuprestore/parameters/stopOnError/label'),
      tooltips: globalString('backuprestore/parameters/stopOnError/tooltip'),
      onChange: changeStopOnError,
      checked: stopOnError,
      name: 'stop-on-error'
    },
    {
      label: globalString('backuprestore/parameters/mode/label'),
      tooltips: globalString('backuprestore/parameters/mode/tooltip'),
      onChange: changeMode,
      type: 'selection',
      value: mode,
      name: 'mode'
    },
    {
      label: globalString('backuprestore/parameters/upsertFields/label'),
      tooltips: globalString('backuprestore/parameters/upsertFields/tooltip'),
      type: 'input',
      value: upsertFields,
      onChange: changeUpsertFields,
      name: 'upsert-fields'
    },
    {
      label: globalString('backuprestore/parameters/writeConcern/label'),
      tooltips: globalString('backuprestore/parameters/writeConcern/tooltip'),
      type: 'input',
      value: writeConcern,
      onChange: changeWriteConcern,
      name: 'write-concern'
    },
    {
      label: globalString('backuprestore/parameters/bypassDocumentValidation/label'),
      tooltips: globalString('backuprestore/parameters/bypassDocumentValidation/tooltip'),
      onChange: changeBypassDocumentValidation,
      checked: bypassDocumentValidation,
      name: 'bypass-document-validation'
    }
  ];
  if (shellVersion) {
    const ver = parseFloat(shellVersion.substring(0, 3), 10);
    if (ver < 3.4) {
      options = _.filter(options, o => o.name !== 'parse-grace' && o.name !== 'mode');
    }
  }
  return getOptions(options);
};
