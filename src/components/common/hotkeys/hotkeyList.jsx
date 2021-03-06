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

export const GlobalHotkeys = {
  editorToolbarHotkeys: {
    saveFile: {
      combo: 'Control/Command + S', // meta should be repleced with OS specific versions.
      // keys: 'ctrl+s',
      description: 'Save current editor Tab.'
    },
    saveFileAs: {
      combo: 'Control/Command + Shift + S', // meta should be repleced with OS specific versions.
      // keys: 'ctrl+shift+s',
      description: 'Save as for current editor Tab.'
    },
    openFile: {
      combo: 'Control/Command + O',
      // keys: 'ctrl+o',
      description: 'Open file.'
    },
    addEditor: {
      combo: 'Control/Command + N',
      // keys: 'ctrl+shift+n',
      description: 'Create new Editor Tab.'
    },
    executeLine: {
      combo: 'F7',
      keys: 'f7',
      description: 'Execute Currently Selected Text / Line'
    },
    executeAll: {
      combo: 'F8',
      keys: 'f8',
      description: 'Execute Contents Of Current Editor.'
    },
    stopExecution: {
      combo: 'Control + Shift + T',
      keys: 'ctrl+shift+t',
      description: 'Stop Execution (if running)'
    }
  },
  createNewProfile: {
    combo: 'Control + Shift + N.',
    keys: 'ctrl+shift+n',
    description: 'Create a new Connection Profile'
  },

  closeTab: {
    combo: 'Control + Shift + W', // meta should be repleced with OS specific versions.
    keys: 'ctrl+shift+w',
    description: 'Close current editor Tab.'
  },
  refreshTree: {
    combo: 'Control + Shift + R',
    keys: 'ctrl+shift+r',
    description: 'Refresh Tree View (if avaliable)'
  }
};

export const TerminalHotkeys = {
  nextmeta: {
    combo: 'Down Arrow', // Standard Linux hotkey.
    keys: 'down',
    description: 'Go to the next meta in meta history.'
  },
  previousmeta: {
    combo: 'Up Arrow', // Standard Linux hotkey.
    keys: 'up',
    description: 'Go to the Previous meta in meta history.'
  },
  sendQuery: {
    combo: 'Enter', // Standard Linux hotkey.
    keys: 'enter',
    description: 'Send query for execution.'
  },
  clearTerminal: {
    combo: 'Control + C',
    keys: 'ctrl+c',
    description: 'Clear the Terminal.'
  }
};

export const OutputHotkeys = {
  clearOutput: {
    combo: 'Control + L', // Standard Linux hotkey.
    keys: 'ctrl+l',
    description: 'Clear the Output.',
    action: 'clearOutput' // In Codemirror by Default.
  },
  showMore: {
    combo: 'Control + M',
    keys: 'ctrl+m',
    description: 'Show more (if avaliable).'
  }
};

export const EditorHotkeys = [
  {
    combo: 'Control + F',
    keys: 'ctrl+f',
    description: 'Search.'
  },
  {
    combo: 'Control + B',
    keys: 'ctrl+b',
    description: 'Format All.'
  },
  {
    combo: 'Control + Shift + F',
    keys: 'ctrl+shift+f',
    description: 'Format Selection'
  },
  {
    combo: 'Control + Space',
    keys: 'ctrl+space',
    description: 'Auto-Complete'
  }
];

export const CodeMirrorHotkeys = {
  moveCursorToStart: {
    combo: 'control + A', // Standard Linux hotkey.
    keys: ['control', 'a'],
    description: 'Move Cursor to start of Line.',
    action: null // In Codemirror by Default.
  },
  moveCursorToEnd: {
    combo: 'control + E', // Standard Linux hotkey.
    keys: ['control', 'e'],
    description: 'Move Cursor to end of Line.',
    action: null // In Codemirror by Default.
  },
  moveCursorBackOne: {
    combo: 'control + B', // Standard Linux hotkey.
    keys: ['control', 'b'],
    description: 'Move Cursor back one character.',
    action: null // In Codemirror by Default.
  },
  moveCursorBackOneEnd: {
    combo: 'Alt + B', // Standard Linux hotkey.
    keys: ['alt', 'b'],
    description: 'Move Cursor back one word.',
    action: null // In Codemirror by Default.
  },
  moveCursorForwardOne: {
    combo: 'control + F', // Standard Linux hotkey.
    keys: ['control', 'f'],
    description: 'Move Cursor forward one character.',
    action: null // In Codemirror by Default.
  },
  deleteOneChar: {
    combo: 'control + D', // Standard Linux hotkey.
    keys: ['control', 'd'],
    description: 'Delete the character under the cursor.',
    action: null // In Codemirror by Default.
  },
  deleteOneWord: {
    combo: 'Alt + D', // Standard Linux hotkey.
    keys: ['alt', 'd'],
    description: 'Delete the word under the cursor.',
    action: null // In Codemirror by Default.
  },
  swapTheLastTwoChar: {
    combo: 'control + T', // Standard Linux hotkey.
    keys: ['control', 't'],
    description: 'Swap the last two characters before the cursor.',
    action: null // In Codemirror by Default.
  },
  cutWord: {
    combo: 'control + W', // Standard Linux hotkey.
    keys: ['control', 'w'],
    description: 'Cut the word before the cursor to clipboard.',
    action: null // In Codemirror by Default.
  },
  selectAll: {
    combo: 'Command + A',
    keys: ['meta', 'a'],
    description: 'Select All'
  },
  deleteLine: {
    combo: 'Command + D',
    keys: ['meta', 'd'],
    description: 'Delete Current Line.'
  },
  undo: {
    combo: 'Command + Z',
    keys: ['meta', 'z'],
    description: 'Undo last action.'
  },
  redo: {
    combo: 'Command + Shift + Z',
    keys: ['meta', 'shift', 'z'],
    description: 'Redo last action.'
  },
  goToTop: {
    combo: 'Command + UpArrow',
    keys: ['meta', 'uparrow'],
    description: 'Navigate to top of document'
  },
  goToEnd: {
    combo: 'Command + DownArrow',
    keys: ['meta', 'downarrow'],
    description: 'Navigate to bottom of document'
  },
  find: {
    combo: 'Command + F',
    keys: ['meta', 'f'],
    description: 'Open find menu.'
  },
  findNext: {
    combo: 'Command + G',
    keys: ['meta', 'g'],
    description: 'Find the next instance.'
  },
  findPrev: {
    combo: 'Shift + Alt +  G',
    keys: ['shift', 'alt', 'f'],
    description: 'Find the previous instance.'
  },
  replace: {
    combo: 'Command + Alt + F',
    keys: ['meta', 'alt', 'f'],
    description: 'Replace a found instance.'
  },
  replaceAll: {
    combo: 'Shift + Command + Alt + F',
    keys: ['shift', 'meta', 'alt', 'f'],
    description: 'Replace all found instances.'
  }
};

export const DialogHotkeys = {
  closeDialog: {
    combo: 'Escape',
    keys: 'esc',
    description: 'Close Dialog'
  },
  submitDialog: {
    combo: 'Enter',
    keys: 'enter',
    description: 'Submit Dialog'
  }
};
