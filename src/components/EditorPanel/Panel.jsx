/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-05T14:22:40+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-22T18:02:34+11:00
 *
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

/* eslint-disable react/no-string-refs, jsx-a11y/no-static-element-interactions */
import React from 'react';
import { inject, observer, PropTypes } from 'mobx-react';
import { action, reaction, runInAction } from 'mobx';
import SplitPane from 'react-split-pane';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import {
  Button,
  Tabs,
  Tab,
  Intent,
  ContextMenu,
  Menu,
  MenuItem,
  Dialog,
  AnchorButton
} from '@blueprintjs/core';
import _ from 'lodash';
import addTooltip from '#/hoc/addTooltip';
import { GlobalHotkeys, DialogHotkeys } from '#/common/hotkeys/hotkeyList';
import FilterList from '#/common/FilterList';
import { EditorTypes, DrawerPanes } from '#/common/Constants';
import findElementAttributeUpward from '~/helpers/findElementAttributeUpward';
import { AggregateGraphicalBuilder } from '../AggregateViews';
import Toolbar from './Toolbar';
import View from './View';
import './Panel.scss';
import WelcomeView from './WelcomePanel/WelcomeView';
import { ConfigView } from './ConfigPanel';

const splitPane2Style = {
  display: 'flex',
  flexDirection: 'column'
};

/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject(allStores => ({
  store: allStores.store,
  api: allStores.api,
  config: allStores.config,
  profileStore: allStores.profileStore
}))
@observer
export default class Panel extends React.Component {
  reactions = [];

  static propTypes = {
    store: PropTypes.observableObject.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      activePanelOnly: false,
      animate: false,
      vertical: false
    };

    this.newEditor = this.newEditor.bind(this);
    this.closeTab = this.closeTab.bind(this);
    this.closeActiveTab = this.closeActiveTab.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
    this.onTabScrollLeftBtnClicked = this.onTabScrollLeftBtnClicked.bind(this);
    this.onTabScrollRightBtnClicked = this.onTabScrollRightBtnClicked.bind(this);
    this.onTabListBtnClicked = this.onTabListBtnClicked.bind(this);
    this.showArrows = false;
    this.updateShowArrows();

