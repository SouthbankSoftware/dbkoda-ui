/**
 * @Author: guiguan
 * @Date:   2017-10-02T13:50:52+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2018-02-16T14:00:08+11:00
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

/* eslint-disable */

declare var UAT: any;
declare var IS_PRODUCTION: any;
declare var IS_DEVELOPMENT: any;
declare var IS_ELECTRON: any;
declare var Globalize: any;
declare var locale: string;

/** Utility functions */
declare function globalString(path: string, ...params: *[]): string;
declare function globalNumber(value: number, config?: {}): string;

/** Global types */
declare type ComponentState = 'loading' | 'error' | 'loaded';
declare type UUID = string;

declare type Store = {
  editors: Editors,
  outputs: Outputs
};

declare type Editors = any;
declare type Outputs = any;
