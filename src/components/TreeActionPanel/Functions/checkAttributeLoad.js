/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-15T13:37:18+11:00
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

// Run this in mongo to check that we can parse attributes
/* eslint-disable */
/* eslint camelcase:warn */

function dbkodaListAttributes_parse(res) {
  //eslint-disable-line
  // Print attributes to one level (eg xxx.yyy but not xxx.yyy.zzz)
  const attributes = {};
  res.forEach(doc => {
    Object.keys(doc).forEach(key => {
      let keytype = typeof doc[key];
      if (doc[key]) {
        if (doc[key].constructor === Array) {
          keytype = 'array';
        }
      }
      attributes[key] = keytype;
      if (keytype == 'object') {
        const obj = doc[key];
        if (obj) {
          Object.keys(obj).forEach(nestedKey => {
            attributes[key + '.' + nestedKey] = typeof obj[nestedKey];
          });
        }
      } else if (keytype === 'array') {
        const docarray = doc[key];
        docarray.forEach(nestedDoc => {
          const obj = nestedDoc;
          Object.keys(obj).forEach(nestedKey => {
            attributes[key + '.' + nestedKey] = typeof obj[nestedKey];
          });
        });
      }
    });
  });
  const results = Object.keys(attributes).sort();
  return results;
}

db
  .getSiblingDB('SampleCollections')
  .getCollectionNames()
  .forEach(collection => {
    print(collection);
    const x = db
      .getSiblingDB('SampleCollections')
      .getCollection(collection)
      .aggregate([
        {
          $sample: {
            size: 20
          }
        }
      ])
      .toArray();
    dbkodaListAttributes_parse(x).forEach(att => {
      print('   ' + att);
    });
  });
