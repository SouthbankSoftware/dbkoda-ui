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

const file = process.argv[2];
const sprintf = require('sprintf-js').sprintf;
/* eslint-disable */
let ddd = require('./' + file); // eslint-disable-line no-dynamic-require
/* eslint-enable */
l.info(file);
l.info('{');
ddd.Fields.forEach(f => {
  const line = sprintf('\t"%s":"%s",', f.name, f.name);
  l.info(line);
});
l.info('}\n');
