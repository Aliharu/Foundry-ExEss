import { EXALTEDESSENCE } from "./config.js";

export default class ExaltedActiveEffectConfig extends ActiveEffectConfig {
    get template() {
        return 'systems/exaltedessence/templates/active-effect-config.html';
    }

    async getData() {
        let context = await super.getData();

        context.useDropdown = game.settings.get("exaltedessence", "useActiveEffectsDropdown");

        context.activeEffectChanges = EXALTEDESSENCE.activeEffectChanges;

        return context;
    }
}