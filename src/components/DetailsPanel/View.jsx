/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-05-22T14:42:47+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-24T12:30:10+10:00
 */


import React from 'react';
import { action } from 'mobx';
import { observer, inject } from 'mobx-react';
import TableField from './Components/TableField';

import './View.scss';

@inject('store')
@observer
export default class DetailsView extends React.Component {
  @action.bound
  close(e) {
    e.preventDefault();
    // const editor = this.props.store.editors.get(
    //   this.props.store.detailsPanel.activeEditorId
    // );
    // this.props.store.editors.set(this.props.store.detailsPanel.activeEditorId, {
    //   ...editor,
    //   detailsView: {visible: false}
    // });
    this.props.store.detailsPanel.activeEditorId = '';
  }
  render() {
    const { title, viewInfo } = this.props;
    const detailsFields = [];
    if (viewInfo && viewInfo.fields.length > 0) {
      for (const field of viewInfo.fields) {
        if (viewInfo.values[field.name]) {
          const fieldData = viewInfo.values[field.name];
          if (field.type == 'Table') {
            detailsFields.push(<TableField key={field.name} field={field} data={fieldData} />);
          }
        }
      }
    }
    return (
      <div className="pt-dark ">
        <h3 className="details-title">{title}</h3>
        <div className="details-fields">
          {detailsFields}
        </div>
        <div className="form-button-panel">
          <button
            className="pt-button pt-intent-primary right-button"
            onClick={this.close}
          >
            Close
          </button>
        </div>
      </div>
    );
  }
}
