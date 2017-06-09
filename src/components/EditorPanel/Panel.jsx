/**
* @Author: Michael Harrison <mike>
* @Date:   2017-03-14 15:54:01
* @Email:  mike@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-06-09T10:20:09+10:00
*/

/* eslint-disable react/no-string-refs */
import React from 'react';
import {inject, observer, PropTypes} from 'mobx-react';
import {action, reaction, runInAction} from 'mobx';
import Mousetrap from 'mousetrap';
import 'mousetrap-global-bind';
import {
  Button,
  Tabs2,
  Tab2,
  Intent,
  ContextMenu,
  Menu,
  MenuItem
} from '@blueprintjs/core';
import {GlobalHotkeys} from '#/common/hotkeys/hotkeyList.jsx';
import Toolbar from './Toolbar.jsx';
import View from './View.jsx';
import './Panel.scss';
import WelcomeView from './WelcomePanel/WelcomeView.jsx';

import {ProfileStatus} from '../common/Constants';
import {featherClient} from '../../helpers/feathers';
/**
 * Panel for wrapping the Editor View and EditorToolbar.
 * @extends {React.Component}
 */
@inject('store')
@observer
export default class Panel extends React.Component {
  static propTypes = {
    store: PropTypes.observableObject.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      activePanelOnly: false,
      animate: false,
      tabId: 0,
      vertical: false
    };

