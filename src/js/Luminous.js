import { isDOMElement } from './util/dom';
import injectBaseStylesheet from './injectBaseStylesheet';
import Lightbox from './Lightbox';

export const VERSION = '0.1.0';

export default class Luminous {
  constructor(trigger, options = {}) {
    this.isOpen = false;

    this.trigger = trigger;

    if (!isDOMElement(this.trigger)) {
      throw new TypeError('`new Luminous` requires a DOM element as its first argument.');
    }

    // A bit unexpected if you haven't seen this pattern before.
    // Based on the pattern here:
    // https://github.com/getify/You-Dont-Know-JS/blob/master/es6%20&%20beyond/ch2.md#nested-defaults-destructured-and-restructured
    let {
      // Prefix for generated element class names (e.g. `my-ns` will
      // result in classes such as `my-ns-lightbox`. Default `lum-`
      // prefixed classes will always be added as well.
      namespace = null,
      // Which attribute to pull the lightbox image source from.
      sourceAttribute = 'href',
      // The event to listen to on the _trigger_ element: triggers opening.
      openTrigger = 'click',
      // The event to listen to on the _lightbox_ element: triggers closing.
      closeTrigger = 'click',
      // Allow closing by pressing escape.
      closeWithEscape = true,
      // A selector defining what to append the lightbox element to.
      appendToSelector = 'body',
      // If present (and a function), this will be called
      // whenever the lightbox is opened.
      onOpen = null,
      // If present (and a function), this will be called
      // whenever the lightbox is closed.
      onClose = null,
      // When true, adds the `imgix-fluid` class to the `img`
      // inside the lightbox. See https://github.com/imgix/imgix.js
      // for more information.
      includeImgixJSClass = false,
      // Add base styles to the page. See the "Theming"
      // section of README.md for more information.
      injectBaseStyles = true,
    } = options

    this.settings = { namespace, sourceAttribute, openTrigger, closeTrigger, closeWithEscape, appendToSelector, onOpen, onClose, includeImgixJSClass, injectBaseStyles }

    if (this.settings.injectBaseStyles) {
      injectBaseStylesheet();
    }

    this._buildLightbox();
    this._bindEvents();
  }

  open = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    this.lightbox.open();

    let onOpen = this.settings.onOpen
    if (onOpen && typeof onOpen === 'function') {
      onOpen();
    }

    this.isOpen = true;
  }

  close = (e) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    this.lightbox.close();

    let onClose = this.settings.onClose
    if (onClose && typeof onClose === 'function') {
      onClose();
    }

    this.isOpen = false;
  }

  _buildLightbox() {
    this.lightbox = new Lightbox({
      namespace: this.settings.namespace,
      parentEl: document.querySelector(this.settings.appendToSelector),
      triggerEl: this.trigger,
      sourceAttribute: this.settings.sourceAttribute,
      includeImgixJSClass: this.settings.includeImgixJSClass,
      closeTrigger: this.settings.closeTrigger,
    });
  }

  _bindEvents() {
    this.trigger.addEventListener(this.settings.openTrigger, this.open, false);
    this.lightbox.el.addEventListener(this.settings.closeTrigger, this.close, false);

    if (this.settings.closeWithEscape) {
      window.addEventListener('keyup', this._handleKeyup, false);
    }
  }

  _unbindEvents() {
    this.trigger.removeEventListener(this.settings.openTrigger, this.open, false);
    this.lightbox.el.removeEventListener(this.settings.closeTrigger, this.close, false);

    if (this.settings.closeWithEscape) {
      window.removeEventListener('keyup', this._handleKeyup, false);
    }
  }

  _handleKeyup = (e) => {
    if (this.isOpen && e.keyCode === 27) {
      this.close()
    }
  }

  destroy = () => {
    this._unbindEvents();
    this.lightbox.destroy();
  }
}

global.Luminous = Luminous;