// import { readFile } from "fs/promises";
import { RITE_TYPES, addRite, revertRite, overwriteRite } from "./rite-manager.js";
import notifier from "../notifier.js";
import getWeaponGroupings from "../weapon-grouper.js";
import RiteDialog from "../../dialog/rite-dialog.js";
import { getBaseWeaponName, getWeaponsWithThisBuff, getAssociatedBuff } from "../rite-weapon.js";

async function showWeaponChoiceDialog(actor, newRite) {
	return new Promise((resolve, reject) => {
		const weapons = getWeaponGroupings(actor);
		const riteDialog = new RiteDialog({ weapons, actor, newRite, promises: { resolve, reject } });
		riteDialog.render(true);
	});
}

async function chooseWeaponGroup(actor, newRite) {
	try {
		const baseId = await showWeaponChoiceDialog(actor, newRite);
		const weapons = getWeaponGroupings(actor);
		const baseItem = actor.items.get(baseId);
		const variantItems = weapons.get(baseId).map((id) => actor.items.get(id));
		return {
			name: getBaseWeaponName(baseItem, "rite"),
			base: baseItem,
			all: [baseItem, ...variantItems]
		};
	} catch (e) {
		return;
	}
}

function confirmRiteChange(existingRite, newRite) {
	const currentRite = Object.values(RITE_TYPES).find((riteType) => riteType.label === existingRite.label);
	return new Promise((resolve, reject) => {
		Dialog.confirm({
			title: "Confirm",
			content: `This weapon already has <b>${currentRite.label} (${currentRite.damageType})</b> applied on it.<br></br>Overwrite it with <b>${newRite.label} (${newRite.damageType})</b>?`,
			yes: resolve,
			no: reject,
			defaultYes: false
		});
	});
}

async function handleRite(args) {
	const lastArg = args[args.length - 1];
	const actor = game.actors.get(lastArg.actorId);
	const effectId = lastArg.effectId;
	const newRite = RITE_TYPES[args[1]];

	if (args[0] === "on") {
		const weaponGroup = await chooseWeaponGroup(actor, newRite);
		if (weaponGroup) {
			const existingRite = weaponGroup.base.getFlag("bugrite", "rite");
			if (existingRite) {
				if (existingRite.label === newRite.label) {
					notifier.notifyBuffAlreadyApplied(newRite, weaponGroup.name);
				} else {
					const updateRite = await confirmRiteChange(existingRite, newRite);
					if (updateRite) {
						await overwriteRite(actor, effectId, weaponGroup.all, weaponGroup.name, newRite, existingRite);
						notifier.notifyBuffSuccessfullyApplied(newRite, weaponGroup.name);
					} else {
						await actor.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
					}
				}
			} else {
				await addRite(actor, effectId, weaponGroup.all, weaponGroup.name, newRite);
				notifier.notifyBuffSuccessfullyApplied(newRite, weaponGroup.name);
			}
		} else {
			await actor.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
		}
	}

	if (args[0] === "off") {
		const { weaponGroupName, weapons } = getWeaponsWithThisBuff(actor, lastArg.efData.flags);
		if (weapons.length > 0) {
			const existingRite = getAssociatedBuff(weapons[0], "rite");
			await revertRite(actor, weapons);
			notifier.notifyBuffReverted(existingRite, weaponGroupName);
		} else {
			console.warn("No weapon to remove Rite from");
		}
	}
}

export default {
	handleRite
};
