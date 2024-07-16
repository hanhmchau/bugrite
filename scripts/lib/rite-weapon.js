export function getAssociatedBuff(weapon, flagKey) {
	return weapon.getFlag("bugrite", flagKey);
}

export function getBaseWeaponName(weapon, flagKey) {
	const rite = weapon.getFlag("bugrite", flagKey);
	if (rite) {
		return rite.originalName;
	} else {
		return weapon.data.name;
	}
}

export function getWeaponsWithThisBuff(actor, efDataFlags) {
	const buffEffectFlags = efDataFlags.bugrite || {};
	const weaponGroupName = buffEffectFlags.weaponGroupName || "";
	const associatedWeaponIds = buffEffectFlags.weaponIds || [];
	return {
		weaponGroupName,
		weapons: actor.items.filter((item) => associatedWeaponIds.includes(item.id))
	};
}
