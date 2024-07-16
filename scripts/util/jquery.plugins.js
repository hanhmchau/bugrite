/**
 * jQuery alterClass plugin
 *
 * Remove element classes with wildcard matching. Optionally add classes:
 *   $( '#foo' ).alterClass( 'foo-* bar-*', 'foobar' )
 *
 * Copyright (c) 2011 Pete Boere (the-echoplex.net)
 * Free under terms of the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 */
(function ($) {
	$.fn.alterClass = function (removals, additions) {
		var self = this;

		if (removals.indexOf("*") === -1) {
			// Use native jQuery methods if there is no wildcard matching
			self.removeClass(removals);
			return !additions ? self : self.addClass(additions);
		}

		var patt = new RegExp("\\s" + removals.replace(/\*/g, "[A-Za-z0-9-_]+").split(" ").join("\\s|\\s") + "\\s", "g");

		self.each(function (i, it) {
			var cn = " " + it.className + " ";
			while (patt.test(cn)) {
				cn = cn.replace(patt, " ");
			}
			it.className = $.trim(cn);
		});

		return !additions ? self : self.addClass(additions);
	};

	$.fn.removeClassPrefix = function (prefix) {
		this.each(function (i, el) {
			var classes = el.className.split(" ").filter(function (c) {
				return c.lastIndexOf(prefix, 0) !== 0;
			});
			el.className = $.trim(classes.join(" "));
		});
		return this;
	};

	$.fn.cleanimate = function () {
		const self = this;
		self.on("animationend", (ev) => {
			self.removeClassPrefix("animate__");
		});

		return self;
	};

	$.fn.animateCSS = function (animation, callback = () => {}, prefix = "animate__") {
		const node = this.get(0);
		const animationName = `${prefix}${animation}`;

		node.classList.add(`${prefix}animated`, animationName);

		// When the animation ends, we clean the classes
		function handleAnimationEnd(event) {
			event.stopPropagation();
			node.classList.remove(`${prefix}animated`, animationName);
			callback();
		}

		node.addEventListener("animationend", handleAnimationEnd, { once: true });
		return node;
	};
})(jQuery);
