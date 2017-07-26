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
 * Created by joey on 24/7/17.
 */

import mongodbUri from 'mongodb-uri';
import Handlebars from 'handlebars';
import {BackupRestoreActions} from '../common/Constants';
import {exportDB, dumpDB, dumpServer} from './Template';

const createTemplateObject = (state) => {
  const {pretty, jsonArray, ssl, db, gzip, repair, oplog, dumpDbUsersAndRoles, readPreference,
    forceTableScan, skip, limit, exportSort, assertExists, numParallelCollections,
    viewsAsCollections, profile, noHeaderLine, exportType, outputFields, query} = state;
  const {host, port, username, sha, hostRadio, url, database} = profile;
  const items = {
    database: db,
    ssl,
    username,
    password: sha,
    pretty,
    jsonArray,
    gzip,
    repair,
    oplog,
    dumpDbUsersAndRoles,
    noHeaderLine,
    viewsAsCollections,
    exportType: exportType.selected,
    outputFields,
    query,
    readPreference,
    forceTableScan,
    skip,
    limit,
    exportSort,
    assertExists,
    numParallelCollections,
  };
  if (sha) {
    items.authDb = database;
  }
  if (hostRadio) {
    items.host = host;
    items.port = port;
  } else {
    const uri = mongodbUri.parse(url);
    if (uri.hosts.length == 1) {
      items.host = uri.hosts[0].host;
      items.port = uri.hosts[0].port ? uri.hosts[0].port : '27017';
    } else if (uri.options && uri.options.replicaSet) {
      // replica set
      let repH = uri.options.replicaSet + '/';
      uri.hosts.map((h, i) => {
        repH += h.host;
        const p = h.port ? h.port : 27017;
        repH += ':' + p;
        if (i != uri.hosts.length - 1) {
          repH += ',';
        }
      });
      items.host = repH;
    }
    if (!sha) {
      if (uri.username && uri.password) {
        items.username = uri.username;
        items.password = uri.password;
      }
    }
  }
  return items;
};

export const getCommandObject = ({profile, state, action}) => {
  const {directoryPath, allCollections, collections, selectedCollections, dumpDbUsersAndRoles} = state;
  let targetCols = [];
  if (allCollections) {
    targetCols = collections;
  } else {
    targetCols = selectedCollections;
  }
  const cols = [];
  !dumpDbUsersAndRoles && targetCols.map((col) => {
    const items = createTemplateObject({...state, profile});
    items.collection = col;
    if (directoryPath) {
      if (action === BackupRestoreActions.EXPORT_COLLECTION || action === BackupRestoreActions.EXPORT_DATABASE) {
        items.output = directoryPath + '/' + col + '.json';
      } else {
        items.output = directoryPath;
      }
    }
    cols.push(items);
  });
  if (action === BackupRestoreActions.DUMP_COLLECTION || action === BackupRestoreActions.DUMP_DATABASE) {
    if (dumpDbUsersAndRoles) {
      const itm = createTemplateObject({...state, profile});
      cols.push({...itm, output: directoryPath});
    }
  }
  return cols;
};

export const generateCode = ({treeNode, profile, state, action}) => {
  const cols = getCommandObject({treeNode, profile, state, action});
  const values = {cols};
  switch (action) {
    case BackupRestoreActions.EXPORT_DATABASE:
    case BackupRestoreActions.EXPORT_COLLECTION: {
      // const template = require('./Template/ExportDatabsae.hbs');
//       const exportDB = '{{#each cols}}\
// mongoexport{{#if host}} --host {{host}}{{/if}}{{#if port}} --port {{port}}{{/if}} --db {{database}}{{#if username}} -u {{username}}{{/if}}{{#if password}} -p ******{{/if}}{{#if ssl}} --ssl{{/if}}{{#if collection}} --collection {{collection}}{{/if}}{{#if authDb}} --authenticationDatabase {{authDb}}{{/if}}{{#if pretty}} --pretty {{/if}}{{#if jsonArray}} --jsonArray {{/if}}{{#if noHeaderLine}} --noHeaderLine {{/if}}{{#if exportType}} --type {{exportType}} {{/if}}{{#if outputFields}} --fields {{outputFields}} {{/if}}{{#if query}} -q {{query}} {{/if}}{{#if readPreference}} --readPreference {{readPreference}} {{/if}}{{#if forceTableScan}} --forceTableScan {{/if}}{{#if skip}} --skip {{skip}}{{/if}}{{#if limit}} --limit {{limit}}{{/if}}{{#if exportSort}} --sort {{exportSort}}{{/if}}{{#if assertExists}} --assertExists{{/if}}{{#if output}} -o {{output}}{{/if}} \
// {{/each}}';
      const template = Handlebars.compile(exportDB);
      return template(values);
    }
    case BackupRestoreActions.DUMP_COLLECTION:
    case BackupRestoreActions.DUMP_DATABASE: {
      // const template = require('./Template/DumpDatabsae.hbs');
//       const dumpDB = '{{#each cols}}\
// mongodump{{#if host}} --host {{host}}{{/if}}{{#if port}} --port {{port}}{{/if}} --db {{database}}{{#if username}} -u {{username}}{{/if}}{{#if password}} -p ******{{/if}}{{#if ssl}} --ssl{{/if}}{{#if collection}} --collection {{collection}}{{/if}}{{#if authDb}} --authenticationDatabase {{authDb}}{{/if}}{{#if gzip}} --gzip {{/if}}{{#if repair}} --repair {{/if}}{{#if oplog}} --oplog {{/if}}{{#if dumpDbUsersAndRoles}} --dumpDbUsersAndRoles {{/if}}{{#if viewsAsCollections}} --viewsAsCollections {{/if}}{{#if output}} -o {{output}}{{/if}} \
// {{/each}}';
      const template = Handlebars.compile(dumpDB);
      return template(values);
    }
    case BackupRestoreActions.DUMP_SERVER: {
        const template = Handlebars.compile(dumpServer);
        return template(values);
      }
    default:
      return '';
  }
};