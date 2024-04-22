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
    "shield": "Shield",
    "smashing": "Smashing",
    "thrown": "Thrown",
    "twohanded": "Two-Handed",
};

EXALTEDESSENCE.armortags = {
    "artifact": "Artifact",
    "buoyant": "Buoyant",
    "silent": "Silent",
};

EXALTEDESSENCE.statusEffects = [
    {
        icon: 'systems/exaltedessence/assets/icons/drop-weapon.svg',
        id: 'disarmed',
        label: 'ExEss.Disarmed',
        name: 'disarmed'
    },
    {
        icon: 'systems/exaltedessence/assets/icons/fishing-net.svg',
        id: 'ensnared',
        label: 'ExEss.Ensnared',
        name: 'ensnared'
    },
    {
        icon: 'icons/svg/falling.svg',
        id: 'prone',
        label: 'ExEss.Prone',
        name: 'prone'
    },
    {
        icon: 'icons/svg/ruins.svg',
        id: 'lightcover',
        label: 'ExEss.LightCover',
        name: 'lightcover'
    },
    {
        icon: 'icons/svg/castle.svg',
        id: 'heavycover',
        label: 'ExEss.HeavyCover',
        name: 'heavycover'
    },
    {
        icon: 'icons/svg/daze.svg',
        id: 'surprised',
        label: 'ExEss.Surprised',
        name: 'surprised'
    },
    {
        icon: 'systems/exaltedessence/assets/icons/hooded-figure.svg', 
        id: 'concealment',
        label: 'ExEss.Concealment',
        name: 'concealment'
    },
    {
        icon: 'icons/svg/blood.svg',
        id: 'bleeding',
        label: 'EFFECT.StatusBleeding',
        name: 'bleeding'
    },
    {
        icon: 'icons/svg/poison.svg',
        id: 'poisoned',
        label: 'EFFECT.StatusPoison',
        name: 'poisoned'
    },
    {
        icon: 'icons/svg/fire.svg',
        id: 'burning',
        label: 'EFFECT.StatusBurning',
        name: 'burning'
    },
    {
        icon: 'icons/svg/invisible.svg',
        id: 'dematerialized',
        label: 'ExEss.Dematerialized',
        name: 'dematerialized'
    },
    {
        icon: 'icons/svg/skull.svg',
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