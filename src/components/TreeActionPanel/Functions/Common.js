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
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-10T10:33:53+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-16T21:43:08+10:00
 */

/* eslint camelcase: warn */
/* eslint no-unused-vars: warn */

const sprintf = require('sprintf-js').sprintf;

const debug = false;

export function dbkoda_listdb(params) {
  //eslint-disable-line
  return 'db.adminCommand({listDatabases: 1})';
}
export function dbkoda_listdb_parse(res) {
  //eslint-disable-line
  const dblist = [];
  res.databases.forEach((d) => {
    dblist.push(d.name);
  });
  return dblist.sort();
}
export function dbkoda_listRoles(params) {
  //eslint-disable-line
  const db = params && params.db ? params.db : 'admin';
  return `db.getSiblingDB("${db}").getRoles({rolesInfo: 1, showPrivileges: false, showBuiltinRoles: true})`;
}
export function dbkoda_listRoles_parse(res) {
  //eslint-disable-line
  const roleList = [];
  res.forEach((r) => {
    roleList.push(r.role);
  });
  return roleList.sort();
}
export function dbkoda_listcollections(params) {
  //eslint-disable-line
  const cmd = 'db.getSiblingDB("' + params.db + '").getCollectionNames()';
  console.log(cmd);
  return cmd;
}

export function dbkoda_listcollections_parse(res) {
  //eslint-disable-line
  const collectionList = [];
  res.forEach((d) => {
    collectionList.push(d);
  });
  return collectionList.sort();
}
export function dbkodaParameterList() {
  //eslint-disable-line
  return 'JSON.stringify(db.getSiblingDB("admin").runCommand( { getParameter : "*" }))';
}
export function dbkodaParameterList_parse(res) {
  //eslint-disable-line
  console.log('got parameters', res);
  const params = Object.keys(res);
  console.log(params);
  return params;
}
export function dbkodaListAttributes(params) {
  const cmd = sprintf(
    'dbe.sampleCollection("%s","%s");',
    params.db,
    params.collection,
  );
  console.log(cmd);
  return cmd;
}

export function dbkodaListAttributes_parse(res) {
  //eslint-disable-line
  const data = [];
  res.forEach((a) => {
    data.push(a);
  });
  return data;
}

export function dbkodaListAttributesAgg(params) {
  params.dontRun = true;
  return params;
}
export function dbkodaListAttributesAgg_parse(res) {
  console.log(res.prevAttributes);
  return JSON.parse(res.prevAttributes);
}

export function dbkodaAggOperators(params) {
  params.dontRun = true;
  return params;
}

export function dbkodaAggOperators_parse(res) {
  //eslint-disable-line
  if (false) console.log(res);
  return ['sum', 'max', 'min', 'avg', 'first', 'last'];
}

export function dbkodaMatchOperators(params) {
  params.dontRun = true;
  return params;
}

export function dbkodaMatchOperators_parse(res) {
  //eslint-disable-line
  if (debug) console.log(res);
  return ['$eq', '$gt', '$gte', '$in', '$lt', '$lte', '$ne'];
}