    this.newEditor = this
      .newEditor
      .bind(this);
    this.closeTab = this
      .closeTab
      .bind(this);
    this.closeActiveTab = this
      .closeActiveTab
      .bind(this);
    this.changeTab = this
      .changeTab
      .bind(this);
    this.showContextMenu = this
      .showContextMenu
      .bind(this);
  }

  componentWillMount() {
    this.reactionToProfile = reaction(() => this.props.store.profileList.selectedProfile, () => {
      try {
        if (this.props.store.profileList.selectedProfile.id == this.props.store.editorPanel.activeDropdownId) {
          console.log('do nothing as the profile might have been swaped by the dropdown.');
          return;
        }
        let curEditor;
        if (this.props.store.editorPanel.activeEditorId != 'Default') {
          curEditor = this
            .props
            .store
            .editors
            .get(this.props.store.editorPanel.activeEditorId);
        }

        if (curEditor && curEditor.currentProfile == this.props.store.profileList.selectedProfile.id) {
          console.log('do nothing');
        } else {
          const editors = this
            .props
            .store
            .editors
            .entries();
          for (const editor of editors) {
            console.log('editor[1].currentProfile :', editor[1].currentProfile);
            if (editor[1].currentProfile == this.props.store.profileList.selectedProfile.id) {
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
    });
  }

  componentDidMount() {
    // Add hotkey bindings for this component:
    Mousetrap.bindGlobal(GlobalHotkeys.closeTab.keys, this.closeActiveTab);
  }
  componentWillUnmount() {
    this.reactionToProfile();
    Mousetrap.unbindGlobal(GlobalHotkeys.closeTab.keys, this.closeActiveTab);
  }
  reactionToProfile;
  /**
   * DEPRECATED? Remove this after refactoring.
   * Action for creating a new editor in the MobX store.
   * @param {String} newId - The id of the newly created Editor tab.
   */
  @action newEditor(newId) {
    this.props.store.editorPanel.activeDropdownId = newId;
    this.props.store.editorPanel.activeEditorId = newId;
    this.setState({tabId: newId});
  }

  /**
   * Action for closing a tab.
   * @param {Object} oldTab - The Id of the tab being removed.
   */
  @action closeTab(oldTab) {
    const deletedEditor = this
      .props
      .store
      .editors
      .get(oldTab.id);
    console.log('deleted editor ', deletedEditor);
    if (deletedEditor && deletedEditor.status == ProfileStatus.OPEN) {
      // close the connection
      featherClient()
        .service('/mongo-shells')
        .remove(deletedEditor.profileId, {
          query: {
            shellId: deletedEditor.shellId
          }
        })
        .then(v => console.log('remove shell successfully, ', v))
        .catch(err => console.error('remove shell failed,', err));
    }
    // NEWLOGIC Check if closed editor is current editor:
    if ((oldTab.id) == this.props.store.editorPanel.activeEditorId) {
      this.props.store.editorPanel.isRemovingCurrentTab = true;
      // Check if this is the last tab:
      if (this.props.store.editors.size == 1) {
        // Show and select welcome tab
        this.props.store.welcomePage.isOpen = true;
        this.props.store.editorPanel.activeEditorId = 'Default';
      } else {
        // Show and select first entry in map.
        console.log('1:', this.props.store.editorPanel.activeEditorId);
        this.props.store.editorPanel.removingTabId = oldTab.id;
        this
          .props
          .store
          .editors
          .delete(oldTab.id);
        const editors = this
          .props
          .store
          .editors
          .entries();
        this.props.store.editorPanel.activeEditorId = editors[0][1].id;
        console.log('2:', this.props.store.editorPanel.activeEditorId);

        const treeEditor = this
          .props
          .store
          .treeActionPanel
          .editors
          .get(oldTab.id);
        if (treeEditor) {
          this
            .props
            .store
            .treeActionPanel
            .editors
            .delete(treeEditor.id);
        }
        return;
      }
    } else {
      this.props.store.editorPanel.isRemovingCurrentTab = false;
    }
    this.props.store.editorPanel.removingTabId = oldTab.id;
    this
      .props
      .store
      .editors
      .delete(oldTab.id);

    const treeEditor = this
      .props
      .store
      .treeActionPanel
      .editors
      .get(oldTab.id);
    if (treeEditor) {
      this
        .props
        .store
        .treeActionPanel
        .editors
        .delete(treeEditor.id);
    }

    this.forceUpdate();
  }

  /**
   * Action for closing active tab.
   */
  @action closeActiveTab() {
    const deletedEditor = this
      .props
      .store
      .editors
      .get(this.props.store.editorPanel.activeEditorId);
    console.log('deleted editor ', deletedEditor);
    if (deletedEditor && deletedEditor.status == ProfileStatus.OPEN) {
      // close the connection
      featherClient()
        .service('/mongo-shells')
        .remove(deletedEditor.profileId, {
          query: {
            shellId: deletedEditor.shellId
          }
        })
        .then(v => console.log('remove shell successfully, ', v))
        .catch(err => console.error('remove shell failed,', err));
    }
    // NEWLOGIC Check if closed editor is current editor:
    if (true) {
      this.props.store.editorPanel.isRemovingCurrentTab = true;
      // Check if this is the last tab:
      if (this.props.store.editors.size == 1) {
        // Show and select welcome tab
        this.props.store.welcomePage.isOpen = true;
        this.props.store.editorPanel.activeEditorId = 'Default';
      } else {
        // Show and select first entry in map.
        console.log('1:', this.props.store.editorPanel.activeEditorId);
        this.props.store.editorPanel.removingTabId = deletedEditor.id;
        this
          .props
          .store
          .editors
          .delete(deletedEditor.id);
        const editors = this
          .props
          .store
          .editors
          .entries();
        this.props.store.editorPanel.activeEditorId = editors[0][1].id;
        console.log('2:', this.props.store.editorPanel.activeEditorId);

        const treeEditor = this
          .props
          .store
          .treeActionPanel
          .editors
          .get(deletedEditor.id);
        if (treeEditor) {
          this
            .props
            .store
            .treeActionPanel
            .editors
            .delete(treeEditor.id);
        }
        return;
      }
    }
    this.props.store.editorPanel.removingTabId = deletedEditor.id;
    this
      .props
      .store
      .editors
      .delete(deletedEditor.id);

    const treeEditor = this
      .props
      .store
      .treeActionPanel
      .editors
      .get(deletedEditor.id);
    if (treeEditor) {
      this
        .props
        .store
        .treeActionPanel
        .editors
        .delete(treeEditor.id);
    }

    this.forceUpdate();
  }

  /**
   * Action for closing the welcome Tab
   */
  @action.bound closeWelcome() {
    this.props.store.welcomePage.isOpen = false;
    this.props.store.editorPanel.removingTabId = true;
    if (this.props.store.editorPanel.activeEditorId == 'Default') {
      const editors = this
        .props
        .store
        .editors
        .entries();
      this.props.store.editorPanel.activeEditorId = editors[0][1].id;
    }
    this.forceUpdate();
  }

  /**
   * Action for swapping the currently selected tab.
   * @param {String} newTab - Id of tab to swap to active.
   */
  @action changeTab(newTab) {
    // Check if last update was a remove for special Handling.
    if (this.props.store.editorPanel.removingTabId) {
      this.props.store.editorPanel.removingTabId = false;
      if (this.props.store.editorPanel.isRemovingCurrentTab) {
        this.props.store.editorPanel.isRemovingCurrentTab = false;
        this.props.store.editorPanel.activeEditorId = newTab;
        this.setState({tabId: newTab});
      } else {
        this.setState({tabId: this.state.tabId});
      }
    } else {
      this.props.store.editorPanel.activeEditorId = newTab;
      if (newTab != 'Default' && this.props.store.editors.get(this.props.store.editorPanel.activeEditorId).executing == true) {
        this.props.store.editorToolbar.isActiveExecuting = true;
      } else {
        this.props.store.editorToolbar.isActiveExecuting = false;
      }
      this.setState({tabId: newTab});
      if (newTab != 'Default') {
        this.props.store.editorPanel.activeDropdownId = this
          .props
          .store
          .editors
          .get(newTab)
          .currentProfile;
        if (this.props.store.profiles.get(this.props.store.editorPanel.activeDropdownId).status == 'CLOSED') {
          this.props.store.editorPanel.activeDropdownId = 'Default';
        }
        this.props.store.editorToolbar.id = this
          .props
          .store
          .editors
          .get(newTab)
          .id;
        this.props.store.editorToolbar.shellId = this
          .props
          .store
          .editors
          .get(newTab)
          .shellId;
      }
      console.log(`activeDropdownId: ${this.props.store.editorPanel.activeDropdownId} , id: ${this.props.store.editorToolbar.id}, shellId: ${this.props.store.editorToolbar.shellId}`);
      if (this.props.store.editorPanel.activeDropdownId == 'Default') {
        this.props.store.editorToolbar.noActiveProfile = true;
      } else {
        this.props.store.editorToolbar.noActiveProfile = false;
      }
    }
  }

  /**
   * Action for handling a drop event from a drag-and-drop action.
   * @param {Object} item - The item being dropped.
   */
  @action handleDrop(item) {
    this.props.store.dragItem.item = item;
    if (!this.props.store.dragItem.dragDrop) {
      this.props.store.dragItem.dragDrop = true;
    } else {
      this.props.store.dragItem.dragDrop = false;
      const setDragDropTrueLater = () => { // This hack is done to fix the state in case of exception where the value is preserved as true while it is not draging
        runInAction('set drag drop to true', () => {
          this.props.store.dragItem.dragDrop = true;
        });
      };
      setTimeout(setDragDropTrueLater, 500);
    }
  }

  /**
   * Close all tabs except for the provided tab id
   * @param {String} keepTab - The id string of the editor to keep (optional)
   */
  @action.bound closeTabs(keepTab) {
    const editors = this
      .props
      .store
      .editors
      .entries();
    console.log(editors);
    editors.map((editor) => {
      if (editor[1].id != keepTab) {
        console.log(`Closing Tab ${editor[1].id}`);
        this.closeTab(editor[1]);
      }
    });
  }

  /**
   *  Close all tabs to the left of the current tab
   *  @param {String} currentTab - The id of the leftmost tab that will stay open
   */
  closeLeft(currentTab) {
    const editors = this
      .props
      .store
      .editors
      .entries();
    editors.every((editor) => {
      if (editor[1].id != currentTab) {
        console.log(`Closing Tab ${editor[1].id}`);
        this.closeTab(editor[1]);
        return true;
      }
      return false;
    });
  }

  /**
   *  Close all tabs to the right of the current tab
   *  @param {String} currentTab - The id of the rightmost tab that will stay open
   */
  closeRight(currentTab) {
    const editors = this
      .props
      .store
      .editors
      .entries();
    let startClosing = false;
    editors.map((editor) => {
      if (editor[1].id != currentTab) {
        if (startClosing) {
          console.log(`Closing Tab ${editor[1].id}`);
          this.closeTab(editor[1]);
        }
      } else {
        startClosing = true;
      }
    });
  }

  /** Display a right click menu when any of the editor tabs are right clicked
   *  @param {SyntheticMouseEvent} event - mouse click event from onContextMenu
   */
  showContextMenu(event) {
    const target = event.target;
    const tabId = {
      id: target.getAttribute('data-tab-id')
    };
    if (tabId.id) {
      console.log(tabId.id);
      ContextMenu.show(
        <Menu className="editorTabContentMenu">
          <div className="menuItemWrapper closeTabItem">
            <MenuItem
              onClick={() => {
            (tabId.id === 'Default')
              ? this.closeWelcome()
              : this.closeTab(tabId);
          }}
              text={globalString('editor/tabMenu/closeTab')}
              iconName="pt-icon-small-cross"
              intent={Intent.NONE} />
          </div>
          <div className="menuItemWrapper closeOtherItem">
            <MenuItem
              onClick={() => this.closeTabs(tabId.id)}
              text={globalString('editor/tabMenu/closeOtherTabs')}
              iconName="pt-icon-cross"
              intent={Intent.NONE} />
          </div>
          <div className="menuItemWrapper closeAllItem">
            <MenuItem
              onClick={this.closeTabs}
              text={globalString('editor/tabMenu/closeAllTabs')}
              iconName="pt-icon-key-delete"
              intent={Intent.NONE} />
          </div>
          <div className="menuItemWrapper closeLeftItem">
            <MenuItem
              onClick={() => {
            this.closeLeft(tabId.id);
          }}
              text={globalString('editor/tabMenu/closeLeft')}
              iconName="pt-icon-chevron-left"
              intent={Intent.NONE} />
          </div>
          <div className="menuItemWrapper closeRightItem">
            <MenuItem
              onClick={() => {
            this.closeRight(tabId.id);
          }}
              text={globalString('editor/tabMenu/closeRight')}
              iconName="pt-icon-chevron-right"
              intent={Intent.NONE} />
          </div>
        </Menu>, {
        left: event.clientX,
        top: event.clientY
      }, () => {
        console.log('tab context menu closed');
      });
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
          panel={<WelcomeView />} />
      );
    }
    return (
      <Tab2
        className={(this.props.store.welcomePage.isOpen)
        ? 'welcomeTab'
        : 'welcomeTab notVisible'}
        id="Default"
        title={globalString('editor/welcome/heading')}
        panel={<WelcomeView />}>
        <Button className="pt-minimal" onClick={this.closeWelcome}>
          <span className="pt-icon-cross" />
        </Button>
      </Tab2>
    );
  }

  /**
   * Action for rendering the component.
   */
  render() {
    const editors = this
      .props
      .store
      .editors
      .entries();
    return (
      <div className="pt-dark editorPanel" onContextMenu={this.showContextMenu}>
        <Toolbar executeAll={this.executeAll} newEditor={this.newEditor} ref="toolbar" />
        <Tabs2
          id="EditorTabs"
          className="editorTabView"
          renderActiveTabPanelOnly={false}
          animate={this.state.animate}
          onChange={this.changeTab}
          selectedTabId={this.props.store.editorPanel.activeEditorId}>
          {this.renderWelcome()}
          {editors.map((tab) => {
            if (tab[1].visible) {
              const tabClassName = (tab[1].alias).replace(/[\. ]/g, '');
              return (
                <Tab2
                  className={'editorTab visible ' + tabClassName}
                  key={tab[1].id}
                  id={tab[1].id}
                  title={tab[1].alias + ' (' + tab[1].fileName + ')'}
                  panel={<View id={
                  tab[0]
                }
                    title={
                  tab[1].alias + ' (' + tab[1].fileName + ')'
                }
                    onDrop={
                  item => this.handleDrop(item)
                }
                    editor={
                  tab[1]
                }
                    ref="defaultEditor" />}>
                  <Button className="pt-minimal" onClick={() => this.closeTab(tab[1])}>
                    <span className="pt-icon-cross" />
                  </Button>
                </Tab2>
              );
            }
            return (
              <Tab2
                className={'editorTab notVisible ' + tabClassName}
                key={tab[1].id}
                id={tab[1].id}
                title={tab[1].alias}
                panel={<View id={
                tab[1].id
              }
                  editor={
                tab[1]
              }
                  ref="defaultEditor" />}>
                <Button
                  className="pt-intent-primary pt-minimal"
                  onClick={() => this.closeTab(tab[1])}>
                  <span className="pt-icon-cross" />
                </Button>
              </Tab2>
            );
          })}
        </Tabs2>
      </div>
    );
  }
}
