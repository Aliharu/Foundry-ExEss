export const EXALTEDESSENCE = {};

//Localization doesn't work here for some reason
// EXALTEDESSENCE.languages = {
//     "lowrealm": "ExEss.LowRealm",
//     "highrealm": "ExEss.HighRealm",
//     "oldrealm": "ExEss.OldRealm",
//     "dragontongue": "ExEss.Dragontongue",
//     "riverspeak": "ExEss.Riverspeak",
//     "skytongue": "ExEss.Skytongue",
//     "flametongue": "ExEss.Flametongue",
//     "foresttongue": "ExEss.Foresttongue",
//     "seatongue": "ExEss.Seatongue",
//     "guildcant": "ExEss.GuildCant",
//     "localtongue": "ExEss.LocalTongue",
// };

EXALTEDESSENCE.activeEffectChanges = {
    '': 'ExEss.None',
    'system.attributes.force.value': 'ExEss.Force',
    'system.attributes.finesse.value': 'ExEss.Finesse',
    'system.attributes.fortitude.value': 'ExEss.Fortitude',
    'system.abilities.athletics.value': 'ExEss.Athletics',
    'system.abilities.awareness.value': 'ExEss.Awareness',
    'system.abilities.close.value': 'ExEss.CloseCombat',
    'system.abilities.craft.value': 'ExEss.Craft',
    'system.abilities.embassy.value': 'ExEss.Embassy',
    'system.abilities.integrity.value': 'ExEss.Integrity',
    'system.abilities.navigate.value': 'ExEss.Navigate',
    'system.abilities.performance.value': 'ExEss.Performance',
    'system.abilities.physique.value': 'ExEss.Physique',
    'system.abilities.presence.value': 'ExEss.Presence',
    'system.abilities.ranged.value': 'ExEss.RangedCombat',
    'system.abilities.sagacity.value': 'ExEss.Sagacity',
    'system.abilities.stealth.value': 'ExEss.Stealth',
    'system.abilities.war.value': 'ExEss.War',
    'system.pools.primary.value': 'ExEss.PrimaryPool',
    'system.pools.secondary.value': 'ExEss.SecondaryPool',
    'system.pools.tertiary.value': 'ExEss.TertiaryPool',
    'system.evasion.value': 'ExEss.Evasion',
    'system.parry.value': 'ExEss.Parry',
    'system.defense.value': 'ExEss.DefenseNPC',
    'system.soak.value': 'ExEss.Soak',
    'system.hardness.value': 'ExEss.Hardness',
    'system.resolve.value': 'ExEss.Resolve',
    'system.health.levels.zero.value': 'ExEss.PenaltyZeroHealth',
    'system.health.levels.one.value': 'ExEss.PenaltyOneHealth',
    'system.health.levels.two.value': 'ExEss.PenaltyTwoHealth',
}

EXALTEDESSENCE.languages = {
    "lowrealm": "Low Realm",
    "highrealm": "High Realm",
    "oldrealm": "Old Realm",
    "dragontongue": "Dragontongue",
    "riverspeak": "Riverspeak",
    "skytongue": "Skytongue",
    "flametongue": "Flametongue",
    "foresttongue": "Foresttongue",
    "seatongue": "Seatongue",
    "guildcant": "Guild Cant",
    "localtongue": "Local Tongue",
};

EXALTEDESSENCE.weapontags = {
    "aggravated": "Aggravated",
    "artifact": "Artifact",
    "balanced": "Balanced",
    "chopping": "Chopping",
    "concealable": "Concealable",
    "defensive": "Defensive",
    "disarming": "Disarming",
    "flame": "Flame",
    "flexible": "Flexible",
    "improvised": "Improvised",
    "magicdamage": "Magic Damage",
    "melee": "Melee",
    "mounted": "Mounted",
    "natural": "Natural",
    "worn": "Worn",
    "offhand": "Off-Hand",
    "onehanded": "One-Handed",
    "paired": "Paired",
    "piercing": "Piercing",
    "pulling": "Pulling",
    "powerful": "Powerful",
    "ranged": "Ranged",
    "reaching": "Reaching",
    "returning": "Returning",
    "shield": "Shield",
    "smashing": "Smashing",
    "thrown": "Thrown",
    "twohanded": "Two-Handed",
};

EXALTEDESSENCE.armortags = {
    "artifact": "Artifact",
    "buoyant": "Buoyant",
    "concealable": "Concealable",
    "silent": "Silent",
    "towering": "Towering",
};

