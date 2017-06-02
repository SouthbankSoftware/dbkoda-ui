import React from 'react';
import HotKey from 'react-shortcut';

export const GlobalHotkeys = [
  createNewProfile: {
    combo: null,
    keys: [],
    description: 'Create a new Connection Profile',
    action: null // Placeholder
  },
  closeOrOpenProfile: {
    combo: null,
    keys: [],
    description: 'Close or Open selected Connection Profile',
    action: null // Placeholder
  },
  editProfile: {
    combo: null,
    keys: [],
    description: 'Edit selected Connection Profile',
    action: null // Placeholder
  },
  saveTab: {
    combo: 'Command+S', // Command should be repleced with OS specific versions.
    keys: ['command', 's'],
    description: 'Save current editor Tab.',
    action: null // Placeholder
  },
  saveAsTab: {
    combo: 'Command+Shift+S', // Command should be repleced with OS specific versions.
    keys: ['command', 'shift', 's'],
    description: 'Save as for current editor Tab.',
    action: null // Placeholder
  },
  openFile: {
    combo: 'Command+O',
    keys: ['command', 'o'],
    description: 'Open file.',
    action: null // Placeholder
  },
  newTab: {
    combo: 'Command+N',
    keys: ['command', 'n'],
    description: 'Create new Editor Tab.',
    action: null // Placeholder
  },
  closeTab: {
    combo: 'Command+W', // Command should be repleced with OS specific versions.
    keys: ['command', 'w'],
    description: 'Close current editor Tab.',
    action: null // Placeholder
  },
  executeAll: {
    combo: 'Command+E',
    keys: ['command', 'e'],
    description: 'Execute All.',
    action: null // Placeholder
  },
  executeLine: {
    combo: 'Command+Shift+E',
    keys: ['command', 'shift', 'e'],
    description: 'Execute Currently Selected Text / Line',
    action: null // Placeholder
  },
  stopExecution: {
    combo: 'Command+S',
    keys: ['command', 's'],
    description: 'Stop Execution (if running)',
    action: null // Placeholder
  },
  refreshTree: {
    combo: 'Command+Shift+R',
    keys: ['command', 'shift', 'r'],
    description: 'Refresh Tree View (if avaliable)',
    action: null // Placeholder
  }
];

export const TerminalHotkeys = [
  nextCommand: {
    combo: 'Down Arrow', // Standard Linux hotkey.
    keys: ['arrowdown'],
    description: 'Go to the next command in command history.',
    action: null // Placeholder
  },
  previousCommand: {
    combo: 'Up Arrow', // Standard Linux hotkey.
    keys: ['arrowup'],
    description: 'Go to the Previous command in command history.',
    action: null // Placeholder
  },
  sendQuery: {
    combo: 'Enter', // Standard Linux hotkey.
    keys: ['enter'],
    description: 'Send query for execution.',
    action: null // Placeholder
  },
  clearTerminal: {
    combo: 'Ctrl+C',
    keys: ['ctrl', 'c'],
    description: 'Clear the Terminal.',
    action: null // Placeholder
  }
];

export const OutputHotkeys = [
  {
    combo: 'Ctrl+L', // Standard Linux hotkey.
    keys: ['ctrl', 'l'],
    description: 'Clear the Output.',
    action: 'clearOutput', // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+M',
    keys: ['ctrl', 'm'],
    description: 'Show more (if avaliable).',
    action: null // Placeholder
  }
];

export const EditorHotkeys = [
  {
    combo: 'Ctrl+A', // Standard Linux hotkey.
    keys: ['ctrl', 'a'],
    description: 'Move Cursor to start of Line.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+E', // Standard Linux hotkey.
    keys: ['ctrl', 'e'],
    description: 'Move Cursor to end of Line.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+B', // Standard Linux hotkey.
    keys: ['ctrl', 'b'],
    description: 'Move Cursor back one character.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Alt+B', // Standard Linux hotkey.
    keys: ['alt', 'b'],
    description: 'Move Cursor back one word.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+F', // Standard Linux hotkey.
    keys: ['ctrl', 'f'],
    description: 'Move Cursor forward one character.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+D', // Standard Linux hotkey.
    keys: ['ctrl', 'd'],
    description: 'Delete the character under the cursor.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Alt+D', // Standard Linux hotkey.
    keys: ['alt', 'd'],
    description: 'Delete the word under the cursor.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+H', // Standard Linux hotkey.
    keys: ['ctrl', 'h'],
    description: 'Delete the Character before the cursor.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+T', // Standard Linux hotkey.
    keys: ['ctrl', 't'],
    description: 'Swap the last two characters before the cursor.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Ctrl+W', // Standard Linux hotkey.
    keys: ['ctrl', 'w'],
    description: 'Cut the word before the cursor to clipboard.',
    action: null, // In Codemirror by Default.
  },
  {
    combo: 'Command+F',
    keys: ['command', 'f'],
    description: 'Search.',
    action: null, // Placeholder
  },
  {
    combo: 'Command+B',
    keys: ['command', 'b'],
    description: 'Format All.',
    action: null, // Placeholder
  },
  {
    combo: 'Command+Shift+F',
    keys: ['command', 'shift', 'f'],
    description: 'Format Selection',
    action: null, // Placeholder
  },
];

export function getJSXForHotkey(hotkey) {
  return (
    <HotKey
      keys={hotkey.keys}
      simultaneous
      onKeysCoincide={hotkey.action} />
  );
}
