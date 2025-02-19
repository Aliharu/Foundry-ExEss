export function registerSettings() {
    game.settings.register("exaltedessence", "sheetStyle", {
        name: "ExEss.SheetStyle",
        hint: "ExEss.SheetStyleDescription",
        scope: "world",
        config: true,
        default: "solar",
        type: String,
        choices: {
            "db": "ExEss.Dragonblooded",
            "exigent": "ExEss.Exigent",
            "janest": "ExEss.Janest",
            "leaves": "ExEss.Leaves",
            "lunar": "ExEss.Lunar",
            "mountain": "ExEss.Mountain",
            "puppeteer": "ExEss.Puppeteer",
            "sidereal": "ExEss.Sidereal",
            "solar": "ExEss.Solar",
            "sovereign": "ExEss.Sovereign",
            "tree": "ExEss.Tree",
        },
        onChange: (choice) => {
            window.location.reload();
        },
    });

    game.settings.register("exaltedessence", "pauseIcon", {
        name: "ExEss.PauseIcon",
        hint: "ExEss.PauseIconDescription",
        scope: "world",
        config: true,
        default: "main",
        type: String,
        choices: {
            "abyssal": "ExEss.Abyssal",
            "alchemical": "ExEss.Alchemical",
            "db": "ExEss.Dragonblooded",
            "exigent": "ExEss.Exigent",
            "getimian": "ExEss.Getimian",
            "infernal": "ExEss.Infernal",
            "liminal": "ExEss.Liminal",
            "lunar": "ExEss.Lunar",
            "main": "ExEss.Main",
            "sidereal": "ExEss.Sidereal",
            "solar": "ExEss.Solar",
            "terrestrial": "ExEss.Terrestrial",
        },
        onChange: (choice) => {
            window.location.reload();
        },
    });

    game.settings.register('exaltedessence', 'calculateOnslaught', {
        name: game.i18n.localize('ExEss.ConcentratedAttacks'),
        hint: game.i18n.localize('ExEss.ShowOnslaughtDescription'),
        default: true,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedessence', 'autoDecisiveDamage', {
        name: game.i18n.localize('ExEss.AutoDecisiveDamage'),
        hint: game.i18n.localize('ExEss.AutoDecisiveDamageDescription'),
        default: true,
        scope: 'world',
        type: Boolean,
        config: true,
    });
    
    game.settings.register('exaltedessence', 'weaponToWithering', {
        name: game.i18n.localize('ExEss.WeaponDamageWithering'),
        hint: game.i18n.localize('ExEss.WeaponDamageWitheringDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedessence', 'nonTargetRollCards', {
        name: game.i18n.localize('ExEss.NonTargetRollCards'),
        hint: game.i18n.localize('ExEss.NonTargetRollCardsDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedessence', 'animaTokenMagic', {
        name: game.i18n.localize('ExEss.AnimaTokenEffects'),
        hint: game.i18n.localize('ExEss.AnimaTokenEffectsDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedessence', 'attackEffects', {
        name: game.i18n.localize('ExEss.AttackEffects'),
        hint: game.i18n.localize('ExEss.AttackEffectsDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register('exaltedessence', 'useActiveEffectsDropdown', {
        name: game.i18n.localize('ExEss.UseActiveEffectsDropdown'),
        hint: game.i18n.localize('ExEss.UseActiveEffectsDropdownDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
    });

    game.settings.register("exaltedessence", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: ""
    });

}