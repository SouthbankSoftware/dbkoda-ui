/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-31T09:42:43+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-08-11T16:06:02+10:00
 */

import { Doc } from 'codemirror';
import _ from 'lodash';
import { NewToaster } from '#/common/Toaster';

const MAX_DOCUMENTS = 500;

export default class StaticApi {
  static mongoProtocol = 'mongodb://';
  /**
   * Determine EOL to be used for given content string
   *
   * @param {string} content - content
   * @return {string} EOL
   */
  static determineEol(content) {
    if (!content || content === '') return global.EOL;

    const eols = content.match(/(?:\r?\n)/g) || [];

    if (eols.length === 0) return global.EOL;

    const crlfCount = eols.filter(eol => eol === '\r\n').length;
    const lfCount = eols.length - crlfCount;

    // majority wins and slightly favour \n
    return lfCount >= crlfCount ? '\n' : '\r\n';
  }

  static createNewDocumentObject(content = '') {
    return new Doc(content, 'MongoScript');
  }

  static parseShellJson(jsonStr) {
    return new Promise((resolve, reject) => {
      const ParseWorker = require('worker-loader!./workers/jsonParse.js'); // eslint-disable-line
      const parseWorker = new ParseWorker();
      parseWorker.postMessage({ cmd: 'start', jsonStr });
      parseWorker.addEventListener('message', (e) => {
        if (e.data[1]) {
          reject(e.data[1]);
        } else {
          resolve(e.data[0]);
        }
      });
    });
  }

  static parseTableJson(jsonStr, lines, cm, outputId) {
    return new Promise((resolve, reject) => {
      this.findResultSet(jsonStr, lines, cm, outputId)
        .then((res) => {
          const ParseWorker = require('worker-loader!./workers/jsonParse.js'); // eslint-disable-line
          const parseWorker = new ParseWorker();
          parseWorker.postMessage({ cmd: 'start', jsonStr: res });
          parseWorker.addEventListener('message', (e) => {
            if (e.data[1]) {
              reject(e.data[1]);
            } else {
              resolve(e.data[0]);
            }
          });
        })
        .catch((error) => {
          console.error(error);
        });
    });
  }

