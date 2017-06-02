export const GlobalHotkeys = [
  {
    combo: null,
    description: 'Create a new Connection Profile',
    action: null // Placeholder
  },
  {
    combo: null,
    description: 'Close or Open selected Connection Profile',
    action: null // Placeholder
  },
  {
    combo: null,
    description: 'Edit selected Connection Profile',
    action: null // Placeholder
  },
  {
    combo: 'Command+S', // Command should be repleced with OS specific versions.
    description: 'Save current editor Tab.',
    action: null // Placeholder
  },
  {
    combo: 'Command+Shift+S', // Command should be repleced with OS specific versions.
    description: 'Save as for current editor Tab.',
    action: null // Placeholder
  },
  {
    combo: 'Command+O',
    description: 'Open current editor Tab.',
    action: null // Placeholder
  },
  {
    combo: 'Command+N',
    description: 'Create new Editor Tab.',
    action: null // Placeholder
  },
  {
    combo: 'Command+S', // Command should be repleced with OS specific versions.
    description: 'Save current editor Tab.',
    action: null // Placeholder
  },
  {
    combo: 'Command+W', // Command should be repleced with OS specific versions.
    description: 'Close current editor Tab.',
    action: null // Placeholder
  },
  {
    combo: 'Command+E',
    description: 'Execute All.',
    action: null // Placeholder
  },
  {
    combo: 'Command+Shift+E',
    description: 'Execute Currently Selected Text / Line',
    action: null // Placeholder
  },
  {
    combo: 'Command+S',
    description: 'Stop Execution (if running)',
    action: null // Placeholder
  },
  {
    combo: 'Command+Shift+R',
    description: 'Refresh Tree View (if avaliable)',
    action: null // Placeholder
  }
];

export const TerminalHotkeys = [
  {
    combo: 'Down Arrow', // Standard Linux hotkey.
    description: 'Go to the next command in command history.',
    action: null // Placeholder
  },
  {
    combo: 'Up Arrow', // Standard Linux hotkey.
    description: 'Go to the Previous command in command history.',
    action: null // Placeholder
  },
  {
    combo: 'Enter',  // Standard Linux hotkey.
    description: 'Send query for execution.',
    action: null // Placeholder
  },
  {
   combo: 'Ctrl+C',
   description: 'Clear the Terminal.',
    action: null // Placeholder
  }
];

export const OutputHotkeys = [
  {
    combo: 'Ctrl+L', // Standard Linux hotkey.
    description: 'Clear the Output.',
    action: 'clearOutput', // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+M',
    description: 'Show more (if avaliable).',
    action: null // Placeholder
  }
];

export const EditorHotkeys = [{
    combo: 'Ctrl+A', // Standard Linux hotkey.
    description: 'Move Cursor to start of Line.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+E', // Standard Linux hotkey.
    description: 'Move Cursor to end of Line.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+B', // Standard Linux hotkey.
    description: 'Move Cursor back one character.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Alt+B', // Standard Linux hotkey.
    description: 'Move Cursor back one word.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+F', // Standard Linux hotkey.
    description: 'Move Cursor forward one character.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+D', // Standard Linux hotkey.
    description: 'Delete the character under the cursor.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Alt+D', // Standard Linux hotkey.
    description: 'Delete the word under the cursor.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+H', // Standard Linux hotkey.
    description: 'Delete the Character before the cursor.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+T', // Standard Linux hotkey.
    description: 'Swap the last two characters before the cursor..',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+W', // Standard Linux hotkey.
    description: 'Cut the word before the cursor to clipboard.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+T', // Standard Linux hotkey.
    description: 'Swap the last two characters before the cursor',
    action: null, // In Codemirror by Default.
  }
];
