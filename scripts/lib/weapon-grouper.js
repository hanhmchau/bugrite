export default function getWeaponGroupings(actor) {
	const weapons = actor.items.filter((item) => item.data.type === "weapon");
	return groupWeapons(weapons);
}

function groupWeapons(weapons) {
	const map = new Map();
	for (const wep of weapons) {
		const baseWepName = getBaseName(wep.name);
		const weaponGroup = map.get(baseWepName) || [];
		map.set(baseWepName, [...weaponGroup, wep]);
	}
	const groupingMaps = new Map();
	map.forEach((weapons, baseName) => {
		const baseWeapon = weapons.find((wep) => wep.name.trim() === baseName) || weapons[0];
		const variants = weapons.filter((wep) => wep !== baseWeapon).map((wep) => wep.id);
		groupingMaps.set(baseWeapon.id, variants);
	});
	return groupingMaps;
}

export function getBaseName(fullName) {
	return fullName.trim().split("(", 1)[0].trim();
}
