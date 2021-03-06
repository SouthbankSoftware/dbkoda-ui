/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-31T09:42:43+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-07-19T18:53:37+10:00
 */

import { Doc } from 'codemirror';
import _ from 'lodash';
import { NewToaster } from '#/common/Toaster';
import { toStrict } from '~/helpers/mongodbExtendedJsonUtils';

const MAX_DOCUMENTS = 500;

const _parseExtendedJsonString = (input: string): JSON => {
  const jsonStr = toStrict(input);

  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    let bugContext = '';

    if (err.message) {
      const match = err.message.match(/position (\d+)/);

      if (match) {
        const bugIdx = Number(match[1]);
        const width = 20;
        bugContext = JSON.stringify(jsonStr.substring(bugIdx - width, bugIdx + width));
      }
    }

    l.error('Failed to parse extended json string', err, bugContext);
    throw err;
  }
};

export default class StaticApi {
  static mongoProtocol = 'mongodb://';
  static getRandomPort() {
    if (IS_ELECTRON) {
      return window.require('electron').remote.getGlobal('findAvailablePort')(
        6000,
        7000,
        '127.0.0.1'
      );
    }
    return new Promise().resolve(Math.floor(Math.random() * 7000) + 6000);
  }
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

  static createNewDocumentObject(content = '', modeOption = 'MongoScript') {
    return new Doc(content, modeOption);
  }

  static parseShellJson(jsonStr) {
    return new Promise(resolve => {
      resolve(_parseExtendedJsonString(jsonStr));
    });
  }

  static parseTableJson(jsonStr, lines, cm, outputId) {
    return this.findResultSet(jsonStr, lines, cm, outputId).then(_parseExtendedJsonString);
  }

  static parseDefaultTableJson(rsStr, resultSet, cm, outputId) {
    return new Promise((resolve, reject) => {
      const documents = [];
      let currentLine = resultSet.start;
      const lines = _.clone(resultSet);
      // Skip past the command to the result set if it's a multi-line command
      let lineCheck = currentLine;
      let doc = cm.getLine(lineCheck).trim();
      while (doc.startsWith('...') || !doc.startsWith('{')) {
        lineCheck += 1;
        currentLine = lineCheck;
        doc = cm.getLine(lineCheck).trim(); // this.getDocumentAtLine(outputId, lineCheck, 1, lines, cm);
      }
      while (currentLine < resultSet.end && lines.status !== 'Invalid') {
        try {
          const doc = this.getDocumentAtLine(outputId, currentLine, 1, lines, cm);
          if (doc && lines.status !== 'Invalid') {
            documents.push(doc);
          }
        } catch (ex) {
          reject(ex.message);
        }
        currentLine = lines.end + 1;
      }
      if (documents.length > 0) {
        resolve(_parseExtendedJsonString(`[ ${documents.join(',')} ]`));
      } else {
        reject(documents);
      }
    });
  }

  static findResultSet(jsonStr, lines, cm, outputId) {
    return new Promise(resolve => {
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
          l.warn('Initial: ', jsonStr);
          jsonStr = jsonStr.replace(/^.*\);?/gm, '');
          l.warn('Right click action returned invalid result, tried replacing.');
          l.warn('Replaced: ', jsonStr);
        }
      }

      // Get document below our starting point.
      while (linesBelow.status !== 'Invalid' && totalDocumentCount < MAX_DOCUMENTS) {
        const docBelow = this.getDocumentAtLine(outputId, linesBelow.end + 1, 1, linesBelow, cm);
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
            icon: 'thumbs-down'
          });
        }
      }

      // Get document above our starting point.
      while (linesAbove.status !== 'Invalid' && totalDocumentCount < MAX_DOCUMENTS) {
        const docAbove = this.getDocumentAtLine(outputId, linesAbove.start - 1, -1, linesAbove, cm);
        if (
          docAbove.match(/.*;$/gm) ||
          docAbove.match(/ *{}\);?$/) ||
          docAbove.match(/ *}\);?$/) ||
          docAbove.match(/ *\);?$/)
        ) {
          linesAbove.status = 'Invalid';
        }
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
            icon: 'thumbs-down'
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
    if (['dbKoda>', 'it', 'dbKoda>it', '', 'Type "it" for more'].includes(startLine)) {
      if (!direction) {
        direction = 1;
      }
      return this.getDocumentAtLine(editorId, lineNumber + direction, direction, lines, cm);
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
        l.info(
          'Tried to parse a non-existing line at',
          lineNumber,
          ' + or - 1 : Ending parsing at this line.'
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
        if ((nextLine && nextLine[0] === '{') || ![']', ',', '}'].includes(nextLine[0])) {
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
      if ((nextLine && nextLine[0] === '{') || ![']', ',', '}'].includes(nextLine[0])) {
        lines.end = lineNumber;
        return line;
      }
    }
    if (direction === -1) {
      line = this._getLineText(cm, lineNumber + direction, direction, lines) + line;
    } else {
      line += this._getLineText(cm, lineNumber + direction, direction, lines);
    }
    return line;
  }

  static convertJsonToCsv(jsonArray) {
    let fields;
    let headings = [];
    const csv = jsonArray.map(row => {
      fields = Object.keys(row);
      headings = _.union(headings, fields);
      const newRow = fields
        .map(fieldName => {
          if (
            typeof row[fieldName] === 'string' ||
            typeof row[fieldName] === 'number' ||
            typeof row[fieldName] === 'boolean'
          ) {
            l.info(`${fieldName}: ${JSON.stringify(row[fieldName])}`);
            return JSON.stringify(row[fieldName]);
          }
          l.info(`${fieldName}: "${JSON.stringify(row[fieldName]).replace(/"/g, "'")}"`);
          return `"${JSON.stringify(row[fieldName]).replace(/"/g, "'")}"`;
        })
        .join(',')
        .concat('\r\n');
      return newRow;
    });
    l.info(headings.join(','));
    l.info(csv);
    return `${headings.join(',')}\r\n${csv.join('')}`;
  }
}
