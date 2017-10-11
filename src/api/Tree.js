/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-31T14:53:10+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-23T12:06:01+10:00
 */

import { action } from 'mobx';
import { Broker, EventType } from '~/helpers/broker';
import { featherClient } from '~/helpers/feathers';

export default class TreeApi {
  store;
  api;

  constructor(store, api) {
    this.store = store;
    this.api = api;
  }

  @action.bound
  addNewEditorForTreeAction = (options = { type: 'TreeAction' }) => {
    this.store.editorToolbar.newEditorForTreeAction = true;
    this.api.addEditor({ type: options.type });
  };

  @action.bound
  openNewTableViewForCollection(targetData, limit) {
    // Set up broken to listen on result.
    const editor = this.store.editors.get(
      this.store.editorPanel.activeEditorId,
    );
    this.store.outputs.get(editor.id).tableJson.collection =
      targetData.collection;
    this.store.outputs.get(editor.id).tableJson.database = targetData.database;
    Broker.on(
      EventType.createAggregatorResultReceived(editor.id + '_table'),
      this._onAggregatorResultReceived,
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
        options: { allowDiskUse: true },
      })
      .catch(this._handleError);
    // Render Table:
    this.api.outputApi.createJSONTableViewFromJSONArray(
      [{ loading: 'isLoading' }],
      editor.id,
    );
  }

  @action.bound
  _onAggregatorResultReceived(result) {
    const editor = this.store.editors.get(
      this.store.editorPanel.activeEditorId,
    );

    this.api.outputApi.createJSONTableViewFromJSONArray(result, editor.id);

    Broker.off(
      EventType.createAggregatorResultReceived(editor.id + '_table'),
      this._onAggregatorResultReceived,
    );
  }

  @action.bound
  _handleError(error) {
    console.error(error);
  }
}
