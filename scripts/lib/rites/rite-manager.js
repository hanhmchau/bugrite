import { getBaseName } from "../weapon-grouper.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function getUpdatedRite(effectId, damageDice, weapon, newRite) {
	const existingRite = weapon.getFlag("bugrite", "rite");
	const originalName = existingRite?.originalName || weapon.data.name;
	const originalParts = existingRite?.originalParts || weapon.data.data.damage.parts;
	const originalContext = existingRite?.originalContext || weapon.data.flags.betterRolls5e?.quickDamage?.context || {};
	const { damageType, label } = newRite;
	return {
		_id: weapon.id,
		name: addRiteToWeaponName(originalName, label),
		"data.damage.parts": [...originalParts, [`1d${damageDice}`, damageType]],
		flags: {
			bugrite: {
				rite: {
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
						[originalParts.length]: label
					}
				}
			}
		}
	};
}

function addRiteToWeaponName(originalName, label) {
	const variants = [];
	const reBrackets = /\((.*?)\)/g;
	let found = false;
	while ((found = reBrackets.exec(originalName))) {
		const variantsInsideBrackets = found[1].split(",").map((str) => str.trim());
		variants.push(...variantsInsideBrackets);
	}
	variants.push(label);
	return `${getBaseName(originalName)} (${variants.join(", ")})`;
}

async function updateEffect(actor, effectId, weaponGroupName, weaponIds, newRite) {
	const effect = actor.effects.get(effectId);
	if (effect) {
		const [riteKey] = Object.entries(RITE_TYPES).find(([key, riteType]) => riteType.label === newRite.label);

		await effect.update({
			label: `${newRite.label} (${weaponGroupName})`,
			flags: {
				bugrite: {
					riteKey,
					weaponGroupName,
					weaponIds
				}
			}
		});
	}
}

export async function overwriteRite(actor, effectId, weapons, weaponGroupName, newRite, existingRite) {
	await actor.deleteEmbeddedDocuments("ActiveEffect", [existingRite.effectId]);
	await sleep(200);
	await addRite(actor, effectId, weapons, weaponGroupName, newRite);
}

export async function addRite(actor, effectId, weapons, weaponGroupName, newRite) {
	const updatePayloads = weapons.map((weapon) => getUpdatedRite(effectId, getHemocraftDice(actor), weapon, newRite));
	const weaponIds = weapons.map((weapon) => weapon.id);
	await actor.updateEmbeddedDocuments("Item", updatePayloads);
	await updateEffect(actor, effectId, weaponGroupName, weaponIds, newRite);
}

export async function revertRite(actor, weapons) {
	const revertedData = [];
	for (const weapon of weapons) {
		const appliedRite = weapon.getFlag("bugrite", "rite");
		if (!appliedRite) return;
		const { originalName, originalParts, originalContext } = appliedRite;
		revertedData.push({
			_id: weapon.id,
			name: `${originalName}`,
			"data.damage.parts": originalParts,
			flags: {
				bugrite: {
					rite: null
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

function getHemocraftDice(actor) {
	const bloodHunterLevel = actor.classes["blood-hunter"]?.data?.data?.levels || 0;
	return 2 + Math.ceil((bloodHunterLevel + 2) / 6, 1) * 2;
}

const RITE_MAP = {
	FLAME: "fire",
	FROZEN: "cold",
	STORM: "lightning",
	DEAD: "necrotic",
	ORACLE: "psychic",
	ROAR: "thunder",
	DAWN: "radiant"
};

function elaborateRite(name) {
	return {
		damageType: RITE_MAP[name],
		label: `${name.toTitleCase()} Rite`,
		riteFullName: `Rite of the ${name.toTitleCase()}`
	};
}

export const RITE_TYPES = Object.fromEntries(Object.entries(RITE_MAP).map(([name, dmgType]) => [name, elaborateRite(name)]));
