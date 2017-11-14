/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-08T15:20:34+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-13T17:59:52+11:00
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

declare module 'xterm/build/xterm' {
  declare class CharMeasure {
    measure(options: {}): void;
  }

  declare class Xterm {
    constructor(): Xterm;

    cols: number;
    rows: number;
    options: {};

    open(container: React.ElementRef<*>): void;
    winptyCompatInit(): void;
    on(eventName: string, cb: (param: any) => void): void;
    attach(socket: *): void;
    destroy(): void;
    getSelection(): string;
    findNext(token: string): void;
    findPrevious(token: string): void;
    fit(): void;
    focus(): void;

    charMeasure: CharMeasure;
  }

  declare export default typeof Xterm;
}

declare module 'xterm/lib/addons/attach/attach' {
  declare export default any;
}

declare module 'xterm/lib/addons/fit/fit' {
  declare export default any;
}

declare module 'xterm/lib/addons/search/search' {
  declare export default any;
}

declare module 'xterm/lib/addons/winptyCompat/winptyCompat' {
  declare export default any;
}
