export function registerSettings() {
    game.settings.register('exaltedessence', 'calculateOnslaught', {
        name: game.i18n.localize('ExEss.ConcentratedAttacks'),
        hint: game.i18n.localize('ExEss.ShowOnslaughtDescription'),
        default: true,
        scope: 'world',
        type: Boolean,
        config: true,
    });
}