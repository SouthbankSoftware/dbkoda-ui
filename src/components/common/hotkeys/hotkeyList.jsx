import React from 'react';
import HotKey from 'react-shortcut';

export const GlobalHotkeys = {
  createNewProfile: {
    combo: null,
    keys: [],
    description: 'Create a new Connection Profile'
  },
  closeOrOpenProfile: {
    combo: null,
    keys: [],
    description: 'Close or Open selected Connection Profile'
  },
  editProfile: {
    combo: null,
    keys: [],
    description: 'Edit selected Connection Profile'
  },
  saveFile: {
    combo: 'meta+S', // meta should be repleced with OS specific versions.
    keys: [
      'meta', 's'
    ],
    description: 'Save current editor Tab.'
  },
  saveFileAs: {
    combo: 'meta+Shift+S', // meta should be repleced with OS specific versions.
    keys: [
      'meta', 'shift', 's'
    ],
    description: 'Save as for current editor Tab.'
  },
  openFile: {
    combo: 'meta+O',
    keys: [
      'meta', 'o'
    ],
    description: 'Open file.'
  },
  newTab: {
    combo: 'meta+N',
    keys: [
      'meta', 'shift', 'n'
    ],
    description: 'Create new Editor Tab.'
  },
  closeTab: {
    combo: 'meta+W', // meta should be repleced with OS specific versions.
    keys: [
      'meta', 'w'
    ],
    description: 'Close current editor Tab.'
  },
  executeAll: {
    combo: 'meta+E',
    keys: [
      'meta', 'e'
    ],
    description: 'Execute All.'
  },
  executeLine: {
    combo: 'meta+Shift+E',
    keys: [
      'meta', 'shift', 'e'
    ],
    description: 'Execute Currently Selected Text / Line'
  },
  stopExecution: {
    combo: 'meta+S',
    keys: [
      'meta', 'shift', 's'
    ],
    description: 'Stop Execution (if running)'
  },
  refreshTree: {
    combo: 'meta+Shift+R',
    keys: [
      'meta', 'shift', 'r'
    ],
    description: 'Refresh Tree View (if avaliable)'
  }
};

export const TerminalHotkeys = {
  nextmeta: {
    combo: 'Down Arrow', // Standard Linux hotkey.
    keys: ['arrowdown'],
    description: 'Go to the next meta in meta history.'
  },
  previousmeta: {
    combo: 'Up Arrow', // Standard Linux hotkey.
    keys: ['arrowup'],
    description: 'Go to the Previous meta in meta history.'
  },
  sendQuery: {
    combo: 'Enter', // Standard Linux hotkey.
    keys: ['enter'],
    description: 'Send query for execution.'
  },
  clearTerminal: {
    combo: 'control+C',
    keys: [
      'control', 'c'
    ],
    description: 'Clear the Terminal.'
  }
};

export const OutputHotkeys = [
  {
    combo: 'control+L', // Standard Linux hotkey.
    keys: [
      'control', 'l'
    ],
    description: 'Clear the Output.',
    action: 'clearOutput', // In Codemirror by Default.
  }, {
    combo: 'control+M',
    keys: [
      'control', 'm'
    ],
    description: 'Show more (if avaliable).'
  }
];

export const EditorHotkeys = [
  {
    combo: 'meta+F',
    keys: [
      'meta', 'f'
    ],
    description: 'Search.',
    action: null, // Placeholder
  }, {
    combo: 'meta+B',
    keys: [
      'meta', 'b'
    ],
    description: 'Format All.',
    action: null, // Placeholder
  }, {
    combo: 'meta+Shift+F',
    keys: [
      'meta', 'shift', 'f'
    ],
    description: 'Format Selection',
    action: null, // Placeholder
  }
];

export const CodeMirrorHotkeys = [
    {
    combo: 'control+A', // Standard Linux hotkey.
    keys: [
      'control', 'a'
    ],
    description: 'Move Cursor to start of Line.',
    action: null, // In Codemirror by Default.
  }, {
    combo: 'control+E', // Standard Linux hotkey.
    keys: [
      'control', 'e'
    ],
    description: 'Move Cursor to end of Line.',
    action: null, // In Codemirror by Default.
  }, {
    combo: 'control+B', // Standard Linux hotkey.
    keys: [
      'control', 'b'
    ],
    description: 'Move Cursor back one character.',
    action: null, // In Codemirror by Default.
  }, {
    combo: 'Alt+B', // Standard Linux hotkey.
    keys: [
      'alt', 'b'
    ],
    description: 'Move Cursor back one word.',
    action: null, // In Codemirror by Default.
  }, {
    combo: 'control+F', // Standard Linux hotkey.
    keys: [
      'control', 'f'
    ],
    description: 'Move Cursor forward one character.',
    action: null, // In Codemirror by Default.
  }, {
    combo: 'control+D', // Standard Linux hotkey.
    keys: [
      'control', 'd'
    ],
    description: 'Delete the character under the cursor.',
    action: null, // In Codemirror by Default.
  }, {
    combo: 'Alt+D', // Standard Linux hotkey.
    keys: [
      'alt', 'd'
    ],
    description: 'Delete the word under the cursor.',
    action: null, // In Codemirror by Default.
  }, {
    combo: 'control+H', // Standard Linux hotkey.
    keys: [
      'control', 'h'
    ],
    description: 'Delete the Character before the cursor.',
    action: null, // In Codemirror by Default.
  }, {
    combo: 'control+T', // Standard Linux hotkey.
    keys: [
      'control', 't'
    ],
    description: 'Swap the last two characters before the cursor.',
    action: null, // In Codemirror by Default.
  }, {
    combo: 'control+W', // Standard Linux hotkey.
    keys: [
      'control', 'w'
    ],
    description: 'Cut the word before the cursor to clipboard.',
    action: null, // In Codemirror by Default.
  }
];

