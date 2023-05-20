export function registerSettings() {
    game.settings.register("exaltedessence", "sheetStyle", {
        name: "ExEss.SheetStyle",
        hint: "ExEss.SheetStyleDescription",
        scope: "world",
        config: true,
        default: "solar",
        type: String,
        choices: {
            "solar": "ExEss.Solar",
            "lunar": "ExEss.Lunar",
            "db": "ExEss.Dragonblooded",
            "tree": "ExEss.Tree",
            "leaves": "ExEss.Leaves",
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

    game.settings.register("exaltedessence", "systemMigrationVersion", {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: ""
    });
}