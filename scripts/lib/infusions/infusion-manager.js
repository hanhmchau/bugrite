import { getBaseName } from "../weapon-grouper.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getUpdatedInfusion(effectId, weapon, newInfusion) {
	const existingInfusion = weapon.getFlag("bugrite", "infusion");
	const originalName = existingInfusion?.originalName || weapon.data.name;
	const originalParts = existingInfusion?.originalParts || weapon.data.data.damage.parts;
	const originalContext = existingInfusion?.originalContext || weapon.data.flags.betterRolls5e?.quickDamage?.context || {};
	const { damageType, label } = newInfusion;
	return {
		_id: weapon.id,
		name: addInfusionToWeaponName(originalName, damageType),
		"data.damage.parts": [...originalParts, [`1d4`, damageType]],
		flags: {
			bugrite: {
				infusion: {
					effectId,
					label,
					originalName,
					originalParts,
					originalContext
				}
			},
			betterRolls5e: {
				quickDamage: {
					context: {
						...originalContext,
						[originalParts.length]: "Chromatic Infusion"
					}
				}
			}
		}
	};
}

function addInfusionToWeaponName(originalName, label) {
	const variants = [];
	const reBrackets = /\((.*?)\)/g;
	let found = false;
	while ((found = reBrackets.exec(originalName))) {
		const variantsInsideBrackets = found[1].split(",").map((str) => str.trim());
		variants.push(...variantsInsideBrackets);
	}
	variants.push(label.toTitleCase());
	return `${getBaseName(originalName)} (${variants.join(", ")})`;
}

async function updateEffect(actor, effectId, weaponGroupName, weaponIds, newInfusion) {
	const effect = actor.effects.get(effectId);
	if (effect) {
		await effect.update({
			label: `${newInfusion.label} (${weaponGroupName})`,
			flags: {
				bugrite: {
					weaponGroupName,
					weaponIds
				}
			}
		});
	}
}

export async function overwriteInfusion(actor, effectId, weapons, weaponGroupName, newInfusion, existingInfusion) {
	await actor.deleteEmbeddedDocuments("ActiveEffect", [existingInfusion.effectId]);
	await sleep(200);
	await addInfusion(actor, effectId, weapons, weaponGroupName, newInfusion);
}

export async function addInfusion(actor, effectId, weapons, weaponGroupName, newInfusion) {
	const updatePayloads = weapons.map((weapon) => getUpdatedInfusion(effectId, weapon, newInfusion));
	const weaponIds = weapons.map((weapon) => weapon.id);
	await actor.updateEmbeddedDocuments("Item", updatePayloads);
	await updateEffect(actor, effectId, weaponGroupName, weaponIds, newInfusion);
}

export async function revertInfusion(actor, weapons) {
	const revertedData = [];
	for (const weapon of weapons) {
		const appliedRite = weapon.getFlag("bugrite", "infusion");
		if (!appliedRite) return;
		const { originalName, originalParts, originalContext } = appliedRite;
		revertedData.push({
			_id: weapon.id,
			name: `${originalName}`,
			"data.damage.parts": originalParts,
			flags: {
				bugrite: {
					infusion: null
				},
				betterRolls5e: {
					quickDamage: {
						context: originalContext
					}
				}
			}
		});
	}
	await actor.updateEmbeddedDocuments("Item", revertedData);
}

const INFUSION_MAP = {
	ACID: "acid",
	COLD: "cold",
	FIRE: "fire",
	LIGHTNING: "lightning",
	POISON: "poison"
};

function elaborateInfusion(name) {
	const fullName = `Chromatic Infusion (${name.toTitleCase()})`;
	return {
		damageType: INFUSION_MAP[name],
		label: fullName
	};
}

export const INFUSION_TYPES = Object.fromEntries(Object.entries(INFUSION_MAP).map(([name, dmgType]) => [name, elaborateInfusion(name)]));
