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
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-07-05T14:22:40+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-07-26T13:58:34+10:00
 */

/* eslint-disable react/no-string-refs, jsx-a11y/no-static-element-interactions */
import React from 'react';
import { inject, observer, PropTypes } from 'mobx-react';
import { action, reaction, runInAction } from 'mobx';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import {
  Button,
  Tabs2,
  Tab2,
  Intent,
  ContextMenu,
  Menu,
  MenuItem,
  Dialog,
  AnchorButton,
} from '@blueprintjs/core';
import { GlobalHotkeys, DialogHotkeys } from '#/common/hotkeys/hotkeyList';
import FilterList from '#/common/FilterList';
import { DrawerPanes } from '#/common/Constants';
import { AggregateGraphicalBuilder } from '../AggregateViews';
import Toolbar from './Toolbar';
import View from './View';
import './Panel.scss';
import WelcomeView from './WelcomePanel/WelcomeView';
import { ProfileStatus } from '../common/Constants';
import { featherClient } from '../../helpers/feathers';
/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
 @inject(allStores => ({
   store: allStores.store,
   api: allStores.api
 }))
@observer
export default class Panel extends React.Component {
  static propTypes = {
    store: PropTypes.observableObject.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      activePanelOnly: false,
      animate: false,
      vertical: false,
    };

