/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-31T14:53:10+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-21T12:36:54+10:00
 */

import { action } from 'mobx';
import { Broker, EventType } from '~/helpers/broker';
import { featherClient } from '~/helpers/feathers';
import { EditorTypes, NavPanes } from '#/common/Constants';
import { performancePanelStatuses } from '~/api/PerformancePanel';

export default class TreeApi {
  store;
  api;
  profileStore;

  constructor(store, api, profileStore) {
    this.store = store;
    this.api = api;
    this.profileStore = profileStore;
  }

  @action.bound
  addNewEditorForTreeAction = (options = { type: EditorTypes.TREE_ACTION }) => {
    this.store.editorToolbar.newEditorForTreeAction = true;
    this.api.addEditor({ type: options.type });
  };

  @action.bound
  openNewTableViewForCollection(targetData, limit) {
    // Set up broken to listen on result.
    const editor = this.store.editors.get(this.store.editorPanel.activeEditorId);
    Broker.on(
      EventType.createAggregatorResultReceived(editor.id + '_table'),
      this._onAggregatorResultReceived
    );

    // Send request to Feathers:
    featherClient()
      .service('aggregators')
      .create({
        editorId: editor.id + '_table',
        connectionId: editor.currentProfile,
        database: targetData.database,
        collection: targetData.collection,
        pipeline: [{ $limit: limit }],
        options: { allowDiskUse: true }
      })
      .catch(this._handleError);
    // Render Table:
    this.api.outputApi.createJSONTableViewFromJSONArray(
      [{ loading: 'isLoading' }],
      editor.id,
      targetData
    );
  }

  @action.bound
  _onAggregatorResultReceived(result) {
    const editor = this.store.editors.get(this.store.editorPanel.activeEditorId);
    const output = this.store.outputs.get(editor.id);

    this.api.outputApi.createJSONTableViewFromJSONArray(result, editor.id, {
      collection: output.tableJson.collection,
      database: output.tableJson.database
    });

    Broker.off(
      EventType.createAggregatorResultReceived(editor.id + '_table'),
      this._onAggregatorResultReceived
    );
  }

  @action.bound
  _handleError(error) {
    l.error(error);
  }

  showStorageStatsView = profileId => {
    if (profileId) {
      this.api.transformPerformancePanel(profileId, performancePanelStatuses.external, {
        open: NavPanes.STORAGE_PANEL
      });
    }
  };
}
