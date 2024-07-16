import InfusionDialog from "./dialog/infusion-dialog.js";
import RiteDialog from "./dialog/rite-dialog.js";
import InfusionHandler from "./lib/infusions/infusion-handler.js";
import RiteHandler from "./lib/rites/rite-handler.js";

Hooks.once("init", async function () {});

Hooks.once("ready", async function () {
	console.warn(RiteHandler, InfusionHandler);

	window.RiteHandler = RiteHandler;
	window.RiteDialog = RiteDialog;

	window.InfusionHandler = InfusionHandler;
	window.InfusionDialog = InfusionDialog;

	loadTemplates(["modules/bugrite/templates/select/option.hbs", "modules/bugrite/templates/select/variant-list.hbs", "modules/bugrite/templates/select/damage-type.hbs"]);

	registerHandlebarsHelpers();
});

function registerHandlebarsHelpers() {
	Handlebars.registerHelper("pluralize", function (number, single, plural) {
		if (number === 1) {
			return single;
		} else {
			return plural;
		}
	});

	Handlebars.registerHelper("toLowerCase", function (str) {
		return str.toLowerCase();
	});
}

jQuery.fn.extend({
	slideRightShow: function () {
		return this.each(function () {
			jQuery(this).animate({ width: "show" });
		});
	},
	slideLeftHide: function () {
		return this.each(function () {
			jQuery(this).animate({ width: "hide" });
		});
	},
	slideLeftShow: function (speed, fn) {
		return $(this).animate(
			{
				opacity: 1,
				width: "auto"
			},
			speed || 400,
			function () {
				$.isFunction(fn) && fn.call(this);
			}
		);
	},
	slideRightHide: function (speed, fn) {
		return $(this).animate(
			{
				opacity: 0,
				width: "0px"
			},
			speed || 400,
			function () {
				$.isFunction(fn) && fn.call(this);
			}
		);
	}
});
