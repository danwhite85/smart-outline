'use strict';

/**
 * function that will add a style block that will hide the focus
 * outlines while a user is using the mouse to navigate the application,
 * once we detect that a user is using keyboard navigation (tab) we remove
 * this style block so that the real focus outlines will be visible again.
 */

(function (root, factory) {
    if(typeof define === 'function' && define.amd) { // eslint-disable-line
        define(factory); // eslint-disable-line
    } else if(typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.smartOutline = factory();
    }
}(this, function() {

    var defaultDomId = 'bbbx-a11y-fix';
    var defaultHideFocusCSS = '*:focus {outline:0 !important;}::-moz-focus-inner{border:0;}';
    var keyboardUserClass = 'so-keyboard-user';
    var desktopUserClass = 'so-dekstop-user';
    var options = null;

    var KEYCODE_TAB = 9;
    var KEYCODE_SPACE = 39;
    var KEYCODE_LEFT = 37;
    var KEYCODE_UP = 38;
    var KEYCODE_RIGHT = 39;
    var KEYCODE_DOWN = 40;

    function ensureInitCalled() {
        if(options === null)
            throw new Error('Smart Outline is not initialized yet. Make sure to call `.init()` first.');
    }

    var smartOutline = {
        getStyleEl: function() {
            var opts = options || {};
            return document.getElementById(opts.domId || defaultDomId);
        },
        setCSS: function(css) {
            this.getStyleEl().innerHTML = css;
        },
        setHtmlClass: function(cssClass) {
            document.documentElement.classList.add(cssClass);
        },
        removeHtmlClass: function(cssClass) {
            document.documentElement.classList.remove(cssClass);
        },
        _mousedownListener: function() {
            smartOutline.setCSS(options.hideFocusCSS);
            smartOutline.removeHtmlClass(options.keyboardUserClass);
            smartOutline.setHtmlClass(options.desktopUserClass);
            window.removeEventListener('mousedown', smartOutline._mousedownListener, false);
            window.addEventListener('keydown', smartOutline._keyDownListener); // eslint-disable-line
        },

        _keyDownListener: function(evt) {

            // only remove the outline if the user is using one of the keyboard
            // navigation keys
            if(
                evt.keyCode !== KEYCODE_TAB &&
                evt.keyCode !== KEYCODE_SPACE &&
                evt.keyCode !== KEYCODE_LEFT &&
                evt.keyCode !== KEYCODE_RIGHT &&
                evt.keyCode !== KEYCODE_UP &&
                evt.keyCode !== KEYCODE_DOWN
            )
                return;

            smartOutline.setCSS('');
            smartOutline.removeHtmlClass(options.desktopUserClass);
            smartOutline.setHtmlClass(options.keyboardUserClass);
            window.removeEventListener('keydown', smartOutline._keyDownListener, false);
            window.addEventListener('mousedown', smartOutline._mousedownListener);
        },

        getOptions: function() {
            ensureInitCalled();
            return options;
        },

        isKeyboardUser: function() {
            ensureInitCalled();
            return this.getStyleEl().innerHTML === '';
        },

        isEnabled: function() {
            var el = smartOutline.getStyleEl();
            return el ? true : false;
        },

        init: function(userOptions) {

            // create options were user options overwrites default options
            userOptions = userOptions || {};
            options = {
                domId: userOptions.domId || defaultDomId,
                hideFocusCSS: userOptions.hideFocusCSS || defaultHideFocusCSS,
                keyboardUserClass: userOptions.keyboardUserClass || keyboardUserClass,
                desktopUserClass: userOptions.desktopUserClass || desktopUserClass
            };

            // only add style element if it doesn't exist yet
            if(this.getStyleEl())
                return this.getStyleEl();

            // only setup if there is no a11y style element yet
            var head = document.head || document.getElementsByTagName('head')[0];
            var style = document.createElement('style');
            style.id = options.domId;
            style.type = 'text/css';

            if(!head)
                return false;

            var styleEl = head.appendChild(style);

            // init as a desktop user and bind to the keydown event
            smartOutline._mousedownListener();

            return styleEl;
        },

        destroy: function() {
            var el = smartOutline.getStyleEl();
            if(el) {
                var head = document.head || document.getElementsByTagName('head')[0];
                head.removeChild(el);

                options = null;
                window.removeEventListener('keydown', smartOutline._keyDownListener, false);
                window.removeEventListener('mousedown', smartOutline._mousedownListener, false);
            }
        }
    };

    return smartOutline;
}));

