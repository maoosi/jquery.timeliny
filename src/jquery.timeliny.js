/**
 * A jQuery plugin for creating interactive year based timelines.
 * Author: Sylvain Simao - https://github.com/maoosi
 */

;(function ( $, window, document, undefined ) {

    "use strict";

	/**
	 * Plugin object constructor.
	 */
	function Plugin(element, options) {

		// References to DOM and jQuery versions of element.
		var el = element;
		var $el = $(element);
		var children = $el.children();

		// Extend default options with those supplied by user.
		options = $.extend({}, $.fn['timeliny'].defaults, options);

		/**
		 * Initialize plugin.
		 * @private
		 */
		function _init() {
			hook('onInit');

			_reorderElems();
			if (options.hideBlankYears === false) {
                _addGhostElems();
            }
			_createWrapper();
			_createDots();
			_fixBlockSizes();
			_clickBehavior();
      		_arrowBehavior();
			_createVerticalLine();
			_updateTimelinePos();
			_resizeBehavior();
			_dragableTimeline();
			_loaded();
		}

		/**
		 * Reorder child elements according order option (uses data-year))
		 * @private
		 */
		function _reorderElems() {
			children.detach().sort(function(a, b) {
				return 	options.order === 'asc' ?
						$(a).data('year') - $(b).data('year') :
						$(b).data('year') - $(a).data('year');
			});

			$el.append(children);
		}

		/**
		 * Plugin is loaded
		 * @private
		 */
		function _loaded() {
			$el.addClass('loaded');

			var currYear = $el.find('.' + options.className + '-timeblock.active').first().attr('data-year');
			hook('afterLoad', [currYear]);
		}

		/**
		 * Add ghost disabled elements for missing years
		 * @private
		 */
		function _addGhostElems() {
			var firstYear = parseInt(children.first().attr('data-year'));
			var lastYear = parseInt(children.last().attr('data-year'));

			if (options.order === 'asc') {
				for (var y=firstYear-options.boundaries; y<lastYear+options.boundaries +1; y++) {
					if ( children.parent().find('[data-year='+ y +']').length <= 0 ) {
						if (y > firstYear-options.boundaries) {
							children.parent().find('[data-year='+ (y - 1) +']').after('<div data-year="' + y + '" class="inactive"></div>');
						} else {
							children.first().before('<div data-year="' + y + '" class="inactive"></div>');
						}
					}
				}
			} else {
				for (var y=firstYear+options.boundaries; y>=lastYear-options.boundaries; y--) {
					if ( children.parent().find('[data-year='+ y +']').length <= 0 ) {
						if (y < firstYear+options.boundaries) {
							children.parent().find('[data-year=' + (y + 1) + ']').after('<div data-year="' + y + '" class="inactive"></div>');
						} else {
							children.first().before('<div data-year="' + y + '" class="inactive"></div>');
						}
					}
				}
			}

			children = $el.children();
		}

		/**
		 * Create wrapper
		 * @private
		 */
		function _createWrapper() {
			return $el.addClass(options.className).children().wrapAll( options.wrapper).wrapAll( '<div class="' + options.className + '-timeline"></div>' );
		}

		/**
		 * Fix sizes of timeline and timeblocks elements
		 * @private
		 */
		function _fixBlockSizes() {
			var timeBlockSize = $el.css('padding-top').replace('px', '') * 0.8;
			$el.find('.' + options.className + '-timeline').css('width', ''+ (children.length * timeBlockSize) +'px');
			$el.find('.' + options.className + '-timeliny-timeblock').css('width', '' + timeBlockSize + 'px');
		}

		/**
		 * Create html structure
		 * @private
		 */
		function _createDots() {
			children.each(function( index ) {
				var text = $(this).html();
				var year = $(this).attr('data-year');

				var dotHtml = '<a href="#' + year + '" class="' + options.className + '-dot" data-year="' + year + '" data-text="' + text + '"></a>';

				$(this).addClass('' + options.className + '-timeblock').html(dotHtml);
			});
		}

		/**
		 * Create vertical line
		 * @private
		 */
		function _createVerticalLine() {
			$el.append('<div class="' + options.className + '-vertical-line"></div>');
		}

		/**
		 * Update the position of the timeline
		 * @private
		 */
		function _updateTimelinePos(callEvent) {
			var linePos = $el.find('.' + options.className + '-vertical-line').position().left;
			var activeDotPos = $el.find('.' + options.className + '-timeblock.active').position().left;
			var dotRadius = $el.find('.' + options.className + '-timeblock.active .' + options.className + '-dot').width() / 2;

			var diff = activeDotPos - linePos;
			var left;

			if (diff > 0) {
				left = '-' + (Math.abs(diff) + dotRadius + 1) +'';
			} else {
				left = '+' + (Math.abs(diff) - dotRadius - 1) +'';
			}

			$el.find('.' + options.className + '-timeline').animate({
				left: left
			}, options.animationSpeed, function() {
				if (typeof callEvent != 'undefined') {
					if (callEvent === 'click') {
						var currYear = $el.find('.' + options.className + '-timeblock.active').first().attr('data-year');
						hook('afterChange', [currYear]);
					}
					else if (callEvent === 'resize') hook('afterResize');
				}
			});
		}

		/**
		 * Listen for click event
		 * @private
		 */
		function _clickBehavior() {
			children.parent().find('.' + options.className + '-timeblock:not(.inactive) .' + options.className + '-dot').on('click', function(e) {
				e.preventDefault();

				var currYear = $(this).parent().parent().find('.' + options.className + '-timeblock.active').attr('data-year');
				var nextYear = $(this).attr('data-year');

				if (currYear != nextYear) {
					hook('onLeave', [currYear, nextYear]);

					children.removeClass('active');
					$(this).closest('.' + options.className + '-timeblock').addClass('active');
				}

				_updateTimelinePos('click');

				return false;
			});
		}

		/**
		 * Arrow keys navigation
		 * @private
		 */
		function _arrowBehavior() {
			$('html').keydown(function (e) {

				if (e.which == 39) {
					var years = $(this).find('.' + options.className + '-timeblock:not(.inactive) .' + options.className + '-dot');
					var currYear = $(years).parent().parent().find('.' + options.className + '-timeblock.active').attr('data-year');
					var nextYear = $(years).parent().parent().find('.' + options.className + '-timeblock.active').next().attr('data-year');
					goToYear(nextYear);
				} else if (e.which == 37) {
					var years = $(this).find('.' + options.className + '-timeblock:not(.inactive) .' + options.className + '-dot');
					var currYear = $(years).parent().parent().find('.' + options.className + '-timeblock.active').attr('data-year');
					var prevYear = $(years).parent().parent().find('.' + options.className + '-timeblock.active').prev().attr('data-year');
					goToYear(prevYear);
				}

			});
		}

		/**
		 * Listen resize event
		 * @private
		 */
		function _resizeBehavior() {

			function debounce(callback, delay) {
				var timer;
				return function(){
					var args = arguments;
					var context = this;
					clearTimeout(timer);
					timer = setTimeout(function(){
						callback.apply(context, args);
					}, delay)
				}
			}

			$(window).on('resize.timeliny', debounce(function() {
				_updateTimelinePos('resize');
			}, 350));
		}

		/**
		 * Make the timeline draggable
		 * @private
		 */
		function _dragableTimeline() {

			var selected = null, x_pos = 0, x_elem = 0;

			// Will be called when user starts dragging an element
			function _drag_init(elem) {
				selected = elem;
				x_elem = x_pos - selected.offsetLeft;
			}

			// Will be called when user dragging an element
			function _move_elem(e) {
				x_pos = document.all ? window.event.clientX : e.pageX;
				if (selected !== null) {
					selected.style.left = (x_pos - x_elem) + 'px';
				}
			}

			// Destroy the object when we are done
			function _stop_move() {
				if (selected) {
					// active the closest elem
					var linePos = $el.find('.' + options.className + '-vertical-line').offset().left;
					var closestDotYear = null;
					var diff = 99999999999999999999999;

					children.parent().find('.' + options.className + '-timeblock:not(.inactive) .' + options.className + '-dot').each(function (index) {
						var currDotPos = $(this).offset().left;
						var currDiff = Math.abs(currDotPos - linePos);

						if (currDiff < diff) {
							console.log($(this).attr('data-year'));
							closestDotYear = $(this).attr('data-year');
							diff = currDiff;
						}
					});

					$el.find('.' + options.className + '-dot[data-year=' + closestDotYear + ']').trigger('click');
					selected = null;
				}
			}

			// Bind the functions...
			$el.first().on('mousedown', function() {
				_drag_init($el.find('.'+ options.className +'-timeline')[0]);
				return false;
			});

			$(document).on('mousemove.timeliny', function(e) {
				_move_elem(e);
			});

			$(document).on('mouseup.timeliny', function() {
				_stop_move();
			});
		}

		/**
		 * Go to a particular year
		 * @public
		 */
		function goToYear(year) {
			var selector = $el.find('.' + options.className + '-timeblock[data-year=' + year + ']:not(.inactive) .' + options.className + '-dot').first();
			if (selector.length > 0) {
				selector.trigger('click');
			}
		}

		/**
		 * Get/set options.
		 * Get usage: $('#el').timeliny('option', 'key');
		 * Set usage: $('#el').timeliny('option', 'key', value);
		 */
		function option (key, val) {
			if (val) {
				options[key] = val;
			} else {
				return options[key];
			}
		}

		/**
		 * Destroy plugin.
		 * Usage: $('#el').timeliny('destroy');
		 */
		function destroy() {
			// Iterate over each matching element.
			$el.each(function() {
				var el = this;
				var $el = $(this);

				// Destroy completely the element and remove event listeners
				$(window).off('resize.timeliny');
				$el.find('.' + options.className + '-timeblock:not(.inactive) .' + options.className + '-dot').off('click');
				$(document).off('mousemove.timeliny');
				$(document).off('mouseup.timeliny');
				$el.first().off('mousedown');
				$el.remove();
				hook('onDestroy');

				// Remove Plugin instance from the element.
				$el.removeData('plugin_timeliny');
			});
		}

		/**
		 * Callback hooks.
		 */
		function hook(hookName, args) {
			if (options[hookName] !== undefined) {
				// Call the user defined function.
				// Scope is set to the jQuery element we are operating on.
				options[hookName].apply(el, args);
			}
		}

		// Initialize the plugin instance.
		_init();

		// Expose methods of Plugin we wish to be public.
		return {
			option: option,
			destroy: destroy,
			goToYear: goToYear
		};
	}

	/**
	 * Plugin definition.
	 */
	$.fn['timeliny'] = function(options) {
        console.log(options);
		// If the first parameter is a string, treat this as a call to
		// a public method.
		if (typeof arguments[0] === 'string') {
			var methodName = arguments[0];
			var args = Array.prototype.slice.call(arguments, 1);
			var returnVal;
			this.each(function() {
				// Check that the element has a plugin instance, and that
				// the requested public method exists.
				if ($.data(this, 'plugin_timeliny') && typeof $.data(this, 'plugin_timeliny')[methodName] === 'function') {
					// Call the method of the Plugin instance, and Pass it
					// the supplied arguments.
					returnVal = $.data(this, 'plugin_timeliny')[methodName].apply(this, args);
				} else {
					throw new Error('Method ' +  methodName + ' does not exist on jQuery.timeliny');
				}
			});
			if (returnVal !== undefined){
				// If the method returned a value, return the value.
				return returnVal;
			} else {
				// Otherwise, returning 'this' preserves chainability.
				return this;
			}
			// If the first parameter is an object (options), or was omitted,
			// instantiate a new instance of the plugin.
		} else if (typeof options === "object" || !options) {
			return this.each(function() {
				// Only allow the plugin to be instantiated once.
				if (!$.data(this, 'plugin_timeliny')) {
					// Pass options to Plugin constructor, and store Plugin
					// instance in the elements jQuery data object.
					$.data(this, 'plugin_timeliny', new Plugin(this, options));
				}
			});
		}
	};

	// Default plugin options.
	// Options can be overwritten when initializing plugin, by
	// passing an object literal, or after initialization:
	// $('#el').timeliny('option', 'key', value);
	$.fn['timeliny'].defaults = {
		order: 'asc',
		className: 'timeliny',
		wrapper: '<div class="timeliny-wrapper"></div>',
		boundaries: 2,
		animationSpeed: 250,
        hideBlankYears: false,
		onInit: function() {},
		onDestroy: function() {},
		afterLoad: function(currYear) {},
		onLeave: function(currYear, nextYear) {},
		afterChange: function(currYear) {},
		afterResize: function() {}
	};

})( jQuery, window, document );
