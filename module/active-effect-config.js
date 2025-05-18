import { EXALTEDESSENCE } from "./config.js";

export default class ExaltedActiveEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {

    /** @override */
    /** @override */
    static PARTS = {
        header: { template: "systems/exaltedessence/templates/active-effect/active-effects-header.html" },
        tabs: { template: "systems/exaltedessence/templates/dialogues/tabs.html" },
        details: { template: "templates/sheets/active-effect/details.hbs", scrollable: [""] },
        duration: { template: "templates/sheets/active-effect/duration.hbs" },
        changes: { template: "systems/exaltedessence/templates/active-effect/changes.html", scrollable: ["ol[data-changes]"] },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    _initializeApplicationOptions(options) {
        options.classes = [options.document?.parent?.getSheetBackground() ?? 'tree-background', "exaltedessence"];
        return super._initializeApplicationOptions(options);
    }

    /** @inheritDoc */
    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.useDropdown = game.settings.get("exaltedessence", "useActiveEffectsDropdown");

        context.selects = EXALTEDESSENCE.selects;

        context.activeEffectChanges = EXALTEDESSENCE.activeEffectChanges;

        return context;
    }
}