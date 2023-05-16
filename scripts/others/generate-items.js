/** MACRO USED TO GENERATE CRIMSON RITE FEATURE ITEMS */

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
		riteLabel: `${name.toTitleCase()} Rite`,
		riteFullName: `Rite of the ${name.toTitleCase()}`
	};
}

const RITE_TYPES = Object.fromEntries(Object.entries(RITE_MAP).map(([name, dmgType]) => [name, elaborateRite(name)]));

const riteSelfDamage = `1d(ceil((@classes.blood-hunter.levels + 2) / 6, 1) * 2 + 2)`;

const RITE_PIC = {
	FLAME: "icons/magic/fire/dagger-rune-enchant-flame-strong-red.webp",
	FROZEN: "icons/magic/fire/dagger-rune-enchant-flame-strong-blue.webp",
	STORM: "icons/magic/fire/dagger-rune-enchant-flame-strong-purple.webp",
	DEAD: "icons/magic/fire/dagger-rune-enchant-flame-strong-purple-pink.webp",
	ORACLE: "icons/magic/fire/dagger-rune-enchant-flame-strong-teal-purple.webp",
	ROAR: "icons/magic/fire/dagger-rune-enchant-flame-strong-orange.webp",
	DAWN: "icons/magic/fire/dagger-rune-enchant-flame-strong-blue-yellow.webp"
};

function buildDescription(rite) {
	return `<p>As a bonus action, you can activate any rite you know on one weapon you're holding. The effect of the rite lasts until you finish a short or long rest. When you activate a rite, you take necrotic damage equal to one roll of your hemocraft die. This damage can't be reduced in any way.</p>
<p>While the rite is in effect, attacks you make with this weapon are magical, and deal extra damage equal to your hemocraft die of the type determined by the chosen rite. A weapon can hold only one active rite at a time. Other creatures can't gain the benefit of your rite.</p>
<p><strong>${rite.riteFullName}. </strong>The extra damage dealt by your rite is ${rite.damageType} damage.</p>`;
}

function buildRite(riteName) {
	const img = RITE_PIC[riteName];
	const rite = RITE_TYPES[riteName];
	const riteDesc = buildDescription(rite);
	return {
		name: rite.riteFullName,
		type: "feat",
		img,
		folder: "PPo3r7uWkoNVW6j0",
		data: {
			description: {
				value: riteDesc,
				chat: "",
				unidentified: ""
			},
			source: "",
			activation: {
				type: "bonus",
				cost: 1,
				condition: ""
			},
			duration: {
				value: null,
				units: "spec"
			},
			target: {
				value: null,
				width: null,
				units: "",
				type: "self"
			},
			range: {
				value: null,
				long: null,
				units: ""
			},
			uses: {
				value: null,
				max: "",
				per: ""
			},
			consume: {
				type: "",
				target: "",
				amount: null
			},
			ability: "",
			actionType: "other",
			attackBonus: 0,
			chatFlavor: "",
			critical: {
				threshold: null,
				damage: ""
			},
			damage: {
				parts: [[riteSelfDamage, "necrotic"]],
				versatile: ""
			},
			formula: "",
			save: {
				ability: "",
				dc: null,
				scaling: "spell"
			},
			requirements: "",
			recharge: {
				value: null,
				charged: false
			}
		},
		effects: [
			{
				changes: [
					{
						key: "macro.itemMacro",
						mode: 0,
						value: riteName,
						priority: "20"
					}
				],
				disabled: false,
				duration: {
					combat: undefined,
					rounds: undefined,
					seconds: undefined,
					startRound: undefined,
					startTime: null,
					startTurn: undefined,
					turns: undefined
				},
				icon: img,
				label: rite.riteLabel,
				origin: "Actor.Pg2fMwoMNXgLlMPt.Item.OQN0acdG62ucNsQb",
				transfer: false,
				flags: {
					dae: {
						selfTarget: true,
						stackable: "noneName",
						durationExpression: "",
						macroRepeat: "none",
						specialDuration: ["shortRest", "longRest"],
						transfer: false
					},
					core: {
						statusId: ""
					},
					ActiveAuras: {
						isAura: false,
						aura: "None",
						radius: null,
						alignment: "",
						type: "",
						ignoreSelf: false,
						height: false,
						hidden: false,
						displayTemp: false,
						hostile: false,
						onlyOnce: false
					}
				},
				tint: "",
				selectedKey: "macro.itemMacro"
			}
		],
		flags: {
			betterRolls5e: {
				quickDesc: {
					value: true,
					altValue: true
				},
				quickProperties: {
					value: true,
					altValue: true
				},
				quickOther: {
					value: true,
					altValue: true,
					context: ""
				},
				quickFlavor: {
					value: true,
					altValue: true
				},
				quickDamage: {
					context: {
						0: ""
					},
					value: {
						0: true
					},
					altValue: {
						0: true
					}
				}
			},
			itemacro: {
				macro: {
					_id: null,
					name: rite.riteFullName,
					type: "script",
					author: "eElpc08UH5RIgGDC",
					img,
					scope: "global",
					command: "RiteHandler.handleRite(args);",
					folder: null,
					sort: 0,
					permission: {
						default: 0
					},
					flags: {}
				}
			},
			core: {
				sourceId: "Item.nxMhD9ShWaOBHzIo"
			},
			"midi-qol": {
				effectActivation: false
			},
			midiProperties: {
				nodam: false,
				fulldam: false,
				halfdam: false,
				rollOther: false,
				critOther: false,
				magicdam: false,
				magiceffect: false,
				concentration: false,
				toggleEffect: false
			}
		}
	};
}

async function runMe() {
	for (const type in RITE_TYPES) {
		await Item.create(buildRite(type));
	}
}
runMe();
