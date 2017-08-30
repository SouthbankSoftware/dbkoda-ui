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
 *
 *
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-26T12:18:37+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-28T16:37:43+10:00
 */

import { action, observable, runInAction } from 'mobx';
import { Broker, EventType } from '~/helpers/broker';
import { ProfileStatus } from '#/common/Constants';

import { NewToaster } from '#/common/Toaster';
import { Intent } from '@blueprintjs/core';
import StaticApi from './static';

export default class OutputApi {
  store;
  api;
  outputHash;

  constructor(store, api) {
    this.store = store;
    this.api = api;
    this.outputHash = {};

    this.init = this.init.bind(this);
    this.configureOutputs = this.configureOutputs.bind(this);
  }

  init() {
    this.configureOutputs();
  }

  configureOutputs() {
    this.store.editors.entries().map((editor) => {
      this.addOutput(editor[1]);
    });
  }

  @action.bound
  addOutput(editor) {
    this.outputHash[editor.profileId + '|' + editor.shellId] = editor.id;

    try {
      if (this.store.outputs.get(editor.id)) {
        this.store.outputs.get(editor.id).cannotShowMore = true;
        this.store.outputs.get(editor.id).showingMore = false;
        if (
          editor.id != 'Default' &&
          this.store.outputs.get(editor.id).output
        ) {
          this.store.outputs.get(editor.id).output += globalString(
            'output/editor/restoreSession',
          );
        }
      } else {
        console.log(`create new output for ${editor.id}`);
        const editorTitle = editor.alias + ' (' + editor.fileName + ')';
        this.store.outputs.set(
          editor.id,
          observable({
            id: editor.id,
            connId: editor.currentProfile,
            shellId: editor.shellId,
            title: editorTitle,
            output: '',
            cannotShowMore: true,
            showingMore: false,
            commandHistory: [],
            enhancedJson: '',
            tableJson: '',
          }),
        );

        if (editor.initialMsg && editor.id != 'Default') {
          let tmp = editor.initialMsg;
          tmp = tmp.replace(/^\n/gm, '');
          tmp = tmp.replace(/^\r/gm, '');
          tmp = tmp.replace(/^\r\n/gm, '');
          this.store.outputs.get(editor.id).output += tmp;
        }
      }
    } catch (err) {
      console.log(err);
    }

    Broker.on(
      EventType.createShellOutputEvent(editor.profileId, editor.shellId),
      this.outputAvailable,
    );
    Broker.on(
      EventType.createShellReconnectEvent(editor.profileId, editor.shellId),
      this.onReconnect,
    );
  }

  @action.bound
  removeOutput(editor) {
    this.store.outputs.delete(editor.id);
    delete this.outputHash[editor.profileId + '|' + editor.shellId];
    Broker.removeListener(
      EventType.createShellOutputEvent(editor.profileId, editor.shellId),
      this.outputAvailable,
    );
    Broker.removeListener(
      EventType.createShellReconnectEvent(editor.profileId, editor.shellId),
      this.onReconnect,
    );
  }

  @action.bound
  swapOutputShellConnection(event) {
    const { oldId, oldShellId, id, shellId } = event;

    const outputId = this.outputHash[oldId + '|' + oldShellId];
    delete this.outputHash[oldId + '|' + oldShellId];
    Broker.removeListener(
      EventType.createShellOutputEvent(oldId, oldShellId),
      this.outputAvailable,
    );
    Broker.removeListener(
      EventType.createShellReconnectEvent(oldId, oldShellId),
      this.onReconnect,
    );

    this.outputHash[id + '|' + shellId] = outputId;

    Broker.on(
      EventType.createShellOutputEvent(id, shellId),
      this.outputAvailable,
    );
    Broker.on(
      EventType.createShellReconnectEvent(id, shellId),
      this.onReconnect,
    );
  }

  @action.bound
  outputAvailable(output) {
    // Parse output for string 'Type "it" for more'
    const outputId = this.outputHash[output.id + '|' + output.shellId];

    // console.log(outputId);
    // console.log('TEST OUTPUT: =>> ', output.output);

    const totalOutput = this.store.outputs.get(outputId).output + output.output;
    const profile = this.store.profiles.get(output.id);
    if (profile && profile.status !== ProfileStatus.OPEN) {
      // the connection has been closed.
      return;
    }
    this.store.outputs.get(outputId).output = totalOutput;
    if (
      output &&
      output.output &&
      output.output.replace(/^\s+|\s+$/g, '').includes('Type "it" for more')
    ) {
      console.log('can show more');
      if (this.store.outputs.get(outputId)) {
        this.store.outputs.get(outputId).cannotShowMore = false;
      }
    } else if (
      this.store.outputs.get(outputId) &&
      this.store.outputs.get(outputId).cannotShowMore &&
      output &&
      output.output &&
      output.output.replace(/^\s+|\s+$/g, '').endsWith('dbkoda>')
    ) {
      console.log('cannot show more');
      this.store.outputs.get(outputId).cannotShowMore = true;
    }
  }

  @action.bound
  onReconnect(output) {
    const outputId = this.outputHash[output.id + '|' + output.shellId];
    console.log('got reconnect output ', output);
    const combineOutput = output.output.join('\r');
    const totalOutput = this.store.outputs.get(outputId).output + combineOutput;
    this.store.outputs.get(outputId).output = totalOutput;
  }

  @action.bound
  initJsonView(jsonStr, outputId, displayType, lines) {
    const tabPrefix =
      displayType === 'enhancedJson' ? 'EnhancedJson-' : 'TableView-';
    if (this.store.outputPanel.currentTab.indexOf(tabPrefix)) {
      this.store.outputPanel.currentTab =
        tabPrefix + this.store.outputPanel.currentTab;
    }
    StaticApi.parseShellJson(jsonStr).then(
      (result) => {
        runInAction(() => {
          this.store.outputs.get(outputId)[displayType] = {
            json: result,
            firstLine: lines.start,
            lastLine: lines.end,
          };
        });
      },
      (error) => {
        runInAction(() => {
          NewToaster.show({
            message:
              globalString('output/editor/parseJsonError') +
              error.substring(0, 50),
            intent: Intent.DANGER,
            icon: '',
          });
          this.store.outputPanel.currentTab = this.store.outputPanel.currentTab.split(
            tabPrefix,
          )[1];
        });
      },
    );
  }
}
