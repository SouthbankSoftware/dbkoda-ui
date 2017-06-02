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

export const OutputHotkeys = {
  clearOutput: {
    combo: 'control+L', // Standard Linux hotkey.
    keys: [
      'control', 'l'
    ],
    description: 'Clear the Output.',
    action: 'clearOutput', // In Codemirror by Default.
  },
  showMore: {
    combo: 'control+M',
    keys: [
      'control', 'm'
    ],
    description: 'Show more (if avaliable).'
  }
};

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

export const CodeMirrorHotkeys = {
  moveCursorToStart: {
    combo: 'control+A', // Standard Linux hotkey.
    keys: [
      'control', 'a'
    ],
    description: 'Move Cursor to start of Line.',
    action: null, // In Codemirror by Default.
  },
  moveCursorToEnd: {
    combo: 'control+E', // Standard Linux hotkey.
    keys: [
      'control', 'e'
    ],
    description: 'Move Cursor to end of Line.',
    action: null, // In Codemirror by Default.
  }, moveCursorBackOne: {
    combo: 'control+B', // Standard Linux hotkey.
    keys: [
      'control', 'b'
    ],
    description: 'Move Cursor back one character.',
    action: null, // In Codemirror by Default.
  }, moveCursorBackOneEnd: {
    combo: 'Alt+B', // Standard Linux hotkey.
    keys: [
      'alt', 'b'
    ],
    description: 'Move Cursor back one word.',
    action: null, // In Codemirror by Default.
  }, moveCursorForwardOne: {
    combo: 'control+F', // Standard Linux hotkey.
    keys: [
      'control', 'f'
    ],
    description: 'Move Cursor forward one character.',
    action: null, // In Codemirror by Default.
  }, deleteOneChar: {
    combo: 'control+D', // Standard Linux hotkey.
    keys: [
      'control', 'd'
    ],
    description: 'Delete the character under the cursor.',
    action: null, // In Codemirror by Default.
  },
  deleteOneWord: {
    combo: 'Alt+D', // Standard Linux hotkey.
    keys: [
      'alt', 'd'
    ],
    description: 'Delete the word under the cursor.',
    action: null, // In Codemirror by Default.
  },
  swapTheLastTwoChar: {
    combo: 'control+T', // Standard Linux hotkey.
    keys: [
      'control', 't'
    ],
    description: 'Swap the last two characters before the cursor.',
    action: null, // In Codemirror by Default.
  },
  cutWord: {
    combo: 'control+W', // Standard Linux hotkey.
    keys: [
      'control', 'w'
    ],
    description: 'Cut the word before the cursor to clipboard.',
    action: null, // In Codemirror by Default.
  },
  selectAll : {
    combo: 'Meta + A',
    keys: [
      'meta', 'a'
    ],
    description: 'Select All'
  },
  deleteLine : {
    combo: 'Meta + D',
    keys: [
      'meta', 'd'
    ],
    description: 'Delete Current Line.'
  },
  undo : {
    combo: 'Meta + Z',
    keys: [
      'meta', 'z'
    ],
    description: 'Undo last action.'
  },
  redo : {
    combo: 'Meta + Shift + Z',
    keys: [
      'meta', 'shift', 'z'
    ],
    description: 'Redo last action.'
  },
  goToTop : {
    combo: 'Meta + UpArrow',
    keys: [
      'meta', 'uparrow'
    ],
    description: 'Navigate to top of document'
  },
  goToEnd : {
    combo: 'Meta + DownArrow',
    keys: [
      'meta', 'downarrow'
    ],
    description: 'Navigate to bottom of document'
  },
  find : {
    combo: 'Meta + F',
    keys: [
      'meta', 'f'
    ],
    description: 'Open find menu.'
  },
  findNext : {
    combo: 'Meta + G',
    keys: [
      'meta', 'g'
    ],
    description: 'Find the next instance.'
  },
  findPrev : {
    combo: 'Shift + Amd + G',
    keys: [
      'meta', 'alt', 'f'
    ],
    description: 'Find the previous instance.'
  },
  replace : {
    combo: 'Meta + Alt + F',
    keys: [
      'meta', 'alt', 'f'
    ],
    description: 'Replace a found instance.'
  },
  replaceAll : {
    combo: 'Shift + Meta + Alt + F',
    keys: [
      'shift', 'meta', 'alt', 'f'
    ],
    description: 'Replace all found instances.'
  }
};
