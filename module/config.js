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

EXALTEDESSENCE.weightTypes = {
    light: "ExEss.Light",
    medium: "ExEss.Medium",
    heavy: "ExEss.Heavy",
    other: "ExEss.Other",
};

EXALTEDESSENCE.triggerBonusTypes = {
    none: {
        label: "ExEss.None",
        bonuses: {
            "": "ExEss.None",
        }
    },
    diceRoll: {
        label: "ExEss.DiceRoll",
        bonuses: {
            diceModifier: "ExEss.DiceModifier",
            successModifier: "ExEss.SuccessModifier",
            doubleSuccess: "ExEss.DoubleSuccess",
            decreaseTargetNumber: "ExEss.DecreaseTargetNumber",
            rerollNumber: "ExEss.RerollNumberDice",
            diceToSuccesses: "ExEss.DicetoSuccesses",
            rollTwice: "ExEss.RollTwiceKeepHighest",
            rerollFailed: "ExEss.RerollFailed",
        },
    },
    damage: {
        label: "ExEss.AttackDamage",
        bonuses: {
            damageDice: "ExEss.DamageDiceModifier",
            damageSuccessModifier: "ExEss.DamageSuccessModifier",
            'decreaseTargetNumber-damage': "ExEss.DamageDecreaseTargetNumber",
            ignoreSoak: "ExEss.IgnoreSoak",
            overwhelming: "ExEss.Overwhelming",
            setDamageType: "ExEss.SetDamageType",
            'doubleExtraSuccess-damage': "ExEss.DoubleExtraSuccess",
        }
    },
    spend: {
        label: "ExEss.Spend",
        bonuses: {
            'motes-spend': "ExEss.SpendMotes",
            'anima-spend': "ExEss.SpendAnima",
            'power-spend': "ExEss.SpendPower",
            'stunt-spend': "ExEss.SpendStunt",
            'health-spend': "ExEss.SpendHealth",
        }
    },
    restore: {
        label: "ExEss.Gain",
        bonuses: {
            'motes-gain': "ExEss.GainMotes",
            'health-gain': "ExEss.GainHealth",
            'anima-gain': "ExEss.GainAnima",
            'power-gain': "ExEss.GainPower",
        }
    },
    defense: {
        label: "ExEss.Defense",
        bonuses: {
            defense: "ExEss.Defense",
            soak: "ExEss.Soak",
            hardness: "ExEss.Hardness/Poise",
            resolve: "ExEss.Resolve",
        }
    },
    other: {
        label: "ExEss.Other",
        bonuses: {
            activateAura: "ExEss.ActivateAura",
            displayMessage: "ExEss.DisplayMessage",
            addSpecialAttack: "ExEss.AddSpecialAttack"
        }
    },
}

EXALTEDESSENCE.triggerRequirementTypes = {
    none: {
        label: "ExEss.None",
        requirements: {
            "": "ExEss.None"
        }
    },
    roll: {
        label: "ExEss.Roll",
        requirements: {
            rollType: "ExEss.RollType",
            gambitType: "ExEss.GambitType",
            hasSpecialAttack: "ExEss.HasSpecialAttack",
            attribute: "ExEss.Attribute",
            ability: "ExEss.Ability",
        },
    },
    character: {
        label: "ExEss.Character",
        requirements: {
            formula: "ExEss.Formula",
            hasAura: 'ExEss.HasAura',
            hasNature: 'ExEss.HasNature',
            isExalt: "ExEss.IsExalt",
            hasStatus: "ExEss.HasStatus",
            materialResonance: "ExEss.MaterialResonance",
        },
    },
    item: {
        label: "ExEss.Item",
        requirements: {
            isControlSpell: "ExEss.IsControlSpell",
            modeActive: "ExEss.ModeActive",
        }
    },
    other: {
        label: "ExEss.Other",
        requirements: {
            booleanPrompt: "ExEss.YesOrNoPrompt",
            noTriggersActivated: "ExEss.NoTriggersActivated",
        },
    }
}

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
    'system.poise.value': 'ExEss.Poise',
    'system.resolve.value': 'ExEss.Resolve',
    'system.health.levels.zero.value': 'ExEss.PenaltyZeroHealth',
    'system.health.levels.one.value': 'ExEss.PenaltyOneHealth',
    'system.health.levels.two.value': 'ExEss.PenaltyTwoHealth',
    'system.penaltymodifier.value': 'ExEss.DicePenalty',
    'system.dicemodifier.value': 'ExEss.DiceModifier',
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
    'autocthonic': "Autocthonic"
};

