import RiteDialog from "./dialog/rite-dialog.js";
import RiteHandler from "./lib/rite-handler.js";

Hooks.once("init", async function () {});

Hooks.once("ready", async function () {
	window.RiteHandler = RiteHandler;
	window.RiteDialog = RiteDialog;
	loadTemplates(["modules/bugrite/templates/select/option.hbs", "modules/bugrite/templates/select/variant-list.hbs"]);

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
}