  static findResultSet(jsonStr, lines, cm, outputId) {
    return new Promise((resolve) => {
      const linesAbove = _.clone(lines);
      const linesBelow = _.clone(lines);
      const documentsAbove = [];
      const documentsBelow = [];
      let totalDocumentCount = 0;
      // Get document at line one above, keep doing this until we reach an invalid line.
      // Check if the captured right click string has accidentally grabbed previous characters
      if (!jsonStr.match(/^ *{/gim)) {
        // Probably invalid, let's see if there is something valid in there.
        if (jsonStr.match(/^.*{.*}/gim)) {
          // Lets try removing the incorrect json before hand.
          console.warn('Initial: ', jsonStr);
          jsonStr = jsonStr.replace(/^.*\);?/gm, '');
          console.warn(
            'Right click action returned invalid result, tried replacing.',
          );
          console.warn('Replaced: ', jsonStr);
        }
      }

      // Get document below our starting point.
      while (
        linesBelow.status !== 'Invalid' &&
        totalDocumentCount < MAX_DOCUMENTS
      ) {
        const docBelow = this.getDocumentAtLine(
          outputId,
          linesBelow.end + 1,
          1,
          linesBelow,
          cm,
        );
        if (!docBelow.match(/^ *{/gm)) {
          // Probably not Valid.
          linesBelow.status = 'Invalid';
        }

        // Check if valid
        if (linesBelow.status === 'Invalid') {
          // We have reached an end point.
        } else {
          // Add to JSON and then keep going.
          documentsBelow.push(docBelow);
          totalDocumentCount += 1;
        }
        if (totalDocumentCount === MAX_DOCUMENTS) {
          // Toaster Notification
          NewToaster.show({
            message: globalString('output/editor/exceededMaxDocs'),
            className: 'warning',
            iconName: 'pt-icon-thumbs-down',
          });
        }
      }

      // Get document above our starting point.
      while (
        linesAbove.status !== 'Invalid' &&
        totalDocumentCount < MAX_DOCUMENTS
      ) {
        const docAbove = this.getDocumentAtLine(
          outputId,
          linesAbove.start - 1,
          -1,
          linesAbove,
          cm,
        );
        if (!docAbove.match(/^ *{/gm)) {
          // Probably not Valid.
          linesAbove.status = 'Invalid';
        }

        // Check if valid
        if (linesAbove.status === 'Invalid') {
          // We have reached an end point.
        } else {
          // Add to JSON and then keep going.
          documentsAbove.push(docAbove);
          totalDocumentCount += 1;
        }
        if (totalDocumentCount === MAX_DOCUMENTS) {
          // Toaster Notification
          NewToaster.show({
            message: globalString('output/editor/exceededMaxDocs'),
            className: 'warning',
            iconName: 'pt-icon-thumbs-down',
          });
        }
      }

      const finalDocument =
        '[' +
        documentsAbove
          .reverse()
          .concat(jsonStr)
          .concat(documentsBelow)
          .toString() +
        ']';

      // Verify result and show any valid errors:
      if (finalDocument === '[]') {
        resolve('No results');
      }

      resolve(finalDocument);
    });
  }

  static getDocumentAtLine(editorId, lineNumber, direction, lines, cm) {
    const startLine = cm.getLine(lineNumber);
    // Skip these lines to continue reading result set
    if (
      ['dbKoda>', 'it', 'dbKoda>it', '', 'Type "it" for more'].includes(
        startLine,
      )
    ) {
      if (!direction) {
        direction = 1;
      }
      return this.getDocumentAtLine(
        editorId,
        lineNumber + direction,
        direction,
        lines,
        cm,
      );
    }
    if (!startLine || startLine.indexOf('dbKoda>') !== -1) {
      lines.status = 'Invalid';
      return '';
    }
    // There is a selection in CodeMirror
    if (cm.somethingSelected()) {
      return cm.getSelection();
    }
    if (startLine[0] === '{') {
      if (!cm.getLine(lineNumber - 1)) {
        console.info(
          'Tried to parse a non-existing line at',
          lineNumber,
          ' + or - 1 : Ending parsing at this line.',
        );
        lines.start = lineNumber;
        return this._getLineText(cm, lineNumber, 1, lines);
      }
      const prevLine = cm.getLine(lineNumber - 1).trim();
      const nextLine = cm.getLine(lineNumber + 1).trim();
      if (
        startLine[startLine.length - 1] === '}' &&
        (!['[', ',', ':', '{'].includes(prevLine[prevLine.length - 1]) ||
          prevLine.indexOf('dbKoda>') === 0)
      ) {
        if (
          (nextLine && nextLine[0] === '{') ||
          ![']', ',', '}'].includes(nextLine[0])
        ) {
          // This is a single-line document
          lines.start = lineNumber;
          lines.end = lineNumber;
          return startLine;
        }
        // This is the start of a document, only parse downwards
        lines.start = lineNumber;
        return this._getLineText(cm, lineNumber, 1, lines);
      }
    }
    // Parse Multi-line documents
    if (direction === 0) {
      const prevLine = cm.getLine(lineNumber - 1).trim();
      if (
        (prevLine[prevLine.length - 1] === '}' &&
          !['[', ',', ':', '{'].includes(prevLine[prevLine.length - 1])) ||
        prevLine.indexOf('dbKoda>') === 0
      ) {
        lines.start = lineNumber;
        return this._getLineText(cm, lineNumber, 1, lines);
      }
      return (
        this._getLineText(cm, lineNumber - 1, -1, lines) +
        this._getLineText(cm, lineNumber, 1, lines)
      );
    }
    // Direction is 1 or -1 (we came from the Next/Prev buttons)
    direction === -1 ? (lines.end = lineNumber) : (lines.start = lineNumber);
    return this._getLineText(cm, lineNumber, direction, lines);
  }

  static _getLineText(cm, lineNumber, direction, lines) {
    let line = cm.getLine(lineNumber);
    if (!line) {
      lines.status = 'Invalid';
      return '';
    }
    if (line.indexOf('dbKoda>') === 0) {
      return '';
    }
    if (direction === -1 && line[0] === '{') {
      const prevLine = cm.getLine(lineNumber - 1).trim();
      if (
        (prevLine && prevLine[prevLine.length - 1] === '}') ||
        !['[', ',', ':', '{'].includes(prevLine[prevLine.length - 1]) ||
        prevLine.indexOf('dbKoda>') >= 0
      ) {
        lines.start = lineNumber;
        return line;
      }
    } else if (direction === 1 && line[line.length - 1] === '}') {
      const nextLine = cm.getLine(lineNumber + 1).trim();
      if (
        (nextLine && nextLine[0] === '{') ||
        ![']', ',', '}'].includes(nextLine[0])
      ) {
        lines.end = lineNumber;
        return line;
      }
    }
    if (direction === -1) {
      line =
        this._getLineText(cm, lineNumber + direction, direction, lines) + line;
    } else {
      line += this._getLineText(cm, lineNumber + direction, direction, lines);
    }
    return line;
  }
}