EXALTEDESSENCE.resonance = {
    "adamant": "Adamant",
    "orichalcum": "Orichalcum",
    "moonsilver": "Moonsilver",
    "starmetal": "Starmetal",
    "soulsteel": "Soulsteel",
    "blackjade": "Black Jade",
    "bluejade": "Blue Jade",
    "greenjade": "Green Jade",
    "redjade": "Red Jade",
    "whitejade": "White Jade",
}

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

EXALTEDESSENCE.itemIcons = {
    intimacy: "systems/exaltedessence/assets/icons/hearts.svg",
    spell: "systems/exaltedessence/assets/icons/magic-swirl.svg",
    ritual: "icons/svg/book.svg",
    merit: "icons/svg/coins.svg",
    quality: "icons/svg/aura.svg",
    weapon: "icons/svg/sword.svg",
    armor: "systems/exaltedessence/assets/icons/breastplate.svg",
    charm: "icons/svg/explosion.svg",
};

EXALTEDESSENCE.armortags = {
    "artifact": "Artifact",
    "buoyant": "Buoyant",
    "concealable": "Concealable",
    "silent": "Silent",
    "towering": "Towering",
};

EXALTEDESSENCE.gambits = {
    disarm: "ExEss.Disarm",
    distract: "ExEss.Distract",
    ensnare: "ExEss.Ensnare",
    knockback: "ExEss.Knockback",
    knockdown: "ExEss.Knockdown",
    pilfer: "ExEss.Pilfer",
    pull: "ExEss.Pull",
    reveal_weakness: "ExEss.RevealWeakness",
    unhorse: "ExEss.Unhorse",
};

