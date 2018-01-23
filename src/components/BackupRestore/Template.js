/**
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-23T12:47:29+11:00
 *
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

import os from 'os';

const enter = os.release().indexOf('Windows') >= 0 ? '\r\n' : '\n';

export const exportDB = '{{#each cols}}\n' +
'mongoexport{{#if host}} --host "{{{escapeDoubleQuotes host}}}"{{/if}}{{#if port}} --port "{{{escapeDoubleQuotes port}}}"{{/if}} --db "{{{escapeDoubleQuotes database}}}"{{#if username}} -u "{{{escapeDoubleQuotes username}}}"{{/if}}{{#if password}} -p ******{{/if}}{{#if ssl}} --ssl{{/if}}{{#if collection}} --collection "{{{escapeDoubleQuotes collection}}}"{{/if}}{{#if authDb}} --authenticationDatabase "{{{escapeDoubleQuotes authDb}}}"{{/if}}{{#if pretty}} --pretty{{/if}}{{#if jsonArray}} --jsonArray{{/if}}{{#if noHeaderLine}} --noHeaderLine{{/if}}{{#if exportType}} --type "{{{escapeDoubleQuotes exportType}}}"{{/if}}{{#if outputFields}} --fields "{{{escapeDoubleQuotes outputFields}}}"{{/if}}{{#if query}} -q "{{{escapeDoubleQuotes query}}}"{{/if}}{{#if readPreference}} --readPreference "{{{escapeDoubleQuotes readPreference}}}"{{/if}}{{#if forceTableScan}} --forceTableScan{{/if}}{{#if skip}} --skip "{{{escapeDoubleQuotes skip}}}"{{/if}}{{#if limit}} --limit "{{{escapeDoubleQuotes limit}}}"{{/if}}{{#if exportSort}} --sort "{{{escapeDoubleQuotes exportSort}}}"{{/if}}{{#if assertExists}} --assertExists{{/if}}{{#if output}} -o "{{{escapeDoubleQuotes output}}}"{{/if}} ' + enter
+ '{{/each}}';

export const dumpDB = '{{#each cols}}\n' +
'mongodump{{#if host}} --host "{{{escapeDoubleQuotes host}}}"{{/if}}{{#if port}} --port "{{{escapeDoubleQuotes port}}}"{{/if}} --db "{{{escapeDoubleQuotes database}}}"{{#if username}} -u "{{{escapeDoubleQuotes username}}}"{{/if}}{{#if password}} -p ******{{/if}}{{#if ssl}} --ssl{{/if}}{{#if collection}} --collection "{{{escapeDoubleQuotes collection}}}"{{/if}}{{#if authDb}} --authenticationDatabase "{{{escapeDoubleQuotes authDb}}}"{{/if}}{{#if gzip}} --gzip{{/if}}{{#if repair}} --repair{{/if}}{{#if oplog}} --oplog{{/if}}{{#if dumpDbUsersAndRoles}} --dumpDbUsersAndRoles{{/if}}{{#if viewsAsCollections}} --viewsAsCollections{{/if}}{{#if numParallelCollections}} --numParallelCollections "{{{escapeDoubleQuotes numParallelCollections}}}"{{/if}}{{#if query}} -q "{{{escapeDoubleQuotes query}}}"{{/if}}{{#if readPreference}} --readPreference "{{{escapeDoubleQuotes readPreference}}}"{{/if}}{{#if forceTableScan}} --forceTableScan{{/if}}{{#if output}} -o "{{{escapeDoubleQuotes output}}}"{{/if}} ' + enter
+ '{{/each}}';

export const dumpServer = '{{#each cols}}\n' +
'mongodump{{#if host}} --host "{{{escapeDoubleQuotes host}}}"{{/if}}{{#if port}} --port "{{{escapeDoubleQuotes port}}}"{{/if}}{{#if database}} --db "{{{escapeDoubleQuotes database}}}"{{/if}}{{#if username}} -u "{{{escapeDoubleQuotes username}}}"{{/if}}{{#if password}} -p ******{{/if}}{{#if ssl}} --ssl{{/if}}{{#if authDb}} --authenticationDatabase "{{{escapeDoubleQuotes authDb}}}"{{/if}}{{#if gzip}} --gzip{{/if}}{{#if repair}} --repair{{/if}}{{#if oplog}} --oplog{{/if}}{{#if dumpDbUsersAndRoles}} --dumpDbUsersAndRoles{{/if}}{{#if viewsAsCollections}} --viewsAsCollections{{/if}}{{#if numParallelCollections}} --numParallelCollections "{{{escapeDoubleQuotes numParallelCollections}}}"{{/if}}{{#if query}} -q "{{{escapeDoubleQuotes query}}}"{{/if}}{{#if readPreference}} --readPreference "{{{escapeDoubleQuotes readPreference}}}"{{/if}}{{#if forceTableScan}} --forceTableScan{{/if}}{{#if output}} -o "{{{escapeDoubleQuotes output}}}"{{/if}} ' + enter
+ '{{/each}}';

export const restoreServer =
'mongorestore{{#if host}} --host "{{{escapeDoubleQuotes host}}}"{{/if}}{{#if port}} --port "{{{escapeDoubleQuotes port}}}"{{/if}}{{#if database}} --db "{{{escapeDoubleQuotes database}}}"{{/if}}{{#if collection}} --collection "{{{escapeDoubleQuotes collection}}}"{{/if}}{{#if username}} -u "{{{escapeDoubleQuotes username}}}"{{/if}}{{#if password}} -p ******{{/if}}{{#if ssl}} --ssl{{/if}}{{#if authDb}} --authenticationDatabase "{{{escapeDoubleQuotes authDb}}}"{{/if}}{{#if objcheck}} --objcheck{{/if}}{{#if oplogReplay}} --oplogReplay{{/if}}{{#if oplogLimit}} --oplogLimit "{{{escapeDoubleQuotes oplogLimit}}}"{{/if}}{{#if restoreDbUsersAndRoles}} --restoreDbUsersAndRoles{{/if}}{{#if gzip}} --gzip{{/if}}{{#if drop}} --drop{{/if}}{{#if dryRun}} --dryRun{{/if}}{{#if writeConcern}} --writeConcern "{{{escapeDoubleQuotes writeConcern}}}"{{/if}}{{#if noIndexRestore}} --noIndexRestore{{/if}}{{#if noOptionsRestore}} --noOptionsRestore{{/if}}{{#if keepIndexVersion}} --keepIndexVersion{{/if}}{{#if maintainInsertionOrder}} --maintainInsertionOrder{{/if}}{{#if numParallelCollections}} --numParallelCollections "{{{escapeDoubleQuotes numParallelCollections}}}"{{/if}}{{#if numInsertionWorkersPerCollection}} --numInsertionWorkersPerCollection "{{{numInsertionWorkersPerCollection}}}"{{/if}}{{#if stopOnError}} --stopOnError{{/if}}{{#if bypassDocumentValidation}} --bypassDocumentValidation{{/if}}{{#if inputFile}} "{{{escapeDoubleQuotes inputFile}}}"{{/if}}';

export const importCollection =
  'mongoimport{{#if host}} --host "{{{escapeDoubleQuotes host}}}"{{/if}}{{#if port}} --port "{{{escapeDoubleQuotes port}}}"{{/if}}{{#if database}} --db "{{{escapeDoubleQuotes database}}}"{{/if}}{{#if collection}} --collection "{{{escapeDoubleQuotes collection}}}"{{/if}}{{#if username}} -u "{{{escapeDoubleQuotes username}}}"{{/if}}{{#if password}} -p ******{{/if}}{{#if ssl}} --ssl{{/if}}{{#if authDb}} --authenticationDatabase "{{{escapeDoubleQuotes authDb}}}"{{/if}}{{#if outputFields}} --fields "{{{escapeDoubleQuotes outputFields}}}"{{/if}}{{#if headerLine}} --headerLine{{/if}}{{#if jsonArray}} --jsonArray{{/if}}{{#if parseGrace}} --parseGrace "{{{escapeDoubleQuotes parseGrace}}}"{{/if}}{{#if outputType}} --type "{{{escapeDoubleQuotes outputType}}}"{{/if}}{{#if columnsHaveTypes}} --columnsHaveTypes "{{{escapeDoubleQuotes columnsHaveTypes}}}"{{/if}}{{#if drop}} --drop{{/if}}{{#if ignoreBlanks}} --ignoreBlanks{{/if}}{{#if maintainInsertionOrder}} --maintainInsertionOrder{{/if}}{{#if numInsertionWorkers}} --numInsertionWorkers "{{{escapeDoubleQuotes numInsertionWorkers}}}"{{/if}}{{#if stopOnError}} --stopOnError{{/if}}{{#if mode}} --mode "{{{escapeDoubleQuotes mode}}}"{{/if}}{{#if upsertFields}} --upsertFields "{{{escapeDoubleQuotes upsertFields}}}"{{/if}}{{#if writeConcern}} --writeConcern "{{{escapeDoubleQuotes writeConcern}}}"{{/if}}{{#if bypassDocumentValidation}} --bypassDocumentValidation{{/if}}{{#if inputFile}} "{{{escapeDoubleQuotes inputFile}}}"{{/if}}';
