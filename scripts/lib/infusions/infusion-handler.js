// import { readFile } from "fs/promises";
import notifier from "../notifier.js";
import getWeaponGroupings from "../weapon-grouper.js";
import { getBaseWeaponName, getAssociatedBuff, getWeaponsWithThisBuff } from "../rite-weapon.js";
import { INFUSION_TYPES, addInfusion, overwriteInfusion, revertInfusion } from "./infusion-manager.js";
import InfusionDialog from "../../dialog/infusion-dialog.js";

async function showWeaponChoiceDialog(actor) {
	return new Promise((resolve, reject) => {
		const weapons = getWeaponGroupings(actor);
		const infusionDialog = new InfusionDialog({ weapons, actor, promises: { resolve, reject } });
		infusionDialog.render(true);
	});
}

async function chooseWeaponGroup(actor) {
	try {
		const { weapon: baseId, infusion: infusionId } = await showWeaponChoiceDialog(actor);
		const weapons = getWeaponGroupings(actor);
		const baseItem = actor.items.get(baseId);
		const variantItems = weapons.get(baseId).map((id) => actor.items.get(id));
		return {
			weaponGroup: {
				name: getBaseWeaponName(baseItem, "infusion"),
				base: baseItem,
				all: [baseItem, ...variantItems]
			},
			newInfusion: INFUSION_TYPES[infusionId]
		};
	} catch (e) {
		return {};
	}
}

function confirmInfusionChange(existingInfusion, newInfusion) {
	const currentInfusion = Object.values(INFUSION_TYPES).find((infusion) => infusion.label === existingInfusion.label);
	return new Promise((resolve, reject) => {
		Dialog.confirm({
			title: "Confirm",
			content: `This weapon already has <b>${currentInfusion.label}</b> applied on it.<br></br>Overwrite it with <b>${newInfusion.label}</b>?`,
			yes: resolve,
			no: reject,
			defaultYes: false
		});
	});
}

async function handleInfusion(args) {
	const lastArg = args[args.length - 1];
	const actor = game.actors.get(lastArg.actorId);
	const effectId = lastArg.effectId;

	if (args[0] === "on") {
		const { weaponGroup, newInfusion } = await chooseWeaponGroup(actor);
		if (weaponGroup) {
			const existingInfusion = weaponGroup.base.getFlag("bugrite", "infusion");
			if (existingInfusion) {
				if (existingInfusion.label === newInfusion.label) {
					notifier.notifyBuffAlreadyApplied(newInfusion, weaponGroup.name);
				} else {
					const updateRite = await confirmInfusionChange(existingInfusion, newInfusion);
					if (updateRite) {
						await overwriteInfusion(actor, effectId, weaponGroup.all, weaponGroup.name, newInfusion, existingInfusion);
						notifier.notifyBuffSuccessfullyApplied(newInfusion, weaponGroup.name);
					} else {
						await actor.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
					}
				}
			} else {
				await addInfusion(actor, effectId, weaponGroup.all, weaponGroup.name, newInfusion);
				notifier.notifyBuffSuccessfullyApplied(newInfusion, weaponGroup.name);
			}
		} else {
			await actor.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
		}
	}

	if (args[0] === "off") {
		const { weaponGroupName, weapons } = getWeaponsWithThisBuff(actor, lastArg.efData.flags);
		if (weapons.length > 0) {
			const existingInfusion = getAssociatedBuff(weapons[0], "infusion");
			await revertInfusion(actor, weapons);
			notifier.notifyBuffReverted(existingInfusion, weaponGroupName);
		} else {
			console.warn("No weapon to remove Chromatic Infusion from");
		}
	}
}

export default {
	handleInfusion
};
