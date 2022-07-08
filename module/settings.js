export function registerSettings() {
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
}