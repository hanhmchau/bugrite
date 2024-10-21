import { INFUSION_TYPES } from "../lib/infusions/infusion-manager.js";
import { getAssociatedBuff, getBaseWeaponName } from "../lib/rite-weapon.js";

const flagKey = "infusion";
const pic = (name) => `modules/bugrite/assets/infusions/${name}`;
const INFUSION_MAP = {
	ACID: pic("oil-spill.png"),
	COLD: pic("ice-cube.png"),
	FIRE: pic("fire.png"),
	LIGHTNING: pic("lightning.png"),
	POISON: pic("poison.png")
};

export default class InfusionDialog extends FormApplication {
	constructor(object, options) {
		super(object, options);
	}

	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["form"],
			popOut: true,
			closeOnSubmit: false,
			height: 430,
			resizable: false,
			template: `modules/bugrite/templates/chromatic-infusion.hbs`,
			id: "choose-weapon-for-infusion-application",
			title: "Chromatic Infusion"
		});
	}

	getData(options = {}) {
		// Send data to the template
		const { weapons, actor } = this.object;
		const baseWeaponIds = [...weapons.keys()];
		return {
			damageTypes: Object.entries(INFUSION_TYPES).map(([key, infusionType]) => ({
				key,
				...infusionType,
				damageType: infusionType.damageType.toTitleCase(),
				img: INFUSION_MAP[key]
			})),
			weapons: baseWeaponIds.map((baseWeaponId) => {
				const variantIds = weapons.get(baseWeaponId);
				const baseWeapon = actor.items.get(baseWeaponId);
				const existingBuff = getAssociatedBuff(baseWeapon, flagKey);
				return {
					id: baseWeapon.id,
					name: getBaseWeaponName(baseWeapon, flagKey),
					icon: baseWeapon.data.img,
					existingBuff: existingBuff?.label,
					variants: variantIds.map((id) => actor.items.get(id)).map((item) => getBaseWeaponName(item, flagKey))
				};
			})
		};
	}

	activateListeners(html) {
		super.activateListeners(html);
		const element = this.element;
		const afterSlide =
			(className, height = "auto") =>
			() => {
				$(element).css("height", height);
				$(element).find(".middle-wrap").removeClass("left right").addClass(className);
			};

		html.on("mouseenter", ".con-tooltip", function (event) {
			const offset = $(this).offset();
			$(this)
				.find(".tooltip")
				.css({
					top: offset.top,
					left: offset.left + $(this).outerWidth() + 10,
					display: "block"
				});
		})
			.on("mouseleave", ".con-tooltip", function (event) {
				$(this).find(".tooltip").css({
					display: "none"
				});
			})
			.on("input", "input[name=infusion]", function (event) {
				$(html)
					.find(".middle-wrap")
					.animate(
						{ left: "-100%" },
						{
							complete: afterSlide("right")
						}
					);
			})
			.on("click", ".back", function (event) {
				$("input[name=infusion]").prop("checked", false);

				$(html)
					.find(".middle-wrap")
					.animate(
						{ left: "0" },
						{
							complete: afterSlide("left", "440px")
						}
					);
			});
	}

	async _updateObject(event, formData) {
		if (formData.weapon) {
			this.object.promises.resolve(formData);
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

function animateCSS(element, animation, prefix = "animate__") {
	// We create a Promise and return it
	return new Promise((resolve, reject) => {
		const animationName = `${prefix}${animation}`;
		const node = element instanceof jQuery ? element.get(0) : element instanceof HTMLElement ? element : document.querySelector(element);

		node.classList.add(`${prefix}animated`, animationName);

		// When the animation ends, we clean the classes and resolve the Promise
		function handleAnimationEnd(event) {
			event.stopPropagation();
			node.classList.remove(`${prefix}animated`, animationName);
			resolve("Animation ended");
		}

		node.addEventListener("animationend", handleAnimationEnd, { once: true });
	});
}
