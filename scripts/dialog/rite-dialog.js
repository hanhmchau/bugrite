import { getAssociatedBuff, getBaseWeaponName } from "../lib/rite-weapon.js";

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
			newBuff: newRite.label,
			weapons: baseWeaponIds.map((baseWeaponId) => {
				const variantIds = weapons.get(baseWeaponId);
				const baseWeapon = actor.items.get(baseWeaponId);
				const existingBuff = getAssociatedBuff(baseWeapon, "rite");
				return {
					id: baseWeapon.id,
					name: getBaseWeaponName(baseWeapon, "rite"),
					icon: baseWeapon.data.img,
					existingBuff: existingBuff?.label,
					variants: variantIds.map((id) => actor.items.get(id)).map((item) => getBaseWeaponName(item, "rite"))
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