EXALTEDESSENCE.statusEffects = [
    {
        img: 'systems/exaltedessence/assets/icons/drop-weapon.svg',
        id: 'disarmed',
        name: 'ExEss.Disarmed',
    },
    {
        img: 'systems/exaltedessence/assets/icons/fishing-net.svg',
        id: 'ensnared',
        name: 'ExEss.Ensnared',
    },
    {
        img: 'icons/svg/falling.svg',
        id: 'prone',
        name: 'ExEss.Prone',
    },
    {
        img: 'icons/svg/ruins.svg',
        id: 'lightcover',
        name: 'ExEss.LightCover',
    },
    {
        img: 'icons/svg/castle.svg',
        id: 'heavycover',
        name: 'ExEss.HeavyCover',
    },
    {
        img: 'icons/svg/daze.svg',
        id: 'surprised',
        name: 'ExEss.Surprised',
    },
    {
        img: 'systems/exaltedessence/assets/icons/hooded-figure.svg',
        id: 'concealment',
        name: 'ExEss.Concealment',
    },
    {
        img: 'icons/svg/blood.svg',
        id: 'bleeding',
        name: 'EFFECT.StatusBleeding',
    },
    {
        img: 'icons/svg/poison.svg',
        id: 'poisoned',
        name: 'EFFECT.StatusPoison',
    },
    {
        img: 'icons/svg/fire.svg',
        id: 'burning',
        name: 'EFFECT.StatusBurning',
    },
    {
        img: 'icons/svg/invisible.svg',
        id: 'dematerialized',
        name: 'ExEss.Dematerialized',
    },
    {
        img: 'systems/exaltedessence/assets/icons/despair.svg',
        id: 'hindered',
        name: 'ExEss.Hindered',
    },
    {
        img: 'systems/exaltedessence/assets/icons/screaming.svg',
        id: 'routing',
        name: 'ExEss.Routing',
    },
    {
        img: 'systems/exaltedessence/assets/icons/back-pain.svg',
        id: 'break',
        name: 'ExEss.Break',
    },
    {
        img: 'icons/svg/skull.svg',
        id: 'incapacitated',
        name: 'ExEss.Incapacitated',
    },
    {
        img: 'systems/exaltedessence/assets/icons/shaking-hands.svg',
        id: 'grappling',
        name: 'ExEss.Grappling',
        description: "<p>Character is in a grapple</p>",
        tooltip: "<p>Character is in a grapple</p>",
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
    virtueLevels: {
        "0": "ExEss.None",
        "2": "ExEss.Minor",
        "3": "ExEss.Major",
    },
    intimacyLevels: {
        "0": "ExEss.None",
        "2": "ExEss.Minor",
        "3": "ExEss.Major",
        "4": "ExEss.Defining",
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
        melee: "ExEss.Melee",
        ranged: "ExEss.Ranged",
        thrown: "ExEss.Thrown",
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
        light: "ExEss.Light",
        medium: "ExEss.Medium",
        heavy: "ExEss.Heavy",
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
        defining: "ExEss.Defining"
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
        action: "ExEss.CharacterRolls",
        opposedRolls: "ExEss.OpposedRolls",
        sameAbility: "ExEss.SameAbilityAttribute",
        attacks: "ExEss.Attacks",
        social: "ExEss.Social",
        buildPower: "ExEss.BuildPower",
        focusWill: "ExEss.FocusWill",
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
        lethal: "ExEss.Lethal",
        aggravated: "ExEss.Aggravated",
    },
    ranges: {
        close: "ExEss.CloseRange",
        short: "ExEss.ShortRange",
        medium: "ExEss.MediumRange",
        long: "ExEss.LongRange",
        extreme: "ExEss.ExtremeRange",
    },
    triggerTimes: {
        beforeRoll: "ExEss.BeforeRoll",
        afterRoll: "ExEss.AfterRoll",
        beforeDamageRoll: "ExEss.BeforeDamageRoll",
        itemAdded: "ExEss.WhenItemAdded"
    },
    triggerRequirementModes: {
        and: "ExEss.RequirementAND",
        or: "ExEss.RequirementOR",
    },
    booleanTriggerSelects: {
        true: "ExEss.True",
        false: "ExEss.False",
    },
    specialAttacks: {
        aim: "ExEss.Aim",
        chopping: "ExEss.ChoppingPowerful",
        piercing: "ExEss.Piercing",
        rush: "ExEss.Rush",
    },
    statuses: {
        disarmed: "ExEss.Disarmed",
        ensnared: "ExEss.Ensnared",
        prone: "ExEss.Prone",
        lightcover: "ExEss.LightCover",
        heavycover: "ExEss.HeavyCover",
        surprised: "ExEss.Surprised",
        concealment: "ExEss.Concealment",
        bleeding: "EFFECT.StatusBleeding",
        poisoned: "EFFECT.StatusPoison",
        burning: "EFFECT.StatusBurning",
        dematerialized: "ExEss.Dematerialized",
        hindered: "ExEss.Hindered",
        routing: "ExEss.Routing",
        break: "ExEss.Break",
        incapacitated: "ExEss.Incapacitated",
        grappling: "ExEss.Grappling"
    },
    rollTypes: {
        attack: "ExEss.Attack",
        ability: "ExEss.Ability",
        readIntentions: "ExEss.ReadIntentions",
        social: "ExEss.Social",
        command: "ExEss.Command",
        withering: "ExEss.Withering",
        decisive: "ExEss.Decisive",
        gambit: "ExEss.Gambit",
        buildPower: "ExEss.BuildPower",
        focusWill: 'ExEss.FocusWill',
        joinBattle: 'ExEss.JoinBattle',
    }
}

EXALTEDESSENCE.numberBonusTypeLabels = {
    diceModifier: "ExEss.DiceModifier",
}

EXALTEDESSENCE.booleanTriggers = [
    'rollTwice',
    'rerollFailed',
    'ignoreLegendarySize',
    'targetIsCrashed',
    'targetTakenTurn',
    'rollSucceeded',
    'gambitSucceeded',
    'incapacitatedTarget',
    'noTriggersActivated',
    'attackClash',
    'targetIsBattlegroup',
    'isControlSpell',
    'doubleExtraSuccess-damage',
];