EXALTEDESSENCE.statusEffects = [
    {
        img: 'systems/exaltedessence/assets/icons/drop-weapon.svg',
        id: 'disarmed',
        label: 'ExEss.Disarmed',
        name: 'disarmed'
    },
    {
        img: 'systems/exaltedessence/assets/icons/fishing-net.svg',
        id: 'ensnared',
        label: 'ExEss.Ensnared',
        name: 'ensnared'
    },
    {
        img: 'icons/svg/falling.svg',
        id: 'prone',
        label: 'ExEss.Prone',
        name: 'prone'
    },
    {
        img: 'icons/svg/ruins.svg',
        id: 'lightcover',
        label: 'ExEss.LightCover',
        name: 'lightcover'
    },
    {
        img: 'icons/svg/castle.svg',
        id: 'heavycover',
        label: 'ExEss.HeavyCover',
        name: 'heavycover'
    },
    {
        img: 'icons/svg/daze.svg',
        id: 'surprised',
        label: 'ExEss.Surprised',
        name: 'surprised'
    },
    {
        img: 'systems/exaltedessence/assets/icons/hooded-figure.svg',
        id: 'concealment',
        label: 'ExEss.Concealment',
        name: 'concealment'
    },
    {
        img: 'icons/svg/blood.svg',
        id: 'bleeding',
        label: 'EFFECT.StatusBleeding',
        name: 'bleeding'
    },
    {
        img: 'icons/svg/poison.svg',
        id: 'poisoned',
        label: 'EFFECT.StatusPoison',
        name: 'poisoned'
    },
    {
        img: 'icons/svg/fire.svg',
        id: 'burning',
        label: 'EFFECT.StatusBurning',
        name: 'burning'
    },
    {
        img: 'icons/svg/invisible.svg',
        id: 'dematerialized',
        label: 'ExEss.Dematerialized',
        name: 'dematerialized'
    },
    {
        img: 'systems/exaltedessence/assets/icons/screaming.svg',
        id: 'routing',
        label: 'ExEss.Routing',
    },
    {
        img: 'icons/svg/skull.svg',
        id: 'incapacitated',
        label: 'ExEss.Incapacitated',
    },
]

EXALTEDESSENCE.rollTypeTargetLabels = {
    readIntentions: "ExEss.ReadIntentions",
    social: "ExEss.Social",
    command: "ExEss.Command",
    withering: "ExEss.Withering",
    decisive: "ExEss.Decisive",
    gambit: "ExEss.Gambit",
    buildPower: "ExEss.BuildPower",
    focusWill: 'ExEss.FocusWill',
    joinBattle: 'ExEss.JoinBattle',
    'athletics': 'ExEss.Athletics',
    'awareness': 'ExEss.Awareness',
    'close': 'ExEss.CloseCombat',
    'craft': 'ExEss.Craft',
    'embassy': 'ExEss.Embassy',
    'integrity': 'ExEss.Integrity',
    'performance': 'ExEss.Performance',
    'navigate': 'ExEss.Navigate',
    'physique': 'ExEss.Physique',
    'presence': 'ExEss.Presence',
    'ranged': 'ExEss.RangedCombat',
    'sagacity': 'ExEss.Sagacity',
    'stealth': 'ExEss.Stealth',
    'war': 'ExEss.War',
}

EXALTEDESSENCE.rollTypeTargetImages = {
    social: "systems/exaltedessence/assets/icons/heartburn.svg",
    withering: "systems/exaltedessence/assets/icons/sword-clash.svg",
    decisive: "systems/exaltedessence/assets/icons/bloody-sword.svg",
    gambit: "systems/exaltedessence/assets/icons/punch-blast.svg",
    focusWill: 'systems/exaltedessence/assets/icons/magic-swirl.svg',
    buildPower: 'systems/exaltedessence/assets/icons/power-lightning.svg',
    joinBattle: 'icons/svg/combat.svg',
    //Abilities
    'athletics': 'systems/exaltedessence/assets/icons/sprint.svg',
    'awareness': 'systems/exaltedessence/assets/icons/semi-closed-eye.svg',
    'close': 'icons/svg/sword.svg',
    'craft': 'systems/exaltedessence/assets/icons/anvil-impact.svg',
    'embassy': 'systems/exaltedessence/assets/icons/heartburn.svg',
    'integrity': 'systems/exaltedessence/assets/icons/meditation.svg',
    'performance': 'systems/exaltedessence/assets/icons/musical-notes.svg',
    'navigate': 'systems/exaltedessence/assets/icons/mountain-road.svg',
    'physique': 'systems/exaltedessence/assets/icons/biceps.svg',
    'presence': 'systems/exaltedessence/assets/icons/deadly-strike.svg',
    'ranged': 'systems/exaltedessence/assets/icons/striking-arrows.svg',
    'sagacity': "systems/exaltedessence/assets/icons/spell-book.svg",
    'stealth': 'systems/exaltedessence/assets/icons/hidden.svg',
    'war': "systems/exaltedessence/assets/icons/rally-the-troops.svg",
}

