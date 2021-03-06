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
 * @Last modified time: 2017-12-15T13:40:15+11:00
 */

/* eslint camelcase: off */
/* eslint no-unused-vars: warn */

import _ from 'lodash';
import { sprintf } from 'sprintf-js';

const debug = false;

export function dbkoda_listdb(params) {
  //eslint-disable-line
  l.info(params);
  return 'db.adminCommand({listDatabases: 1}).databases';
}

export function dbkoda_listdb_parse(res) {
  //eslint-disable-line
  const dblist = [];
  res.forEach(d => {
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
  res.forEach(r => {
    roleList.push(r.role);
  });
  return roleList.sort();
}

export function dbkoda_listActions() {
  return 'db.getSiblingDB("admin").getRoles({rolesInfo: 1, showPrivileges: true, showBuiltinRoles: true})';
}

export function dbkoda_listActions_parse(res) {
  let actions = res.map(role => {
    return role.privileges.map(actions => {
      return actions.actions;
    });
  });
  actions = _.flatten(actions);
  actions = _.flatten(actions);
  actions = [...new Set(actions)]; // Get unique actions
  actions.sort();
  return actions;
}

export function dbkoda_listcollections(params) {
  //eslint-disable-line
  const cmd = 'db.getSiblingDB("' + params.db + '").getCollectionNames()';
  l.info(cmd);
  return cmd;
}

export function dbkoda_listcollections_parse(res) {
  //eslint-disable-line
  const collectionList = [];
  res.forEach(d => {
    collectionList.push(d);
  });
  return collectionList.sort();
}

export function dbkoda_listcollectionsAgg(params) {
  //eslint-disable-line
  const cmd = 'db.getSiblingDB("' + params.db + '").getCollectionNames()';
  if (debug) l.info('listCollAgg:', cmd);
  return cmd;
}

export function dbkoda_listcollectionsAgg_parse(res) {
  //eslint-disable-line
  const collectionList = [];
  res.forEach(d => {
    collectionList.push(d);
  });
  if (debug) l.info('listCollAgg:', collectionList.sort());
  return JSON.parse(collectionList.sort());
}

export function dbkodaParameterList() {
  //eslint-disable-line
  return 'JSON.stringify(db.getSiblingDB("admin").runCommand( { getParameter : "*" }))';
}

export function dbkodaParameterList_parse(res) {
  //eslint-disable-line
  l.info('got parameters', res);
  const params = Object.keys(res);
  l.info(params);
  return params;
}

export function dbkodaListAttributes(params) {
  const cmd = sprintf('dbe.sampleCollection("%s","%s");', params.db, params.collection);
  l.info(cmd);
  return cmd;
}

export function dbkodaListAttributes_parse(res) {
  //eslint-disable-line
  const data = [];
  res.forEach(a => {
    data.push(a);
  });
  return data;
}

export function dbkodaListAttributesAgg(params) {
  params.dontRun = true;
  return params;
}

export function dbkodaListAttributesAgg_parse(res) {
  if (typeof res.prevAttributes === 'string') {
    return JSON.parse(res.prevAttributes);
  }
  return res.prevAttributes;
}

// Right side of a project - either an existing or new attribute name
export function dbkodaListAttributesProject(params) {
  params.dontRun = true;
  return params;
}

export function dbkodaListAttributesProject_parse(res) {
  l.info(res);
  let output = res.prevAttributes;
  if (typeof res.prevAttributes === 'string') {
    output = JSON.parse(res.prevAttributes);
  }
  output.unshift('NewAttributeName');
  if (debug) l.info('output: ', output);
  return output;
}

// Left side of a project - either an existing attribute with "$" or 1 or 0
export function dbkodaListAttributesProjectTarget(params) {
  params.dontRun = true;
  return params;
}

export function dbkodaListAttributesProjectTarget_parse(res) {
  l.info(res);
  let output = res.prevAttributes;
  if (typeof res.prevAttributes === 'string') {
    output = JSON.parse(res.prevAttributes);
  }
  for (let idx = 0; idx < output.length; idx += 1) {
    output[idx] = '"$' + output[idx] + '"';
  }
  output.unshift('1');
  output.unshift('0');
  if (debug) l.info('target output: ', output);
  return output;
}

export function dbkodaAggOperators(params) {
  params.dontRun = true;
  return params;
}

export function dbkodaAggOperators_parse(res) {
  //eslint-disable-line
  if (debug) l.info(res);
  return ['sum', 'max', 'min', 'avg', 'first', 'last'];
}

export function dbkodaMatchOperators(params) {
  params.dontRun = true;
  return params;
}

export function dbkodaMatchOperators_parse(res) {
  //eslint-disable-line
  if (debug) l.info(res);
  return ['$eq', '$gt', '$gte', '$in', '$lt', '$lte', '$ne', '$nin', '$regex', '$exists'];
}

export function dbkoda_sortOptions(params) {
  params.dontRun = true;
  return params;
}

export function dbkoda_sortOptions_parse(res) {
  if (debug) l.info(res);
  return [1, -1];
}
