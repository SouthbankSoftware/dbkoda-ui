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

export const exportDB = '{{#each cols}}\
mongoexport{{#if host}} --host {{host}}{{/if}}{{#if port}} --port {{port}}{{/if}} --db {{database}}{{#if username}} -u {{username}}{{/if}}{{#if password}} -p ******{{/if}}{{#if ssl}} --ssl{{/if}}{{#if collection}} --collection {{collection}}{{/if}}{{#if authDb}} --authenticationDatabase {{authDb}}{{/if}}{{#if pretty}} --pretty{{/if}}{{#if jsonArray}} --jsonArray{{/if}}{{#if noHeaderLine}} --noHeaderLine{{/if}}{{#if exportType}} --type {{exportType}}{{/if}}{{#if outputFields}} --fields {{outputFields}}{{/if}}{{#if query}} -q {{query}}{{/if}}{{#if readPreference}} --readPreference {{readPreference}}{{/if}}{{#if forceTableScan}} --forceTableScan{{/if}}{{#if skip}} --skip {{skip}}{{/if}}{{#if limit}} --limit {{limit}}{{/if}}{{#if exportSort}} --sort {{exportSort}}{{/if}}{{#if assertExists}} --assertExists{{/if}}{{#if output}} -o {{output}}{{/if}} \
{{/each}}';

export const dumpDB = '{{#each cols}}\
mongodump{{#if host}} --host {{host}}{{/if}}{{#if port}} --port {{port}}{{/if}} --db {{database}}{{#if username}} -u {{username}}{{/if}}{{#if password}} -p ******{{/if}}{{#if ssl}} --ssl{{/if}}{{#if collection}} --collection {{collection}}{{/if}}{{#if authDb}} --authenticationDatabase {{authDb}}{{/if}}{{#if gzip}} --gzip{{/if}}{{#if repair}} --repair{{/if}}{{#if oplog}} --oplog{{/if}}{{#if dumpDbUsersAndRoles}} --dumpDbUsersAndRoles{{/if}}{{#if viewsAsCollections}} --viewsAsCollections{{/if}}{{#if numParallelCollections}} --numParallelCollections {{numParallelCollections}}{{/if}}{{#if query}} -q {{query}}{{/if}}{{#if readPreference}} --readPreference{{readPreference}}{{/if}}{{#if forceTableScan}} --forceTableScan{{/if}}{{#if output}} -o {{output}}{{/if}} \
{{/each}}';

export const dumpServer = '{{#each cols}}\
mongodump{{#if host}} --host {{host}}{{/if}}{{#if port}} --port {{port}}{{/if}} --db {{database}}{{#if username}} -u {{username}}{{/if}}{{#if password}} -p ******{{/if}}{{#if ssl}} --ssl{{/if}}{{#if authDb}} --authenticationDatabase {{authDb}}{{/if}}{{#if gzip}} --gzip{{/if}}{{#if repair}} --repair{{/if}}{{#if oplog}} --oplog{{/if}}{{#if dumpDbUsersAndRoles}} --dumpDbUsersAndRoles{{/if}}{{#if viewsAsCollections}} --viewsAsCollections{{/if}}{{#if numParallelCollections}} --numParallelCollections {{numParallelCollections}}{{/if}}{{#if query}} -q {{query}}{{/if}}{{#if readPreference}} --readPreference{{readPreference}}{{/if}}{{#if forceTableScan}} --forceTableScan{{/if}}{{#if output}} -o {{output}}{{/if}} \
{{/each}}';
