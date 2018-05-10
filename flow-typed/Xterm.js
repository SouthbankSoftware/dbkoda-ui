/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-11-08T15:20:34+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-09T13:59:03+10:00
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

declare module 'xterm' {
  declare class CharMeasure {
    measure(options: {}): void;
  }

  declare class Buffer {
    ybase: number;
    y: number;

    translateBufferLineToString(
      lineIndex: number,
      trimRight?: boolean,
      startCol?: number,
      endCol?: number
    ): string;
  }

  declare export class Terminal {
    constructor(options: {}): Terminal;

    cols: number;
    rows: number;
    options: {};
    buffer: Buffer;

    open(container: React.ElementRef<*>): void;
    winptyCompatInit(): void;
    on(eventName: string, cb: (param: any) => void): void;
    off(eventName: string, cb: (param: any) => void): void;
    attach(socket: *): void;
    detach(socket: *): void;
    destroy(): void;
    getSelection(): string;
    findNext(token: string): void;
    findPrevious(token: string): void;
    fit(): void;
    focus(): void;
    write(data: string): void;
    static applyAddon(addon: *): void;
    attachCustomKeyEventHandler(handler: *): boolean;

    charMeasure: CharMeasure;
  }
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