    this.reactions.push(
      reaction(
        () => this.props.store.profileList.selectedProfile,
        () => {
          if (!this.props.store.profileList.selectedProfile) return;

          if (
            this.props.store.profileList.selectedProfile.id ==
            this.props.store.editorPanel.activeDropdownId
          ) {
            return;
          }
          let curEditor;
          if (this.props.store.editorPanel.activeEditorId != 'Default') {
            curEditor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);
          }

          if (
            curEditor &&
            curEditor.currentProfile == this.props.store.profileList.selectedProfile.id
          ) {
            // @TODO -> Refactor and remove this wasted conditional.
          } else {
            const editors = this.props.store.editors.entries();
            for (const editor of editors) {
              if (editor[1].currentProfile == this.props.store.profileList.selectedProfile.id) {
                this.changeTab(editor[1].id);
                return;
              }
            }
            if (
              this.props.store.editorToolbar.newEditorForProfileId == '' &&
              this.props.store.profileList.selectedProfile.status == 'OPEN'
            ) {
              this.props.store.editorToolbar.newEditorForProfileId = this.props.store.profileList.selectedProfile.id;
            }
          }
        }
      )
    );

    this.reactions.push(
      reaction(
        () => this.props.store.editorPanel.shouldScrollToActiveTab,
        shouldScrollToActiveTab => {
          const { editorPanel } = this.props.store;

          if (shouldScrollToActiveTab) {
            editorPanel.shouldScrollToActiveTab = false;

            // scroll to active tab
            const el = document.getElementById(
              `pt-tab-title_EditorTabs_${editorPanel.activeEditorId}`
            );
            this.scrollToTab(this.getElementScrollRightTargetPosition.bind(this, el));
          }
        },
        {
          delay: 100
        }
      )
    );
  }

  componentDidMount() {
    this.restoreTabScrollLeftPosition();
    // Add hotkey bindings for this component:
    Mousetrap.bindGlobal(GlobalHotkeys.closeTab.keys, this.closeActiveTab);
  }

  componentWillUnmount() {
    this.saveTabScrollLeftPosition();
    _.forEach(this.reactions, r => r());
    Mousetrap.unbindGlobal(GlobalHotkeys.closeTab.keys, this.closeActiveTab);
  }

  @action
  saveTabScrollLeftPosition() {
    this.props.store.editorPanel.tabScrollLeftPosition = this.tabs.tablistElement.scrollLeft;
  }

  restoreTabScrollLeftPosition() {
    if (this.tabs) {
      this.tabs.tablistElement.scrollLeft = this.props.store.editorPanel.tabScrollLeftPosition;
    }
  }

  /**
   * DEPRECATED? Remove this after refactoring.
   * Action for creating a new editor in the MobX store.
   * @param {String} newId - The id of the newly created Editor tab.
   */
  @action
  newEditor(newId) {
    this.props.store.editorPanel.activeDropdownId = newId;
    this.props.store.editorPanel.activeEditorId = newId;
    this.updateShowArrows();
  }

  /**
   * Action for closing a tab.
   * @param {Object} currEditor - the editor mobx object
   */
  @action
  closeTab(currEditor) {
    this.props.api.removeEditor(currEditor);
    this.updateShowArrows();
    this.forceUpdate();
  }

  /**
   * Action for closing active tab.
   */
  @action
  closeActiveTab() {
    const deletedEditor = this.props.store.editors.get(this.props.store.editorPanel.activeEditorId);

    this.props.api.removeEditor(deletedEditor);

    this.forceUpdate();
  }

  /**
   * Action for closing the welcome Tab
   */
  @action.bound
  closeWelcome() {
    this.props.store.welcomePage.isOpen = false;
    this.props.store.editorPanel.removingTabId = true; // TODO: There shouldn't be an output visible for the welcome page. Have tp replace this logic with this.props.api.removeOutput(deletedEditor);
    if (this.props.store.editorPanel.activeEditorId == 'Default') {
      const editors = [...this.props.store.editors.entries()];
      this.props.store.editorPanel.activeEditorId = editors[0][1].id;
    }
    this.forceUpdate();
  }

  /**
   * Action for closing the config Tab
   */
  @action.bound
  closeConfig() {
    if (this.props.store.configPage.changedFields.length > 0) {
      this.props.store.editorPanel.showingSavingDialogEditorIds.push('Config');
      return;
    }
    this.props.store.configPage.isOpen = false;
    this.props.store.editorPanel.removingTabId = true;
    if (this.props.store.editorPanel.activeEditorId === 'Config') {
      if (this.props.store.welcomePage.isOpen) {
        this.changeTab('Default');
      } else {
        const editors = [...this.props.store.editors.entries()];
        this.props.store.editorPanel.activeEditorId = editors[0][1].id;
      }
    }
    this.forceUpdate();
  }

  /**
   * Action for swapping the currently selected tab.
   * @param {String} newTabId - Id of tab to swap to active.
   */
  @action
  changeTab(newTabId) {
    const { editorPanel, editorToolbar, editors } = this.props.store;
    let currEditor = editors.get(newTabId);
    // An unknown bug causes changeTab('Config') to be called after Config tab is closed.
    if (newTabId === 'Config' && !this.props.store.configPage.isOpen) {
      return;
    }
    // Condition specific to closing welcome tab
    if (editorPanel.removingTabId) {
      editorPanel.removingTabId = false;
      if (editorPanel.isRemovingCurrentTab) {
        editorPanel.isRemovingCurrentTab = false;
      }
      // Condition where you close the welcome tab and it should focus any other open tab
      if (!currEditor && editors.get(editorPanel.activeEditorId)) {
        currEditor = editors.get(editorPanel.activeEditorId);
        newTabId = editorPanel.activeEditorId;
      }
    }
    if (newTabId != 'Default' && newTabId != 'Config') {
      // Condition where you close a tab and any other open tab should be selected
      if (!currEditor && editors.get(editorPanel.activeEditorId)) {
        currEditor = editors.get(editorPanel.activeEditorId);
        newTabId = editorPanel.activeEditorId;
      } else if (!currEditor && !editors.get(editorPanel.activeEditorId)) {
        // Condition where you have closed the last open tab and welcome tab should be selected
        newTabId = 'Default';
      }
    }

    editorPanel.activeEditorId = newTabId;

    if (newTabId != 'Default' && editors.get(newTabId) && editors.get(newTabId).executing == true) {
      editorToolbar.isActiveExecuting = true;
    } else {
      editorToolbar.isActiveExecuting = false;
    }
    if (newTabId != 'Default' && newTabId != 'Config') {
      editorPanel.activeDropdownId = currEditor.currentProfile;
      // Check if connection exists or is closed to update dropdown.
      if (!this.props.profileStore.profiles.get(editorPanel.activeDropdownId)) {
        editorPanel.activeDropdownId = 'Default';
      } else if (
        this.props.profileStore.profiles.get(editorPanel.activeDropdownId).status == 'CLOSED'
      ) {
        editorPanel.activeDropdownId = 'Default';
      }
      editorToolbar.id = currEditor.id;
      editorToolbar.shellId = currEditor.shellId;
    } else {
      editorPanel.activeDropdownId = 'Default';
    }
    if (editorPanel.activeDropdownId == 'Default' || editorPanel.activeDropdownId == 'Config') {
      editorToolbar.noActiveProfile = true;
    } else {
      editorToolbar.noActiveProfile = false;
    }

    // Determine whether Left-Side Panel should swap.
    if (!currEditor && editorPanel.activeDropdownId == 'Default') {
      // Default Tab.
      this.props.store.drawer.drawerChild = DrawerPanes.DEFAULT;
    } else if (!currEditor && editorPanel.activeDropdownId === 'Config') {
      this.props.store.drawer.drawerChild = DrawerPanes.DEFAULT;
    } else if (currEditor.type == EditorTypes.DEFAULT) {
      // Normal Editors
      this.props.store.drawer.drawerChild = DrawerPanes.DEFAULT;
    } else if (currEditor.type == EditorTypes.AGGREGATE) {
      // Aggregate Editors.
      this.props.store.drawer.drawerChild = DrawerPanes.AGGREGATE;
    } else {
      // Default Case.
      this.props.store.drawer.drawerChild = DrawerPanes.DEFAULT;
    }
  }

  /**
   * Action for handling a drop event from a drag-and-drop action.
   * @param {Object} item - The item being dropped.
   */
  @action
  handleDrop(item) {
    this.props.store.dragItem.item = item;
    if (!this.props.store.dragItem.dragDrop) {
      this.props.store.dragItem.dragDrop = true;
    } else {
      this.props.store.dragItem.dragDrop = false;
      const setDragDropTrueLater = () => {
        // This hack is done to fix the state in case of exception where the value is preserved as true while it is not draging
        runInAction('set drag drop to true', () => {
          this.props.store.dragItem.dragDrop = true;
        });
      };
      setTimeout(setDragDropTrueLater, 500);
    }
  }

  /**
   * Close all tabs except for the provided tab id
   * @param {String} tabIdToKeep - The id string of the editor to keep (optional)
   */
  @action.bound
  closeTabs(tabIdToKeep) {
    for (const [id, editor] of this.props.store.editors.entries()) {
      if (id !== tabIdToKeep) {
        this.closeTab(editor);
      }
    }
  }

  /**
   *  Close all tabs to the left of the current tab
   *  @param {String} currentTabId - The id of the leftmost tab that will stay open
   */
  closeLeft(currentTabId) {
    for (const [id, editor] of this.props.store.editors.entries()) {
      if (id !== currentTabId) {
        this.closeTab(editor);
      } else {
        break;
      }
    }
  }

  /**
   *  Close all tabs to the right of the current tab
   *  @param {String} currentTabId - The id of the rightmost tab that will stay open
   */
  closeRight(currentTabId) {
    let startClosing = false;
    for (const [id, editor] of this.props.store.editors.entries()) {
      if (id !== currentTabId) {
        if (startClosing) this.closeTab(editor);
      } else {
        startClosing = true;
      }
    }
  }

  /** Display a right click menu when any of the editor tabs are right clicked
   *  @param {SyntheticMouseEvent} event - mouse click event from onContextMenu
   */
  showContextMenu(event) {
    const { target } = event;
    const tabId = findElementAttributeUpward(target, 'data-tab-id');

    if (tabId && tabId !== 'Default') {
      const currentEditor = this.props.store.editors.get(tabId);

      ContextMenu.show(
        <Menu className="editorTabContentMenu">
          <div className="menuItemWrapper closeTabItem">
            <MenuItem
              onClick={() => {
                tabId === 'Default' ? this.closeWelcome() : this.closeTab(currentEditor);
              }}
              text={globalString('editor/tabMenu/closeTab')}
              icon="pt-icon-small-cross"
              intent={Intent.NONE}
            />
          </div>
          <div className="menuItemWrapper closeOtherItem">
            <MenuItem
              onClick={() => this.closeTabs(tabId)}
              text={globalString('editor/tabMenu/closeOtherTabs')}
              icon="pt-icon-cross"
              intent={Intent.NONE}
            />
          </div>
          <div className="menuItemWrapper closeAllItem">
            <MenuItem
              onClick={() => this.closeTabs()}
              text={globalString('editor/tabMenu/closeAllTabs')}
              icon="pt-icon-key-delete"
              intent={Intent.NONE}
            />
          </div>
          <div className="menuItemWrapper closeLeftItem">
            <MenuItem
              onClick={() => {
                this.closeLeft(tabId);
              }}
              text={globalString('editor/tabMenu/closeLeft')}
              icon="pt-icon-chevron-left"
              intent={Intent.NONE}
            />
          </div>
          <div className="menuItemWrapper closeRightItem">
            <MenuItem
              onClick={() => {
                this.closeRight(tabId);
              }}
              text={globalString('editor/tabMenu/closeRight')}
              icon="pt-icon-chevron-right"
              intent={Intent.NONE}
            />
          </div>
        </Menu>,
        {
          left: event.clientX,
          top: event.clientY
        }
      );
    }
  }

  @action.bound
  renderWelcomeOld() {
    if (this.props.store.editors.size == 0) {
      return (
        <Tab
          className="welcomeTab"
          id="Default"
          title={globalString('editor/home/title')}
          panel={<WelcomeView />}
        />
      );
    }
    return (
      <Tab
        className={this.props.store.welcomePage.isOpen ? 'welcomeTab' : 'welcomeTab notVisible'}
        id="Default"
        title={globalString('editor/home/title')}
        panel={<WelcomeView />}
      >
        <Button className="pt-minimal" onClick={this.closeWelcome}>
          <span className="pt-icon-cross" />
        </Button>
      </Tab>
    );
  }

  @action.bound
  renderWelcome() {
    if (this.props.store.editors.size == 0) {
      return (
        <Tab
          className="configTab"
          id="Default"
          title={globalString('editor/home/title')}
          panel={<ConfigView title={globalString('editor/config/heading')} />}
        />
      );
    }
    return (
      <Tab
        className={this.props.store.welcomePage.isOpen ? 'welcomeTab' : 'welcomeTab notVisible'}
        id="Default"
        title={globalString('editor/welcome/heading')}
        panel={<ConfigView title={globalString('editor/config/heading')} />}
      >
        <Button className="pt-minimal" onClick={this.closeWelcome}>
          <span className="pt-icon-cross" />
        </Button>
      </Tab>
    );
  }

  @action.bound
  onSavingDialogSaveButtonClicked(unbindGlobalKeys, currentEditor) {
    this.onSavingDialogCancelButtonClicked(unbindGlobalKeys);
    if (!currentEditor) {
      const { configPage } = this.props.store;
      const { newSettings } = configPage;
      const { patch } = this.props.config;

      configPage.changedFields.clear();
      this.closeConfig();
      patch(newSettings);
    } else {
      this.toolbar.wrappedInstance
        .saveFile()
        .then(() => {
          this.closeTab(currentEditor);
        })
        .catch(e => {
          if (e) {
            l.error(e);
          }
        });
    }
  }

  @action.bound
  onSavingDialogCancelButtonClicked(unbindGlobalKeys) {
    unbindGlobalKeys();
    this.props.store.editorPanel.showingSavingDialogEditorIds.shift();
  }

  @action.bound
  onSavingDialogDontSaveButtonClicked(unbindGlobalKeys, currentEditor) {
    this.onSavingDialogCancelButtonClicked(unbindGlobalKeys);
    if (!currentEditor) {
      const { configPage } = this.props.store;

      configPage.changedFields.clear();
      this.closeConfig();
    } else {
      currentEditor.doc.markClean();
      this.closeTab(currentEditor);
    }
  }

  renderSavingDialog() {
    const {
      editorPanel: { showingSavingDialogEditorIds },
      editors
    } = this.props.store;
    const currentEditor = editors.get(showingSavingDialogEditorIds[0]);

    let unbindGlobalKeys;

    const onSavingDialogSaveButtonClicked = () =>
      this.onSavingDialogSaveButtonClicked(unbindGlobalKeys, currentEditor);
    const onSavingDialogCancelButtonClicked = () =>
      this.onSavingDialogCancelButtonClicked(unbindGlobalKeys);
    const onSavingDialogDontSaveButtonClicked = () =>
      this.onSavingDialogDontSaveButtonClicked(unbindGlobalKeys, currentEditor);

    Mousetrap.bindGlobal(DialogHotkeys.submitDialog.keys, onSavingDialogSaveButtonClicked);
    Mousetrap.bindGlobal(DialogHotkeys.closeDialog.keys, onSavingDialogCancelButtonClicked);

    unbindGlobalKeys = () => {
      Mousetrap.unbindGlobal(DialogHotkeys.submitDialog.keys, onSavingDialogSaveButtonClicked);
      Mousetrap.unbindGlobal(DialogHotkeys.closeDialog.keys, onSavingDialogCancelButtonClicked);
    };

    return (
      <Dialog
        className="pt-dark savingDialog"
        intent={Intent.PRIMARY}
        isOpen
        title={globalString('editor/savingDialog/title', this.getEditorTitle(currentEditor))}
        onClose={onSavingDialogCancelButtonClicked}
      >
        <div className="dialogContent">
          <p> {globalString('editor/savingDialog/message')} </p>
        </div>
        <div className="dialogButtons">
          <AnchorButton
            className="saveButton"
            intent={Intent.SUCCESS}
            text={globalString('editor/savingDialog/save')}
            onClick={onSavingDialogSaveButtonClicked}
          />
          <AnchorButton
            className="cancelButton"
            intent={Intent.PRIMARY}
            text={globalString('editor/savingDialog/cancel')}
            onClick={onSavingDialogCancelButtonClicked}
          />
          <AnchorButton
            className="dontSaveButton"
            intent={Intent.DANGER}
            text={globalString('editor/savingDialog/dontSave')}
            onClick={onSavingDialogDontSaveButtonClicked}
          />
        </div>
      </Dialog>
    );
  }

  renderUnsavedFileIndicator(id) {
    return <div id={`unsavedFileIndicator_${id}`} className="unsavedFileIndicator" />;
  }

  _isScrollPosEqual(pos1, pos2, accuracy = 1) {
    return Math.abs(pos1 - pos2) < accuracy;
  }

  onTabScrollLeftBtnClicked() {
    const tabListEl = this.tabs.tablistElement;
    const currTabEl = this.getCurrentVisibleLeftmostTabElement();
    const getCurrTabTargetPos = this.getElementScrollLeftTargetPosition.bind(this, currTabEl);

    if (this._isScrollPosEqual(tabListEl.scrollLeft, getCurrTabTargetPos(), 5)) {
      const prevTabEl = currTabEl.previousSibling;
      if (prevTabEl) {
        this.scrollToTab(this.getElementScrollLeftTargetPosition.bind(this, prevTabEl));
      }
    } else {
      this.scrollToTab(getCurrTabTargetPos);
    }
  }

  onTabScrollRightBtnClicked() {
    const tabListEl = this.tabs.tablistElement;
    const currTabEl = this.getCurrentVisibleRightmostTabElement();
    const getCurrTabTargetPos = this.getElementScrollRightTargetPosition.bind(this, currTabEl);

    if (this._isScrollPosEqual(tabListEl.scrollLeft, getCurrTabTargetPos(), 5)) {
      const nextTabEl = currTabEl.nextSibling;
      if (nextTabEl) {
        this.scrollToTab(this.getElementScrollRightTargetPosition.bind(this, nextTabEl));
      }
    } else {
      this.scrollToTab(getCurrTabTargetPos);
    }
  }

  onTabListBtnClicked() {
    const { editors, editorPanel } = this.props.store;

    const tabList = (
      <FilterList
        items={[...editors.values()]}
        getItemTitle={this.getEditorTitle}
        getItemId={item => item.id}
        onClick={item => {
          ContextMenu.hide();

          runInAction('Change active tab and scroll to it', () => {
            editorPanel.shouldScrollToActiveTab = true;
          });
          this.changeTab(item.id);
        }}
      />
    );
    const btnEl = this.tabListBtn.getBoundingClientRect();

    ContextMenu.show(tabList, {
      left: btnEl.left + btnEl.width / 2,
      top: btnEl.top + btnEl.height
    });
  }

  getElementScrollLeftTargetPosition(el) {
    return Math.min(el.offsetLeft, this.getScrollLeftMax());
  }

  getElementScrollRightTargetPosition(el) {
    const tabListEl = this.tabs.tablistElement;

    return Math.max(
      0,
      Math.min(
        el.offsetLeft + el.offsetWidth - tabListEl.clientWidth,
        this.getScrollLeftMax(tabListEl)
      )
    );
  }

  @action
  updateTabScrollPosition() {
    const { editorPanel } = this.props.store;

    if (editorPanel.shouldScrollToActiveTab) {
      editorPanel.shouldScrollToActiveTab = false;

      // scroll to active tab
      const el = document.getElementById(`pt-tab-title_EditorTabs_${editorPanel.activeEditorId}`);
      this.scrollToTab(this.getElementScrollRightTargetPosition.bind(this, el));
    }
  }

  /**
   * Scroll to target tab with ease-in/out animation
   */
  scrollToTab(getTargetPos, scrollDuration = 200) {
    const el = this.tabs.tablistElement;
    const targetPos = getTargetPos();

    if (this._isScrollPosEqual(el.scrollLeft, targetPos)) return;

    const cosParameter = (el.scrollLeft - targetPos) / 2;
    let scrollCount = 0;
    let oldTimestamp = performance.now();

    const step = newTimestamp => {
      const targetPos = getTargetPos();

      scrollCount += Math.PI / (scrollDuration / (newTimestamp - oldTimestamp));

      if (scrollCount >= Math.PI) {
        el.scrollLeft = targetPos;
        return;
      }

      el.scrollLeft = targetPos + Math.round(cosParameter + cosParameter * Math.cos(scrollCount));
      oldTimestamp = newTimestamp;

      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  getTabTitleContainerElementFromPoint(x: number, y: number): HTMLElement {
    let target = document.elementFromPoint(x, y);
    while (target && target.getAttribute('role') !== 'tab') {
      target = target.parentElement;
    }
    return target;
  }

  getCurrentVisibleLeftmostTabElement() {
    const rect = this.tabScrollLeftBtn.getBoundingClientRect();
    return this.getTabTitleContainerElementFromPoint(rect.left + rect.width + 2, rect.top + 2);
  }

  getScrollLeftMax(tabListEl = this.tabs.tablistElement) {
    // tabListEl.clientWidth is the scrollable area width
    return tabListEl.scrollWidth - tabListEl.clientWidth;
  }

  getCurrentVisibleRightmostTabElement() {
    const tabListEl = this.tabs.tablistElement;

    if (this._isScrollPosEqual(tabListEl.scrollLeft, this.getScrollLeftMax(tabListEl))) {
      return tabListEl.lastChild;
    }

    const rect = this.tabScrollRightBtn.getBoundingClientRect();
    return this.getTabTitleContainerElementFromPoint(rect.left - 1, rect.top + 2);
  }

  getEditorTitle = editor => {
    const {
      api: { getEditorDisplayName }
    } = this.props;
    if (!editor) {
      return 'Preferences';
    }
    return editor.alias + ' (' + getEditorDisplayName(editor) + ')';
  };

  /**
   * Render the configuration/preferences window
   */
  @action.bound
  renderConfigTab() {
    return (
      <Tab
        className="configTab"
        id="Config"
        title={globalString('editor/config/heading')}
        panel={<ConfigView title={globalString('editor/config/heading')} />}
      >
        <Button className="pt-minimal" onClick={this.closeConfig}>
          <span className="pt-icon-cross" />
        </Button>
      </Tab>
    );
  }

  TabHeader = observer(
    addTooltip(({ editor }) => editor.path)(({ editor, editorTitle }) => (
      <div>
        {editorTitle}
        {this.renderUnsavedFileIndicator(editor.id)}
        <Button className="pt-minimal" onClick={() => this.closeTab(editor)}>
          <span className="pt-icon-cross" />
        </Button>
      </div>
    ))
  );

  // Encapsulation for rendering a standard Mongo Shell Tab in the Editor Panel.
  renderShellTab([id, editorObj], tabClassName, editorTitle) {
    return (
      <Tab
        className={'editorTab visible ' + tabClassName}
        key={id}
        id={id}
        title={<this.TabHeader editor={editorObj} editorTitle={editorTitle} />}
        panel={
          <View
            id={id}
            title={editorTitle}
            onDrop={item => this.handleDrop(item)}
            editor={editorObj}
            ref="defaultEditor"
          />
        }
      />
    );
  }

  // Encapsulation for rendering an Aggregate Tab in the Editor Panel.
  renderAggregateTab([id, editorObj], tabClassName, editorTitle) {
    return (
      <Tab
        className={'editorTab aggregateTab visible ' + tabClassName}
        key={id}
        id={id}
        title={<this.TabHeader editor={editorObj} editorTitle={editorTitle} />}
        panel={
          <div className="aggregateTabInnerWrapper">
            <SplitPane
              className="LeftSplitPane"
              split="vertical"
              defaultSize={500}
              minSize={250}
              maxSize={750}
              pane2Style={splitPane2Style}
            >
              <AggregateGraphicalBuilder className="aggregatePanel" id={id} editor={editorObj} />
              <View
                id={id}
                className="aggregateEditorPanel"
                title={editorTitle}
                onDrop={item => this.handleDrop(item)}
                editor={editorObj}
                ref="defaultEditor"
              />
            </SplitPane>
          </div>
        }
      />
    );
  }

  /**
   * Determine if the scroll arrows should be shown based on the width of the scrollable area
   *   scrollWidth - scrollable area's width
   *   clientWidth - width of the area that contains the scrollable area
   */
  updateShowArrows() {
    setTimeout(() => {
      const newShowArrows =
        this.tabs && this.tabs.tablistElement.scrollWidth > this.tabs.tablistElement.clientWidth;
      if (newShowArrows !== this.showArrows) {
        this.showArrows = newShowArrows;
        this.forceUpdate();
      }
    }, 0);
  }

  /**
   * Action for rendering the component.
   */
  render() {
    this.updateShowArrows();
    const editors = [...this.props.store.editors.entries()];
    return (
      <div className="pt-dark editorPanel" onContextMenu={this.showContextMenu}>
        <Toolbar
          ref={ref => (this.toolbar = ref)}
          executeAll={this.executeAll}
          newEditor={this.newEditor}
        />
        <Tabs
          ref={ref => (this.tabs = ref)}
          id="EditorTabs"
          className={this.showArrows ? 'editorTabView showArrows' : 'editorTabView'}
          renderActiveTabPanelOnly={false}
          animate={this.state.animate}
          onChange={this.changeTab}
          selectedTabId={this.props.store.editorPanel.activeEditorId}
        >
          {this.renderWelcome()}
          {editors.map(editor => {
            const [, editorObj] = editor;
            const tabClassName = editorObj.alias.replace(/[\. ]/g, '');
            const editorTitle = this.getEditorTitle(editorObj);
            let comp;
            switch (editorObj.type) {
              case 'aggregate':
                comp = this.renderAggregateTab(editor, tabClassName, editorTitle);
                break;
              default:
                comp = this.renderShellTab(editor, tabClassName, editorTitle);
            }
            return comp;
          })}
        </Tabs>
        {this.showArrows && (
          <div
            ref={ref => (this.tabScrollLeftBtn = ref)}
            className="pt-icon-caret-left tabControlBtn tabScrollLeftBtn"
            onClick={this.onTabScrollLeftBtnClicked}
          />
        )}
        {this.showArrows && (
          <div
            ref={ref => (this.tabScrollRightBtn = ref)}
            className="pt-icon-caret-right tabControlBtn tabScrollRightBtn"
            onClick={this.onTabScrollRightBtnClicked}
          />
        )}
        <div
          ref={ref => (this.tabListBtn = ref)}
          className="pt-icon-menu tabControlBtn tabListBtn"
          onClick={this.onTabListBtnClicked}
        />
        {this.props.store.editorPanel.showingSavingDialogEditorIds.length > 0
          ? this.renderSavingDialog()
          : null}
      </div>
    );
  }
}
