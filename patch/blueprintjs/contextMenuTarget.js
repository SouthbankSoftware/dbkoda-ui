/*
 * Copyright 2016 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */
import * as React from "react";
import * as ReactDOM from "react-dom";
import { CONTEXTMENU_WARN_DECORATOR_NO_METHOD } from "../../common/errors";
import { isFunction, safeInvoke } from "../../common/utils";
import { isDarkTheme } from "../../common/utils/isDarkTheme";
import * as ContextMenu from "./contextMenu";
export function ContextMenuTarget(constructor) {
    var _a = constructor.prototype, render = _a.render, renderContextMenu = _a.renderContextMenu, onContextMenuClose = _a.onContextMenuClose;
    if (!isFunction(renderContextMenu)) {
        console.warn(CONTEXTMENU_WARN_DECORATOR_NO_METHOD);
    }
    // patching classes like this requires preserving function context
    // tslint:disable-next-line only-arrow-functions
    constructor.prototype.render = function () {
        var _this = this;
        /* tslint:disable:no-invalid-this */
        var element = render.call(this);
        if (element == null) {
            // always return `element` in case caller is distinguishing between `null` and `undefined`
            return element;
        }
        var oldOnContextMenu = element.props.onContextMenu;
        var onContextMenu = function (e) {
            // support nested menus (inner menu target would have called preventDefault())
            if (e.defaultPrevented) {
                return;
            }
            if (isFunction(_this.renderContextMenu)) {
                var menu = _this.renderContextMenu(e);
                if (menu != null) {
                    // Patching Blueprint JS' ContextMenuTarget to always use light theme
                    //
                    // which is a better alternative to old hack:
                    // HACK workaround for https://github.com/palantir/blueprint/issues/1539
                    // setTimeout(() => {
                    //   document.querySelector('.pt-popover.pt-minimal.pt-dark').classList.remove('pt-dark');
                    // });

                    // var htmlElement = ReactDOM.findDOMNode(_this);
                    // var darkTheme = htmlElement != null && isDarkTheme(htmlElement);
                    var darkTheme = false;
                    e.preventDefault();
                    ContextMenu.show(menu, { left: e.clientX, top: e.clientY }, onContextMenuClose, darkTheme);
                }
            }
            safeInvoke(oldOnContextMenu, e);
        };
        return React.cloneElement(element, { onContextMenu: onContextMenu });
        /* tslint:enable:no-invalid-this */
    };
}