EXALTEDESSENCE.targetableRollTypes = [
    'readIntentions',
    'social',
    'command',
    'accuracy',
    'damage',
    'withering',
    'gambit',
    'withering-split',
    'decisive-split',
    'gambit-split',
]

EXALTEDESSENCE.meritDiceBonuses = {
    "": 0,
    "primary": 4,
    "secondary": 3,
    "tertiary": 2,
};

EXALTEDESSENCE.selects = {
    attributes: {
        force: "ExEss.Force",
        finesse: "ExEss.Finesse",
        fortitude: "ExEss.Fortitude",
    },
    abilities: {
        athletics: "ExEss.Athletics",
        awareness: "ExEss.Awareness",
        close: "ExEss.CloseCombat",
        craft: "ExEss.Craft",
        embassy: "ExEss.Embassy",
        integrity: "ExEss.Integrity",
        navigate: "ExEss.Navigate",
        performance: "ExEss.Performance",
        physique: "ExEss.Physique",
        presence: "ExEss.Presence",
        ranged: "ExEss.RangedCombat",
        sagacity: "ExEss.Sagacity",
        stealth: "ExEss.Stealth",
        war: "ExEss.War",
        martial: "ExEss.MartialArts",
    },
    pools: {
        primary: "ExEss.Primary",
        secondary: "ExEss.Secondary",
        tertiary: "ExEss.Tertiary",
    },
    meritRatings: {
        primary: "ExEss.Primary",
        secondary: "ExEss.Secondary",
        tertiary: "ExEss.Tertiary",
    },
    buildPowerTypes: {
        self: "ExEss.Self",
        target: "ExEss.Target",
    },
    intimacyLevels: {
        "0": "ExEss.None",
        "2": "ExEss.Minor",
        "3": "ExEss.Major",
    },
    gambits: {
        disarm: "ExEss.Disarm",
        distract: "ExEss.Distract",
        ensnare: "ExEss.Ensnare",
        knockback: "ExEss.Knockback",
        knockdown: "ExEss.Knockdown",
        pilfer: "ExEss.Pilfer",
        pull: "ExEss.Pull",
        reveal_weakness: "ExEss.RevealWeakness",
        unhorse: "ExEss.Unhorse",
        none: "ExEss.None",
    },
    exaltTypes: {
        abyssal: "ExEss.Abyssal",
        alchemical: "ExEss.Alchemical",
        dragonblooded: "ExEss.Dragonblooded",
        dragonking: "ExEss.DragonKing",
        dreamsouled: "ExEss.DreamSouled",
        exigent: "ExEss.Exigent",
        getimian: "ExEss.Getimian",
        godblooded: "ExEss.GodBlooded",
        hearteater: "ExEss.Hearteater",
        infernal: "ExEss.Infernal",
        liminal: "ExEss.Liminal",
        lunar: "ExEss.Lunar",
        sidereal: "ExEss.Sidereal",
        solar: "ExEss.Solar",
        umbral: "ExEss.Umbral",
        other: "ExEss.Other"
    },
    elements: {
        none: 'ExEss.None',
        air: 'ExEss.Air',
        earth: 'ExEss.Earth',
        fire: 'ExEss.Fire',
        water: 'ExEss.Water',
        wood: 'ExEss.Wood',
    },
    natures: {
        blood: 'ExEss.Blood',
        breath: 'ExEss.Breath',
        flesh: 'ExEss.Flesh',
        marrow: 'ExEss.Marrow',
        soil: 'ExEss.Soil',
    },
    creatureTypes: {
        animal: 'ExEss.Animal',
        behemoth: 'ExEss.Behemoth',
        construct: 'ExEss.Construct',
        demon: 'ExEss.Demon',
        elemental: 'ExEss.Elemental',
        exalt: 'ExEss.Exalt',
        fae: 'ExEss.Fae',
        god: 'ExEss.God',
        magiccreature: 'ExEss.MagicCreature',
        mortal: 'ExEss.Mortal',
        undead: 'ExEss.Undead',
        wyldmonster: 'ExEss.WyldMonster',
        other: 'ExEss.Other',
    },
    demons: {
        first: 'ExEss.FirstCircle',
        second: 'ExEss.SecondCircle',
        third: 'ExEss.ThirdCircle',
        other: 'ExEss.Other',
    },
    wyldCreatures: {
        creature: 'ExEss.Creature',
        raksha: 'ExEss.Raksha',
        other: 'ExEss.Other',
    },
    weaponTypes: {
        'melee': "ExEss.Melee",
        'ranged': "ExEss.Ranged",
        'thrown': "ExEss.Thrown",
    },
    attackEffectPresets: {
        'arrow': "ExEss.Arrow",
        'bite': "ExEss.Bite",
        'brawl': "ExEss.Brawl",
        'claws': "ExEss.Claws",
        'fireball': "ExEss.Fireball",
        'firebreath': "ExEss.Firebreath",
        'flamepiece': "ExEss.Flamepiece",
        'glaive': "ExEss.Glaive",
        'goremaul': "ExEss.Goremaul",
        'greatsaxe': "ExEss.Greataxe",
        'greatsword': "ExEss.Greatsword",
        'handaxe': "ExEss.Handaxe",
        'lightning': "ExEss.Lightning",
        'quarterstaff': "ExEss.Quarterstaff",
        'rapier': "ExEss.Rapier",
        'scimitar': "ExEss.Scimitar",
        'shortsword': "ExEss.Shortsword",
        'spear': "ExEss.Spear",
        'throwdagger': "ExEss.ThrownDagger",
        'none': "ExEss.None",
    },
    itemWeights: {
        'light': "ExEss.Light",
        'medium': "ExEss.Medium",
        'heavy': "ExEss.Heavy",
    },
    artifactTypes: {
        mundane: "ExEss.Mundane",
        artifact: "ExEss.Artifact",
    },
    sorceryCircles: {
        first: "ExEss.FirstCircle",
        second: "ExEss.SecondCircle",
        third: "ExEss.ThirdCircle",
    },
    spellTypes: {
        universal: "ExEss.Universal",
        necromancy: "ExEss.Necromancy",
        sorcery: "ExEss.Sorcery",
    },
    intimacyStrengths: {
        minor: "ExEss.Minor",
        major: "ExEss.Major",
    },
    intimacyTypes: {
        tie: "ExEss.Tie",
        principle: "ExEss.Principle",
    },
    abilityRequirementLevels: {
        "0": "0",
        "1": "1",
        "2": "2",
        "3": "3",
        "4": "4",
        "5": "5",
    },
    autoAddToRollOptions: {
        '': "ExEss.None",
        'action': "ExEss.CharacterRolls",
        // 'opposedRolls': "ExEss.OpposedRolls",
        'sameAbility': "ExEss.SameAbilityAttribute",
        'attacks': "ExEss.Attacks",
        'social': "ExEss.Social",
        'buildPower': "ExEss.BuildPower",
        'focusWill': "ExEss.FocusWill",
    },
    exaltCharmTypes: {
        abyssal: "ExEss.Abyssal",
        alchemical: "ExEss.Alchemical",
        architect: "ExEss.Architect",
        dragonblooded: "ExEss.Dragonblooded",
        dragonking: "ExEss.DragonKing",
        dreamsouled: "ExEss.DreamSouled",
        evocation: "ExEss.Evocation",
        exigent: "ExEss.Exigent",
        getimian: "ExEss.Getimian",
        hearteater: "ExEss.Hearteater",
        infernal: "ExEss.Infernal",
        janest: "ExEss.Janest",
        liminal: "ExEss.Liminal",
        lunar: "ExEss.Lunar",
        martialarts: "ExEss.MartialArts",
        sidereal: "ExEss.Sidereal",
        solar: "ExEss.Solar",
        sovereign: "ExEss.Sovereign",
        umbral: "ExEss.Umbral",
        other: "ExEss.Other"
    },
    charmAbilities: {
        force: "ExEss.Force",
        finesse: "ExEss.Finesse",
        fortitude: "ExEss.Fortitude",
        athletics: "ExEss.Athletics",
        awareness: "ExEss.Awareness",
        close: "ExEss.CloseCombat",
        craft: "ExEss.Craft",
        embassy: "ExEss.Embassy",
        integrity: "ExEss.Integrity",
        navigate: "ExEss.Navigate",
        performance: "ExEss.Performance",
        physique: "ExEss.Physique",
        presence: "ExEss.Presence",
        ranged: "ExEss.RangedCombat",
        sagacity: "ExEss.Sagacity",
        stealth: "ExEss.Stealth",
        war: "ExEss.War",
        martial: "ExEss.MartialArts",
        evocation: "ExEss.Evocation",
        other: "ExEss.Other",
    },
    damageTypes: {
        'lethal': "ExEss.Lethal",
        'aggravated': "ExEss.Aggravated",
    },
}