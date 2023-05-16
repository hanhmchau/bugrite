export function getAssociatedRite(weapon) {
	return weapon.getFlag("bugrite", "rite");
}

export function getBaseWeaponName(weapon) {
	const rite = weapon.getFlag("bugrite", "rite");
	if (rite) {
		return rite.originalName;
	} else {
		return weapon.data.name;
	}
}

export function getWeaponsWithThisRite(actor, efDataFlags) {
	const riteEffectFlags = efDataFlags.bugrite || {};
	const weaponGroupName = riteEffectFlags.weaponGroupName || "";
	const associatedWeaponIds = riteEffectFlags.weaponIds || [];
	return {
		weaponGroupName,
		weapons: actor.items.filter((item) => associatedWeaponIds.includes(item.id))
	};
}
