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

export const getCommandObject = ({treeNode, profile, state}) => {
  const {pretty, jsonArray, directoryPath, ssl, allCollections, collections, selectedCollections} = state;
  const db = treeNode.text;
  const {host, port, username, sha, hostRadio, url, database} = profile;
  let targetCols = [];
  if (allCollections) {
    targetCols = collections;
  } else {
    targetCols = selectedCollections;
  }
  const cols = [];
  targetCols.map((col) => {
    const items = {database: db, collection: col, ssl, username, password:sha, pretty, jsonArray};
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
    if (directoryPath) {
      items.output = directoryPath + '/' + col + '.json';
    }
    cols.push(items);
  });
  return cols;
};

export const generateCode = ({treeNode, profile, state, action}) => {
  console.log('action=', action);
  const cols = getCommandObject({treeNode, profile, state});
  const values = {cols};
  const template = require('./Template/ExportDatabsae.hbs');
  return template(values);
};
