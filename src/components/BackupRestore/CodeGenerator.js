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
import {BackupRestoreActions} from '../common/Constants';

const createTemplateObject = (state) => {
  const {pretty, jsonArray, ssl, db, gzip, repair, oplog, dumpDbUsersAndRoles, readPreference,
    forceTableScan, skip, limit, sort, assertExists,
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
    sort,
    assertExists,
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
    items.output = directoryPath + '/' + col + '.json';
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
      const template = require('./Template/ExportDatabsae.hbs');
      return template(values);
    }
    case BackupRestoreActions.DUMP_COLLECTION:
    case BackupRestoreActions.DUMP_DATABASE: {
      const template = require('./Template/DumpDatabsae.hbs');
      return template(values);
    }
    default:
      return '';
  }
};
