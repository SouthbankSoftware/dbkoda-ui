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
 * @Author: chris
 * @Date:   2017-05-17T13:39:35+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-15T13:36:27+11:00
 */
global.Globalize = require('globalize');
const messages = require('~/messages/en.json');

export default function globalizeInit() {
  global.globalString = (path, ...params) => global.Globalize.messageFormatter(path)(...params);
  global.Globalize.load(
    require('cldr-data').entireSupplemental(),
    require('cldr-data').entireMainFor('en')
  );
  global.Globalize.locale('en');
  global.Globalize.loadMessages(messages);
}