    this.newEditor = this.newEditor.bind(this);
    this.closeTab = this.closeTab.bind(this);
    this.closeActiveTab = this.closeActiveTab.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
    this.onTabScrollLeftBtnClicked = this.onTabScrollLeftBtnClicked.bind(this);
    this.onTabScrollRightBtnClicked = this.onTabScrollRightBtnClicked.bind(
      this,
    );
    this.onTabListBtnClicked = this.onTabListBtnClicked.bind(this);
    this.updateTabScrollPosition = this.updateTabScrollPosition.bind(this);
  }

  componentWillMount() {
    this.reactionToProfile = reaction(
      () => this.props.store.profileList.selectedProfile,
      () => {
        try {
          if (
            this.props.store.profileList.selectedProfile.id ==
            this.props.store.editorPanel.activeDropdownId
          ) {
            console.log(
              'do nothing as the profile might have been swaped by the dropdown.',
            );
            return;
          }
          let curEditor;
          if (this.props.store.editorPanel.activeEditorId != 'Default') {
            curEditor = this.props.store.editors.get(
              this.props.store.editorPanel.activeEditorId,
            );
          }

          if (
            curEditor &&
            curEditor.currentProfile ==
              this.props.store.profileList.selectedProfile.id
          ) {
            console.log('do nothing');
          } else {
            const editors = this.props.store.editors.entries();
            for (const editor of editors) {
              console.log(
                'editor[1].currentProfile :',
                editor[1].currentProfile,
              );
              if (
                editor[1].currentProfile ==
                this.props.store.profileList.selectedProfile.id
              ) {
                this.changeTab(editor[1].id);
                return;
              }
            }
            if (this.props.store.editorToolbar.newEditorForProfileId == '') {
              this.props.store.editorToolbar.newEditorForProfileId = this.props.store.profileList.selectedProfile.id;
            }
          }
        } catch (e) {
          console.log(e);
        }
      },
    );
  }

  componentDidMount() {
    this.restoreTabScrollLeftPosition();
    // Add hotkey bindings for this component:
    Mousetrap.bindGlobal(GlobalHotkeys.closeTab.keys, this.closeActiveTab);
  }

  componentWillUnmount() {
    this.saveTabScrollLeftPosition();
    this.reactionToProfile();
    Mousetrap.unbindGlobal(GlobalHotkeys.closeTab.keys, this.closeActiveTab);
  }

  @action
  saveTabScrollLeftPosition() {
    this.props.store.editorPanel.tabScrollLeftPosition = this.tabs.tablistElement.scrollLeft;
  }

  restoreTabScrollLeftPosition() {
    this.tabs.tablistElement.scrollLeft = this.props.store.editorPanel.tabScrollLeftPosition;
  }

  componentDidUpdate() {
    this.updateTabScrollPosition();
  }

  reactionToProfile;
  /**
   * DEPRECATED? Remove this after refactoring.
   * Action for creating a new editor in the MobX store.
   * @param {String} newId - The id of the newly created Editor tab.
   */
  @action
  newEditor(newId) {
    this.props.store.editorPanel.activeDropdownId = newId;
    this.props.store.editorPanel.activeEditorId = newId;
  }

  /**
   * Action for closing a tab.
   * @param {Object} currEditor - the editor mobx object
   */
  @action
  closeTab(currEditor) {
    // @TODO -> Looks like during it's various reworks this entire function has been broken and stitched back together. Some refactoring needs to occur to ensure that when atab is closed a new tab is selected. @Mike.

    this.props.store.drawer.drawerChild = DrawerPanes.DEFAULT;

    // If Editor is not clean, prompt for save.
    if (!currEditor.doc.isClean()) {
      this.props.store.editorPanel.showingSavingDialog = true;
      return;
    }

    // If the editor has an open shell, close it.
    if (currEditor && currEditor.status == ProfileStatus.OPEN) {
      featherClient()
        .service('/mongo-shells')
        .remove(currEditor.profileId, {
          query: {
            shellId: currEditor.shellId,
          },
        })
        .then(v => console.log('remove shell successfully, ', v))
        .catch(err => console.error('remove shell failed,', err));
    }

    // Check if the editor closing is the currently active editor.
    if (currEditor.id == this.props.store.editorPanel.activeEditorId) {
      this.props.store.editorPanel.isRemovingCurrentTab = true;
      // Check if this is the last tab:
      if (this.props.store.editors.size == 1) {
        // Show and select welcome tab
        this.props.store.welcomePage.isOpen = true;
        this.props.store.editorPanel.activeEditorId = 'Default';
      } else {
        // Show and select first entry in map.
        console.log('1:', this.props.store.editorPanel.activeEditorId);
        this.props.api.removeOutput(currEditor);
        this.props.store.editors.delete(currEditor.id);
        const editors = this.props.store.editors.entries();
        this.props.store.editorPanel.activeEditorId = editors[0][1].id;
        console.log('2:', this.props.store.editorPanel.activeEditorId);

        const treeEditor = this.props.store.treeActionPanel.editors.get(
          currEditor.id,
        );
        if (treeEditor) {
          this.props.store.treeActionPanel.editors.delete(treeEditor.id);
        }
        return;
      }
    } else {
      this.props.store.editorPanel.isRemovingCurrentTab = false;
    }
    this.props.api.removeOutput(currEditor);
    this.props.store.editors.delete(currEditor.id);
    const treeEditor = this.props.store.treeActionPanel.editors.get(
      currEditor.id,
    );
    if (treeEditor) {
      this.props.store.treeActionPanel.editors.delete(treeEditor.id);
    }
    this.forceUpdate();
  }

  /**
   * Action for closing active tab.
   */
  @action
  closeActiveTab() {
    const deletedEditor = this.props.store.editors.get(
      this.props.store.editorPanel.activeEditorId,
    );
    console.log('deleted editor ', deletedEditor);
    if (deletedEditor && deletedEditor.status == ProfileStatus.OPEN) {
      // close the connection
      featherClient()
        .service('/mongo-shells')
        .remove(deletedEditor.profileId, {
          query: {
            shellId: deletedEditor.shellId,
          },
        })
        .then(v => console.log('remove shell successfully, ', v))
        .catch(err => console.error('remove shell failed,', err));
    }

    this.props.store.editorPanel.isRemovingCurrentTab = true;
    // Check if this is the last tab:
    if (this.props.store.editors.size == 1) {
      // Show and select welcome tab
      this.props.store.welcomePage.isOpen = true;
      this.props.store.editorPanel.activeEditorId = 'Default';
    } else {
      // Show and select first entry in map.
      console.log('1:', this.props.store.editorPanel.activeEditorId);
      this.props.api.removeOutput(deletedEditor);
      this.props.store.editors.delete(deletedEditor.id);
      const editors = this.props.store.editors.entries();
      this.props.store.editorPanel.activeEditorId = editors[0][1].id;
      console.log('2:', this.props.store.editorPanel.activeEditorId);

      const treeEditor = this.props.store.treeActionPanel.editors.get(
        deletedEditor.id,
      );
      if (treeEditor) {
        this.props.store.treeActionPanel.editors.delete(treeEditor.id);
      }
      return;
    }

    this.props.api.removeOutput(deletedEditor);
    this.props.store.editors.delete(deletedEditor.id);

    const treeEditor = this.props.store.treeActionPanel.editors.get(
      deletedEditor.id,
    );
    if (treeEditor) {
      this.props.store.treeActionPanel.editors.delete(treeEditor.id);
    }

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
      const editors = this.props.store.editors.entries();
      this.props.store.editorPanel.activeEditorId = editors[0][1].id;
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
    const currEditor = editors.get(newTabId);
    // Check if last update was a remove for special Handling.
    if (editorPanel.removingTabId) {
      editorPanel.removingTabId = false;
      if (editorPanel.isRemovingCurrentTab) {
        editorPanel.isRemovingCurrentTab = false;
        editorPanel.activeEditorId = newTabId;
      }
    } else {
      editorPanel.activeEditorId = newTabId;
      if (newTabId != 'Default' && editors.get(newTabId).executing == true) {
        editorToolbar.isActiveExecuting = true;
      } else {
        editorToolbar.isActiveExecuting = false;
      }
      if (newTabId != 'Default') {
        editorPanel.activeDropdownId = currEditor.currentProfile;
        // Check if connection exists or is closed to update dropdown.
        if (!this.props.store.profiles.get(editorPanel.activeDropdownId)) {
          editorPanel.activeDropdownId = 'Default';
        } else if (
          this.props.store.profiles.get(editorPanel.activeDropdownId).status ==
          'CLOSED'
        ) {
          editorPanel.activeDropdownId = 'Default';
        }
        editorToolbar.id = currEditor.id;
        editorToolbar.shellId = currEditor.shellId;
      }
      console.log(
        `activeDropdownId: ${editorPanel.activeDropdownId} , id: ${editorToolbar.id}, shellId: ${editorToolbar.shellId}`,
      );
      if (editorPanel.activeDropdownId == 'Default') {
        editorToolbar.noActiveProfile = true;
      } else {
        editorToolbar.noActiveProfile = false;
      }

      // Determine whether Left-Side Panel should swap.
      if (!currEditor && editorPanel.activeDropdownId == 'Default') { // Default Tab.
        console.log('Moved to Welcome Page.');
        this.props.store.drawer.drawerChild = DrawerPanes.DEFAULT;
      } else if (currEditor.type == 'shell') { // Normal Editors
        this.props.store.drawer.drawerChild = DrawerPanes.DEFAULT;
      } else if (currEditor.type == 'aggregate') { // Aggregate Editors.
        this.props.store.drawer.drawerChild = DrawerPanes.AGGREGATE;
      } else { // Default Case.
        this.props.store.drawer.drawerChild = DrawerPanes.DEFAULT;
      }
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
    const target = event.target;
    const tabId = target.getAttribute('data-tab-id');
    const currentEditor = this.props.store.editors.get(tabId);

    if (tabId && tabId !== 'Default') {
      ContextMenu.show(
        <Menu className="editorTabContentMenu">
          <div className="menuItemWrapper closeTabItem">
            <MenuItem
              onClick={() => {
                tabId === 'Default'
                  ? this.closeWelcome()
                  : this.closeTab(currentEditor);
              }}
              text={globalString('editor/tabMenu/closeTab')}
              iconName="pt-icon-small-cross"
              intent={Intent.NONE}
            />
          </div>
          <div className="menuItemWrapper closeOtherItem">
            <MenuItem
              onClick={() => this.closeTabs(tabId)}
              text={globalString('editor/tabMenu/closeOtherTabs')}
              iconName="pt-icon-cross"
              intent={Intent.NONE}
            />
          </div>
          <div className="menuItemWrapper closeAllItem">
            <MenuItem
              onClick={() => this.closeTabs()}
              text={globalString('editor/tabMenu/closeAllTabs')}
              iconName="pt-icon-key-delete"
              intent={Intent.NONE}
            />
          </div>
          <div className="menuItemWrapper closeLeftItem">
            <MenuItem
              onClick={() => {
                this.closeLeft(tabId);
              }}
              text={globalString('editor/tabMenu/closeLeft')}
              iconName="pt-icon-chevron-left"
              intent={Intent.NONE}
            />
          </div>
          <div className="menuItemWrapper closeRightItem">
            <MenuItem
              onClick={() => {
                this.closeRight(tabId);
              }}
              text={globalString('editor/tabMenu/closeRight')}
              iconName="pt-icon-chevron-right"
              intent={Intent.NONE}
            />
          </div>
        </Menu>,
        {
          left: event.clientX,
          top: event.clientY,
        },
        () => {
          console.log('tab context menu closed');
        },
      );
    }
  }

  @action.bound
  renderWelcome() {
    if (this.props.store.editors.size == 0) {
      return (
        <Tab2
          className="welcomeTab"
          id="Default"
          title={globalString('editor/welcome/heading')}
          panel={<WelcomeView />}
        />
      );
    }
    return (
      <Tab2
        className={
          this.props.store.welcomePage.isOpen
            ? 'welcomeTab'
            : 'welcomeTab notVisible'
        }
        id="Default"
        title={globalString('editor/welcome/heading')}
        panel={<WelcomeView />}
      >
        <Button className="pt-minimal" onClick={this.closeWelcome}>
          <span className="pt-icon-cross" />
        </Button>
      </Tab2>
    );
  }

  @action.bound
  onSavingDialogSaveButtonClicked(unbindGlobalKeys, currentEditor) {
    this.onSavingDialogCancelButtonClicked(unbindGlobalKeys);
    this.toolbar.wrappedInstance
      .saveFile()
      .then(() => {
        this.closeTab(currentEditor);
      })
      .catch((e) => {
        if (e) {
          console.error(e);
        }
      });
  }

  @action.bound
  onSavingDialogCancelButtonClicked(unbindGlobalKeys) {
    unbindGlobalKeys();
    this.props.store.editorPanel.showingSavingDialog = false;
  }

  @action.bound
  onSavingDialogDontSaveButtonClicked(unbindGlobalKeys, currentEditor) {
    this.onSavingDialogCancelButtonClicked(unbindGlobalKeys);
    currentEditor.doc.markClean();
    this.closeTab(currentEditor);
  }

  renderSavingDialog() {
    const { editorPanel: { activeEditorId }, editors } = this.props.store;
    const currentEditor = editors.get(activeEditorId);

    let unbindGlobalKeys;

    const onSavingDialogSaveButtonClicked = () =>
      this.onSavingDialogSaveButtonClicked(unbindGlobalKeys, currentEditor);
    const onSavingDialogCancelButtonClicked = () =>
      this.onSavingDialogCancelButtonClicked(unbindGlobalKeys);
    const onSavingDialogDontSaveButtonClicked = () =>
      this.onSavingDialogDontSaveButtonClicked(unbindGlobalKeys, currentEditor);

    Mousetrap.bindGlobal(
      DialogHotkeys.submitDialog.keys,
      onSavingDialogSaveButtonClicked,
    );
    Mousetrap.bindGlobal(
      DialogHotkeys.closeDialog.keys,
      onSavingDialogCancelButtonClicked,
    );

    unbindGlobalKeys = () => {
      Mousetrap.unbindGlobal(
        DialogHotkeys.submitDialog.keys,
        onSavingDialogSaveButtonClicked,
      );
      Mousetrap.unbindGlobal(
        DialogHotkeys.closeDialog.keys,
        onSavingDialogCancelButtonClicked,
      );
    };

    return (
      <Dialog className="pt-dark savingDialog" intent={Intent.PRIMARY} isOpen>
        <h4>
          {' '}{globalString(
            'editor/savingDialog/title',
            currentEditor.fileName,
          )}{' '}
        </h4>
        <p>
          {' '}{globalString('editor/savingDialog/message')}{' '}
        </p>
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
    return (
      <div id={`unsavedFileIndicator_${id}`} className="unsavedFileIndicator" />
    );
  }

  _isScrollPosEqual(pos1, pos2, accuracy = 1) {
    return Math.abs(pos1 - pos2) < accuracy;
  }

  onTabScrollLeftBtnClicked() {
    const tabListEl = this.tabs.tablistElement;
    const currTabEl = this.getCurrentVisibleLeftmostTabElement();
    const getCurrTabTargetPos = this.getElementScrollLeftTargetPosition.bind(
      this,
      currTabEl,
    );

    if (
      this._isScrollPosEqual(tabListEl.scrollLeft, getCurrTabTargetPos(), 5)
    ) {
      const prevTabEl = currTabEl.previousSibling;
      if (prevTabEl) {
        this.scrollToTab(
          this.getElementScrollLeftTargetPosition.bind(this, prevTabEl),
        );
      }
    } else {
      this.scrollToTab(getCurrTabTargetPos);
    }
  }

  onTabScrollRightBtnClicked() {
    const tabListEl = this.tabs.tablistElement;
    const currTabEl = this.getCurrentVisibleRightmostTabElement();
    const getCurrTabTargetPos = this.getElementScrollRightTargetPosition.bind(
      this,
      currTabEl,
    );

    if (
      this._isScrollPosEqual(tabListEl.scrollLeft, getCurrTabTargetPos(), 5)
    ) {
      const nextTabEl = currTabEl.nextSibling;
      if (nextTabEl) {
        this.scrollToTab(
          this.getElementScrollRightTargetPosition.bind(this, nextTabEl),
        );
      }
    } else {
      this.scrollToTab(getCurrTabTargetPos);
    }
  }

  onTabListBtnClicked() {
    const { editors, editorPanel } = this.props.store;

    const tabList = (
      <FilterList
        items={editors.values()}
        getItemTitle={this.getEditorTitle}
        getItemId={item => item.id}
        onClick={(item) => {
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
      left: btnEl.left,
      top: btnEl.top + btnEl.height,
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
        this.getScrollLeftMax(tabListEl),
      ),
    );
  }

  @action
  updateTabScrollPosition() {
    const { editorPanel } = this.props.store;

    if (editorPanel.shouldScrollToActiveTab) {
      editorPanel.shouldScrollToActiveTab = false;

      // scroll to active tab
      const el = document.getElementById(
        `pt-tab-title_EditorTabs_${editorPanel.activeEditorId}`,
      );
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

    const step = (newTimestamp) => {
      const targetPos = getTargetPos();

      scrollCount += Math.PI / (scrollDuration / (newTimestamp - oldTimestamp));

      if (scrollCount >= Math.PI) {
        el.scrollLeft = targetPos;
        return;
      }

      el.scrollLeft =
        targetPos +
        Math.round(cosParameter + cosParameter * Math.cos(scrollCount));
      oldTimestamp = newTimestamp;

      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  getCurrentVisibleLeftmostTabElement() {
    const rect = this.tabScrollLeftBtn.getBoundingClientRect();
    return document.elementFromPoint(rect.left + rect.width + 2, rect.top + 2);
  }

  getScrollLeftMax(tabListEl = this.tabs.tablistElement) {
    // tabListEl.clientWidth is the scrollable area width
    return tabListEl.scrollWidth - tabListEl.clientWidth;
  }

  getCurrentVisibleRightmostTabElement() {
    const tabListEl = this.tabs.tablistElement;

    if (
      this._isScrollPosEqual(
        tabListEl.scrollLeft,
        this.getScrollLeftMax(tabListEl),
      )
    ) {
      return tabListEl.lastChild;
    }

    const rect = this.tabScrollRightBtn.getBoundingClientRect();
    return document.elementFromPoint(rect.left - 1, rect.top + 2);
  }

  getEditorTitle = (editor) => {
    return editor.alias + ' (' + editor.fileName + ')';
  };

  // Encapsulation for rendering a standard Mongo Shell Tab in the Editor Panel.
  renderShellTab(tab, tabClassName, editorTitle) {
    return (
      <Tab2
        className={'editorTab visible ' + tabClassName}
        key={tab[1].id}
        id={tab[1].id}
        title={editorTitle}
        panel={
          <View
            id={tab[0]}
            title={editorTitle}
            onDrop={item => this.handleDrop(item)}
            editor={tab[1]}
            ref="defaultEditor"
          />
        }
      >
        {this.renderUnsavedFileIndicator(tab[0])}
        <Button
          className="pt-minimal"
          onClick={() => this.closeTab(tab[1])}
      >
          <span className="pt-icon-cross" />
        </Button>
      </Tab2>
    );
  }

  // Encapsulation for rendering an Aggregate Tab in the Editor Panel.
  renderAggregateTab(tab, tabClassName, editorTitle) {
    return (
      <Tab2
        className={'editorTab aggregateTab visible ' + tabClassName}
        key={tab[1].id}
        id={tab[1].id}
        title={editorTitle}
        panel={
          <div className="aggregateTabInnerWrapper">
            <AggregateGraphicalBuilder className="aggregatePanel" />
            <View
              id={tab[0]}
              className="aggregateEditorPanel"
              title={editorTitle}
              onDrop={item => this.handleDrop(item)}
              editor={tab[1]}
              ref="defaultEditor"
            />
          </div>
        }
      >
        {this.renderUnsavedFileIndicator(tab[0])}
        <Button
          className="pt-minimal"
          onClick={() => this.closeTab(tab[1])}
      >
          <span className="pt-icon-cross" />
        </Button>
      </Tab2>
    );
  }

  /**
   * Action for rendering the component.
   */
  render() {
    const editors = this.props.store.editors.entries();
    return (
      <div className="pt-dark editorPanel" onContextMenu={this.showContextMenu}>
        <Toolbar
          ref={ref => (this.toolbar = ref)}
          executeAll={this.executeAll}
          newEditor={this.newEditor}
        />
        <Tabs2
          ref={ref => (this.tabs = ref)}
          id="EditorTabs"
          className="editorTabView"
          renderActiveTabPanelOnly={false}
          animate={this.state.animate}
          onChange={this.changeTab}
          selectedTabId={this.props.store.editorPanel.activeEditorId}
        >
          {this.renderWelcome()}
          {editors.map((tab) => {
            // TODO this `visible` is not used anymore. Needs a cleanup
            // if (tab[1].visible) {
            const tabClassName = tab[1].alias.replace(/[\. ]/g, '');
            const editorTitle = this.getEditorTitle(tab[1]);
            switch (tab[1].type) {
              case 'aggregate':
                return this.renderAggregateTab(tab, tabClassName, editorTitle);
              default:
                return this.renderShellTab(tab, tabClassName, editorTitle);
            }
          })}
        </Tabs2>
        <div
          ref={ref => (this.tabScrollLeftBtn = ref)}
          className="pt-icon-chevron-left tabControlBtn tabScrollLeftBtn"
          onClick={this.onTabScrollLeftBtnClicked}
        />
        <div
          ref={ref => (this.tabScrollRightBtn = ref)}
          className="pt-icon-chevron-right tabControlBtn tabScrollRightBtn"
          onClick={this.onTabScrollRightBtnClicked}
        />
        <div
          ref={ref => (this.tabListBtn = ref)}
          className="pt-icon-menu tabControlBtn tabListBtn"
          onClick={this.onTabListBtnClicked}
        />
        {this.props.store.editorPanel.showingSavingDialog
          ? this.renderSavingDialog()
          : null}
      </div>
    );
  }
}
