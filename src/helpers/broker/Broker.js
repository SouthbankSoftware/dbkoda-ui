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
 * @Last modified time: 2017-04-21T19:35:28+10:00
 */

import EventEmitter2 from 'eventemitter2';

const createEmiter = () => {
  return new EventEmitter2.EventEmitter2({
    //
    // set this to `true` to use wildcards. It defaults to `false`.
    //
    wildcard: true,

    //
    // the delimiter used to segment namespaces, defaults to `.`.
    //
    delimiter: '::',

    //
    // set this to `true` if you want to emit the newListener event. The default value is `true`.
    //
    newListener: false,

    //
    // the maximum amount of listeners that can be assigned to an event, default 10.
    //
    maxListeners: 20,

    //
    // show event name in memory leak message when more than maximum amount of listeners is assigned, default false
    //
    verboseMemoryLeak: false
  });
};

// node will always cache a single instance here
export default createEmiter();
