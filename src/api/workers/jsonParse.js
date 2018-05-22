/**
 * @Author: chris
 * @Date:   2017-08-08T15:59:13+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-22T11:23:38+10:00
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

self.addEventListener(
  'message',
  e => {
    const { jsonStr } = e.data;
    let message = '';
    let json = jsonStr
      .replace(/ObjectId\("?([0-9a-z]*)"?\)/gm, '"$1"')
      .replace(/NumberLong\("?([0-9\-]*)"?\)/gm, '$1')
      .replace(/NumberDecimal\("([0-9.\-]*)"\)/gm, '$1')
      .replace(/BinData\("?([0-9a-zA-Z]*)"?\)/gm, '"$1"')
      .replace(/ISODate\("?([0-9a-zA-Z\-:\.]*)"?\)/gm, '"$1"')
      .replace(/Timestamp\("?([0-9], *)"?\)/gm, '"$1"')
      .replace(/\n/gm, '')
      .replace(/<(.*)>/gm, contents => {
        return contents
          .replace(/(<[^>])*\/([^>]>)*/gm, '$1\\/$2')
          .replace(/="([^"]*)"/gm, '=\\"$1\\"');
      });
    try {
      // eslint-disable-next-line no-undef
      json = JSOL.parse(json);
    } catch (e) {
      ({ message } = e);
    }
    self.postMessage([json, message]);
    self.close();
  },
  false
);

/*
 *  All code below modified from https://github.com/daepark/JSOL/blob/master/jsol.js
 *  Required modification due to a reference to "window" in a web worker,
 *  and linting fixes.
 */
/*
 * Copyright 2010, Google Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

if (!self.JSOL) {
  self.JSOL = {};
}

// eslint-disable-next-line no-undef
JSOL.parse = function(text) {
  const trim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;
  if (typeof text !== 'string' || !text) {
    return null;
  }
  text = text.replace(trim, '');
  if (
    /^[\],:{}\s]*$/.test(
      text
        .replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
        .replace(/(?:^|:|,)(?:\s*\[)+/g, ':')
        .replace(/\w*\s*\:/g, ':')
    )
  ) {
    return new Function('return ' + text)(); // eslint-disable-line
  }
  throw new Error('Invalid JSON: ' + text);
};
