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
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-25T11:42:31+11:00
 */

const protocol = 'http://';
const host = '127.0.0.1';
const port = 3030;
const url = protocol + host + ':' + port;
const analytics = {
  'development': 'UA-101162043-2',
  'prod': 'UA-101162043-1'
};

module.exports = {
  protocol,
  host,
  port,
  url,
  analytics
};
