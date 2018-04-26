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

/**
 * @Author: mike
 * @Date:   2017-03-28 16:13:50
 * @Last modified by:   mike
 * @Last modified time: 2017-03-28 16:14:04
 */
/* eslint no-unused-vars:warn */

export default {
  /**
   * Getter method for the Event Type Fragments enum,
   * @return {Object} An object containing the different Event Types.
   */
  getTypeEnum() {
    return {
      EVENT: {
        EVENT: 'EVENT',
        APP: {
          OPEN: 'EVENT_APP_OPEN',
          CLOSE: 'EVENT_APP_CLOSE'
        },
        USER_PREFERENCES: {
          TELEMETRY: {
            ENABLED: 'EVENT_USER_PREFERENCES_TELEMTRY_ENABLED',
            DISABLED: 'EVENT_USER_PREFERENCES_TELEMTRY_DISABLED'
          }
        },
        CONNECTION_PANEL: {
          NEW_PROFILE: {
            OPEN_DIALOG: 'EVENT_CONNECTION_NEW_PROFILE_OPEN_DIALOG',
            START: 'EVENT_CONNECTIONS_NEW_PROFILE_START',
            FINISH: 'EVENT_CONNECTIONS_NEW_PROFILE_FINISH',
            FAILED: 'EVENT_CONNECTIONS_NEW_PROFILE_FAILED'
          },
          EDIT_PROFILE: {
            OPEN_DIALOG: 'EVENT_CONNECTION_EDIT_PROFILE_OPEN_DIALOG',
            START: 'EVENT_CONNECTIONS_EDIT_PROFILE_START',
            FINISH: 'EVENT_CONNECTIONS_EDIT_PROFILE_FINISH',
            FAILED: 'EVENT_CONNECTIONS_NEW_PROFILE_FAILED'
          },
          REMOVE_PROFILE: 'EVENT_CONNECTIONS_REMOVE_PROFILE',
          CLOSE_PROFILE: 'EVENT_CONNECTIONS_CLOSE_PROFILE',
          CHANGE_PROFILE_SELECTION: 'EVENT_CONNECTIONS_CHANGE_PROFILE_SELECTION',
          OPEN_CONTEXT_MENU: 'EVENT_CONNECTIONS_OPEN_CONTEXT_MENU'
        },
        OUTPUT_PANEL: {
          SHOW_MORE: {
            START: 'EVENT_OUTPUT_SHOW_MORE_START',
            FINISH: 'EVENT_OUTPUT_SHOW_MORE_FINISH'
          },
          EXECUTE_TERMINAL: {
            START: 'EVENT_OUTPUT_EXECUTE_TERMINAL_START',
            FINISH: 'EVENT_OUTPUT_EXECUTE_TERMINAL_FINISH'
          },
          CLEAR_OUTPUT: 'EVENT_OUTPUT_CLEAR_OUTPUT',
          SAVE_OUTPUT: 'EVENT_OUTPUT_SAVE_OUTPUT'
        },
        EDITOR_PANEL: {
          NEW_EDITOR: {
            START: 'EVENT_EDITOR_NEW_EDITOR_START',
            FINISH: 'EVENT_EDITOR_NEW_EDITOR_FINISH',
            FAILED_DEFAULT: 'EVENT_EDITOR_NEW_EDITOR_FAILED_DEFAULT'
          },
          CLOSE_EDITOR: 'EVENT_EDITOR_CLOSE_EDITOR',
          CHANGE_DROPDOWN: 'EVENT_EDITOR_CHANGE_DROPDOWN',
          CHANGE_ACTIVE_EDITOR: 'EVENT_EDITOR_CHANGE_ACTIVE',
          CHANGE_FILTER: 'EVENT_EDITOR_CHANGE_FILTER',
          LINTING_WARNING: 'EVENT_EDITOR_LINT_WARNINGS',
          TOOLBAR: {
            EXECUTE_ALL: {
              START: 'EVENT_EDITOR_TOOLBAR_EXECUTE_ALL_START',
              FINISH: 'EVENT_EDITOR_TOOLBAR_EXECUTE_ALL_FINISH'
            },
            EXECUTE_LINE: {
              START: 'EVENT_EDITOR_TOOLBAR_EXECUTE_LINE_START',
              FINISH: 'EVENT_EDITOR_TOOLBAR_EXECUTE_LINE_FINISH'
            },
            CHANGE_FILTER: 'EVENT_EDITOR_TOOLBAR_CHANGE_FILTER'
          }
        }
      },
      INFO: 'INFO',
      WARNING: 'WARNING',
      ERROR: 'ERROR',
      CRASH: 'CRASH'
    };
  },

  /**
   * Getter method for the UI Fragments enum,
   * @return {Object} An object containing the different UIFragments.
   */
  getFragmentEnum() {
    return {
      EDITORS: 'EDITORS',
      PROFILES: 'PROFILES',
      EDITOR_PANEL: 'EDITOR_PANEL',
      OUTPUT: 'OUTPUTS',
      TREE: 'TREE',
      PREFERENCES: 'PREFERENCES'
    };
  },

  /**
   * Action recording an event generated from another component.
   * @param {String} eventType - The type of event based on the enum described above.
   * @param {String} eventFragment - The UI fragment the event is associated with.
   * @param {String} eventMessage - The Message associated with the event.
   */
  recordManualEvent(eventType, eventFragment, eventMessage) {
    const currentDate = new Date();
    let offset = currentDate.getTimezoneOffset() / 60;
    if (offset > 0) {
      offset = 'UTC -' + Math.abs(offset);
    } else {
      offset = 'UTC +' + Math.abs(offset);
    }
    const dateTime =
      currentDate.getDate() +
      '/' +
      (currentDate.getMonth() + 1) +
      '/' +
      currentDate.getFullYear() +
      ' @ ' +
      currentDate.getHours() +
      ':' +
      currentDate.getMinutes() +
      ':' +
      currentDate.getSeconds() +
      ':' +
      currentDate.getMilliseconds() +
      ' ' +
      offset;
    const data = {
      type: eventType,
      fragment: eventFragment,
      message: eventMessage,
      change: null,
      timestamp: dateTime
    };
  },

  /**
   * Action recording an event from a MobX observer.
   * @param {String} eventType - The type of event based on the enum described above.
   * @param {String} eventFragment - The UI fragment the event is associated with.
   * @param {String} eventMessage - The Message associated with the event.
   * @param {Object} eventChange - The Change event generated by MobX.
   */
  recordEvent(eventType, eventFragment, eventMessage, eventChange) {
    const currentDate = new Date();
    let offset = currentDate.getTimezoneOffset() / 60;
    if (offset > 0) {
      offset = 'UTC-' + Math.abs(offset);
    } else {
      offset = 'UTC+' + Math.abs(offset);
    }
    const dateTime =
      currentDate.getDate() +
      '/' +
      (currentDate.getMonth() + 1) +
      '/' +
      currentDate.getFullYear() +
      ' @ ' +
      currentDate.getHours() +
      ':' +
      currentDate.getMinutes() +
      ':' +
      currentDate.getSeconds() +
      ':' +
      currentDate.getMilliseconds() +
      ' ' +
      offset;
    const data = {
      type: eventType,
      fragment: eventFragment,
      message: eventMessage,
      change: eventChange,
      timestamp: dateTime
    };
  },

  createTimedEvent(eventType, eventFragment, eventMessage, eventChange) {
    const currentDate = new Date();
    let offset = currentDate.getTimezoneOffset() / 60;
    if (offset > 0) {
      offset = 'UTC-' + Math.abs(offset);
    } else {
      offset = 'UTC+' + Math.abs(offset);
    }
    const dateTime =
      currentDate.getDate() +
      '/' +
      (currentDate.getMonth() + 1) +
      '/' +
      currentDate.getFullYear() +
      ' @ ' +
      currentDate.getHours() +
      ':' +
      currentDate.getMinutes() +
      ':' +
      currentDate.getSeconds() +
      ':' +
      currentDate.getMilliseconds() +
      ' ' +
      offset;
    const data = {
      type: eventType,
      fragment: eventFragment,
      message: eventMessage,
      change: eventChange,
      startTimestamp: dateTime,
      endTimestamp: null
    };
    // Placeholder until file API is complete.
    return data;
  },

  recordTimedEvent(event) {
    const currentDate = new Date();
    let offset = currentDate.getTimezoneOffset() / 60;
    if (offset > 0) {
      offset = 'UTC-' + Math.abs(offset);
    } else {
      offset = 'UTC+' + Math.abs(offset);
    }
    const dateTime =
      currentDate.getDate() +
      '/' +
      (currentDate.getMonth() + 1) +
      '/' +
      currentDate.getFullYear() +
      ' @ ' +
      currentDate.getHours() +
      ':' +
      currentDate.getMinutes() +
      ':' +
      currentDate.getSeconds() +
      ':' +
      currentDate.getMilliseconds() +
      ' ' +
      offset;
    event.endTimestamp = dateTime;
  }
};
