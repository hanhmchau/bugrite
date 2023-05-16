import { getAssociatedRite, getBaseWeaponName } from "../lib/rite-weapon.js";

export default class RiteDialog extends FormApplication {
	constructor(object, options) {
		super(object, options);
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["form"],
			popOut: true,
			closeOnSubmit: false,
			resizable: false,
			template: `modules/bugrite/templates/choose-weapon.hbs`,
			id: "choose-weapon-for-rite-application",
			title: "Choose Crimson Rite weapon"
		});
	}

	getData(options = {}) {
		// Send data to the template
		const { weapons, actor, newRite } = this.object;
		const baseWeaponIds = [...weapons.keys()];
		return {
			newRite: newRite.riteLabel,
			weapons: baseWeaponIds.map((baseWeaponId) => {
				const variantIds = weapons.get(baseWeaponId);
				const baseWeapon = actor.items.get(baseWeaponId);
				const existingRite = getAssociatedRite(baseWeapon);
				return {
					id: baseWeapon.id,
					name: getBaseWeaponName(baseWeapon),
					icon: baseWeapon.data.img,
					existingRite: existingRite?.riteLabel,
					variants: variantIds.map((id) => actor.items.get(id)).map((item) => getBaseWeaponName(item))
				};
			})
		};
	}

	activateListeners(html) {
		super.activateListeners(html);
		html.on("mouseenter", ".con-tooltip", function (event) {
			const offset = $(this).offset();
			$(this)
				.find(".tooltip")
				.css({
					top: offset.top,
					left: offset.left + $(this).outerWidth() + 10,
					display: "block"
				});
		}).on("mouseleave", ".con-tooltip", function (event) {
			$(this).find(".tooltip").css({
				display: "none"
			});
		});
	}

	async _updateObject(event, formData) {
		if (formData.weapon) {
			this.object.promises.resolve(formData.weapon);
		} else {
			this.object.promises.reject();
		}
		super.close();
	}

	close(options = {}) {
		this.object.promises.reject();
		super.close(options);
	}
}

// const riteDialog = new RiteDialog(data); // data, options
// const res = await riteDialog.render(true);
