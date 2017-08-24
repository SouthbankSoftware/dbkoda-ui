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
import os from 'os';
import mongodbUri from 'mongodb-uri';
import Handlebars from 'handlebars';
import { BackupRestoreActions } from '../common/Constants';
import { exportDB, dumpDB, dumpServer, restoreServer, importCollection } from './Template';
import { isDumpAction } from './Utils';

const createTemplateObject = (state) => {
  const { db, profile, exportType, parseGrace, mode } = state;
  const { host, port, sha, hostRadio, url, database, ssl } = profile;
  const items = {
    ...profile,
    ...state,
    database: db,
    password: sha,
    exportType: exportType ? exportType.selected : false,
    parseGrace: parseGrace ? parseGrace.selected : false,
    mode: mode ? mode.selected : false,
    ssl
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
        // fill in the username and password from uri
        items.username = uri.username;
        items.password = uri.password;
        items.authDb = database;
      }
    }
  }
  return items;
};

const getRestoreServerCommandObject = ({ profile, state }) => {
  const itm = createTemplateObject({ ...state, profile});
  itm.inputFile = state.directoryPath;
  return itm;
};

const getDumpServerCommandObject = ({ profile, state }) => {
  const { directoryPath, allCollections, collections, selectedCollections, dumpDbUsersAndRoles } = state;
  let targetCols = [];
  if (allCollections) {
    targetCols = collections;
  } else {
    targetCols = selectedCollections;
  }
  const cols = [];
  if (!dumpDbUsersAndRoles && !allCollections) {
    targetCols.map((col) => {
      const items = createTemplateObject({ ...state, profile });
      items.database = col;
      if (directoryPath) {
        items.output = directoryPath;
      }
      cols.push(items);
    });
  }

    if (dumpDbUsersAndRoles || allCollections) {
      const itm = createTemplateObject({ ...state, profile, db: null});
      cols.push({ ...itm, output: directoryPath});
    }
  return cols;
};

const getDBCollectionCommandObject = ({ profile, state, action }) => {
  const { directoryPath, allCollections, collections, selectedCollections, dumpDbUsersAndRoles } = state;
  let targetCols = [];
  if (allCollections) {
    targetCols = collections;
  } else {
    targetCols = selectedCollections;
  }
  const cols = [];
  if (!dumpDbUsersAndRoles && !(isDumpAction(action) && allCollections)) {
    // for dump, dumpDbUsersAndRoles can't be set with collections
    // for dump, should not split command for all collections
    targetCols.map((col) => {
      const items = createTemplateObject({ ...state, profile });
      items.collection = col;
      if (directoryPath) {
        if (action === BackupRestoreActions.EXPORT_COLLECTION || action === BackupRestoreActions.EXPORT_DATABASE) {
          items.output = os.release().indexOf('Windows') >= 0 ? directoryPath + '\\' + col + '.json' : directoryPath + '/' + col + '.json';
        } else {
          items.output = directoryPath;
        }
      }
      cols.push(items);
    });
  }

  if (isDumpAction(action)) {
    if (dumpDbUsersAndRoles || allCollections) {
      const itm = createTemplateObject({ ...state, profile});
      cols.push({ ...itm, output: directoryPath });
    }
  }
  return cols;
};

const getImportCollectionCommandObject = ({ profile, state }) => {
  const itm = createTemplateObject({ ...state, profile});
  itm.inputFile = state.directoryPath;
  return itm;
};

export const getCommandObject = ({ profile, state, action }) => {
  switch (action) {
    case BackupRestoreActions.DUMP_SERVER:
      return getDumpServerCommandObject({ profile, state, action });
    case BackupRestoreActions.IMPORT_DATABASE:
      return [getImportCollectionCommandObject({ profile, state })];
    default:
      return getDBCollectionCommandObject({ profile, state, action });
  }
};

export const generateCode = ({treeNode, profile, state, action}) => {
  let cols;
  if (action === BackupRestoreActions.DUMP_SERVER) {
    cols = getDumpServerCommandObject({ treeNode, profile, state, action });
  } else {
    cols = getCommandObject({ treeNode, profile, state, action });
  }
  const values = { cols };
  switch (action) {
    case BackupRestoreActions.EXPORT_DATABASE:
    case BackupRestoreActions.EXPORT_COLLECTION: {
      const template = Handlebars.compile(exportDB);
      return template(values);
    }
    case BackupRestoreActions.DUMP_COLLECTION:
    case BackupRestoreActions.DUMP_DATABASE: {
      const template = Handlebars.compile(dumpDB);
      return template(values);
    }
    case BackupRestoreActions.DUMP_SERVER: {
      const template = Handlebars.compile(dumpServer);
      return template(values);
    }
    case BackupRestoreActions.RESTORE_SERVER:
    case BackupRestoreActions.RESTORE_COLLECTION:
    case BackupRestoreActions.RESTORE_DATABASE: {
      cols = getRestoreServerCommandObject({ treeNode, profile, state, action });
      const template = Handlebars.compile(restoreServer);
      return template(cols);
    }
    case BackupRestoreActions.IMPORT_COLLECTION:
    case BackupRestoreActions.IMPORT_DATABASE: {
      cols = getImportCollectionCommandObject({treeNode, profile, state, action});
      const template = Handlebars.compile(importCollection);
      return template(cols);
    }
    default:
      return '';
  }
};
