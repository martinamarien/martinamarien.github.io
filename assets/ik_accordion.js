(function($, window, document, undefined) {
  var pluginName = 'ik_accordion',
    defaults = {
      // set default parameters
      autoCollapse: false,
      animationSpeed: 200
    };

  /**
   * @constructs Plugin
   * @param {Object} element - Current DOM element from selected collection.
   * @param {Object} options - Configuration options.
   * @param {boolean} options.autoCollapse - Automatically collapse inactive panels.
   * @param {number} options.animationSpeed - Panel toggle speed in milliseconds.
   */
  function Plugin(element, options) {
    this._name = pluginName;
    this._defaults = defaults;
    this.element = $(element);
    this.options = $.extend({}, defaults, options); // override default parameters if setup object is present

    this.init();
  }

  /** Initializes plugin. */
  Plugin.prototype.init = function() {
    var id, $elem, plugin;

    id = 'acc' + $('.ik_accordion').length; // create unique id
    $elem = this.element;
    plugin = this;

    $elem
      .attr({
        id: id,
        role: 'region'
      })
      .addClass('ik_accordion');

    $elem.attr({ 'aria-multiselectable': !this.options.autoCollapse });

    this.headers = $elem
      .children('dt')
      .attr({
        role: 'heading'
      })
      .each(function(i, el) {
        var $me, $btn;

        $me = $(el);
        $btn = $('<div/>')
          .attr({
            id: id + '_btn_' + i,
            role: 'button',
            'aria-controls': id + '_panel_' + i,
            'aria-expanded': false,
            tabindex: 0
          })
          .addClass('button')
          .html($me.html())
          .on('keydown', { plugin: plugin }, plugin.onKeyDown)
          .on('click', { plugin: plugin }, plugin.togglePanel);

        $me.empty().append($btn); // wrap content of each header in an element with role button
      });

    this.panels = $elem
      .children('dd')
      .each(function(i, el) {
        var $me = $(this),
          id = $elem.attr('id') + '_panel_' + i;
        $me.attr({
          id: id,
          role: 'region',
          'aria-hidden': true,
          tabindex: 0
        });
      })
      .hide();
  };

  /**
   * Toggles accordion panel.
   *
   * @param {Object} event - Keyboard or mouse event.
   * @param {object} event.data - Event data.
   * @param {object} event.data.plugin - Reference to plugin.
   */
  Plugin.prototype.togglePanel = function(event) {
    var plugin, $elem, $panel, $me, isVisible;

    plugin = event.data.plugin;
    $elem = $(plugin.element);
    $me = $(event.target);
    $panel = $me.parent('dt').next();

    if (plugin.options.autoCollapse) {
      // expand current panel and collapse the rest

      plugin.headers.each(function(i, el) {
        var $hdr, $btn, $currentPanel;

        $hdr = $(el);
        $btn = $hdr.find('.button');
        $currentPanel = $hdr.next('dd');

        if ($btn[0] != $(event.currentTarget)[0]) {
          $btn.removeClass('expanded').attr({
            'aria-expanded': false
          });
          $hdr.next().slideUp(plugin.options.animationSpeed);
          $currentPanel.attr({ 'aria-hidden': true });
        } else {
          if ($btn.hasClass('expanded')) {
            $btn.removeClass('expanded').attr({
              'aria-expanded': false
            });
            $currentPanel.attr({ 'aria-hidden': true });
            $hdr.next().slideUp(plugin.options.animationSpeed);
          } else {
            $btn.addClass('expanded').attr({
              'aria-expanded': true
            });
            $hdr.next().slideDown(plugin.options.animationSpeed);
            $currentPanel.attr({ 'aria-hidden': false });
          }
        }
      });
    } else {
      // toggle current panel depending on the state
      if ($me.hasClass('expanded')) {
        $me.removeClass('expanded').attr({
          'aria-expanded': false
        });
        $panel.attr({ 'aria-hidden': true });
        $panel.slideToggle({ duration: plugin.options.animationSpeed });
      } else {
        $me.addClass('expanded').attr({
          'aria-expanded': true
        });
        $panel.slideToggle({ duration: plugin.options.animationSpeed });
        $panel.attr({ 'aria-hidden': false });
      }
    }
  };

  Plugin.prototype.onKeyDown = function(event) {
    var $me, $header, plugin, $elem, $current, ind;

    $me = $(event.target);
    $header = $me.parent('dt');
    plugin = event.data.plugin;
    $elem = $(plugin.element);

    switch (event.keyCode) {
      case ik_utils.keys.enter:
      case ik_utils.keys.space:
        event.preventDefault();
        event.stopPropagation();
        plugin.togglePanel(event);
        break;

      case ik_utils.keys.up:
        ind = plugin.headers.index($header);
        if (ind > 0) {
          plugin.headers
            .eq(--ind)
            .find('.button')
            .focus();
        }
        break;

      case ik_utils.keys.down:
        ind = plugin.headers.index($header);
        if (ind < plugin.headers.length - 1) {
          plugin.headers
            .eq(++ind)
            .find('.button')
            .focus();
        }
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
