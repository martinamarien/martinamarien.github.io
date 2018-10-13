(function($, window, document, undefined) {
  var pluginName = 'ik_progressbar',
    defaults = {
      // values can be overitten by passing configuration options to plugin constructor
      instructions: 'Press spacebar, or Enter to get progress',
      max: 100
    };

  /**
   * @constructs Plugin
   * @param {Object} element - Current DOM element from selected collection.
   * @param {Object} options - Configuration options.
   * @param {string} options.instructions - Custom instructions for screen reader users.
   * @param {number} options.max - End value.
   */
  function Plugin(element, options) {
    this._name = pluginName;
    this._defaults = defaults;
    this.element = $(element);
    this.options = $.extend({}, defaults, options);

    this.init();
  }

  /** Initializes plugin. */
  Plugin.prototype.init = function() {
    // initialization function

    var id = 'pb' + $('.ik_progressbar').length;

    this.element
      .attr({
        id: id,
        tabindex: -1,
        role: 'progressbar',
        'aria-valuenow': 0,
        'aria-valuemin': 0,
        'aria-valuemax': this.options.max,
        'aria-describedby': id + '_instructions'
      })
      .addClass('ik_progressbar')
      .on('keydown.ik', { plugin: this }, this.onKeyDown);

    this.fill = $('<div/>').addClass('ik_fill');

    this.notification = $('<div/>')
      .attr({
        'aria-live': 'assertive',
        'aria-atomic': 'additions'
      })
      .addClass('ik_readersonly')
      .appendTo(this.element);

    $('<div/>')
      .text(this.options.instructions)
      .addClass('ik_readersonly')
      .attr({
        id: id + '_instructions',
        'aria-hidden': 'true'
      })
      .appendTo(this.element);

    $('<div/>')
      .addClass('ik_track')
      .append(this.fill)
      .appendTo(this.element);
  };

  /**
   * Gets the current value of progressbar.
   *
   * @returns {number}
   */
  Plugin.prototype.getValue = function() {
    var value;

    value = Number(this.element.attr('aria-valuenow')); // inaccessible

    return parseInt(value);
  };

  /**
   * Gets the current value of progressbar.
   *
   * @returns {number}
   */
  Plugin.prototype.getPercent = function() {
    var percent = (this.getValue() / this.options.max) * 100;

    return parseInt(percent);
  };

  /**
   * Sets the current value of progressbar.
   *
   * @param {number} n - The current value.
   */
  Plugin.prototype.setValue = function(n) {
    var $el,
      val,
      isComplete = false;

    $el = $(this.element);

    if (n >= this.options.max) {
      val = this.options.max;
      $el.attr({
        tabindex: -1
      });
      this.notification.text('Loading complete');
    } else {
      val = n;
    }

    this.element.attr({
      'aria-valuenow': val
    });

    this.updateDisplay();
  };

  /** Updates visual display. */
  Plugin.prototype.updateDisplay = function() {
    this.fill.css({
      transform: 'scaleX(' + this.getPercent() / 100 + ')'
    });
  };

  /** Updates text in live region to notify about current status. */
  Plugin.prototype.notify = function() {
    this.notification.text(this.getPercent() + '%');
  };

  /** Resets progressbar. */
  Plugin.prototype.reset = function() {
    this.setValue(0);
    this.updateDisplay();
    this.notify();
  };

  Plugin.prototype.onKeyDown = function(event) {
    switch (event.keyCode) {
      case ik_utils.keys.space:
      case ik_utils.keys.enter:
        event.preventDefault();
        event.stopPropagation();
        event.data.plugin.notify();
        break;
    }
  };

  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, pluginName)) {
        $.data(this, pluginName, new Plugin(this, options));
      }
    });
  };
})(jQuery, window, document);
