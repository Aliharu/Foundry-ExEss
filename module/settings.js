export function registerSettings() {
    game.settings.registerMenu('exaltedessence', 'rulesConfig', {
        name: "ExEss.RulesConfig",
        label: "ExEss.RulesConfigLabel",
        hint: "ExEss.RulesConfigLabelDesc",
        icon: "fa-solid fa-globe",
        type: RulesConfigurator,
        restricted: true,
    });

    game.settings.register("exaltedessence", "wearingDownFoes", {
        name: game.i18n.localize('ExEss.WearingDownFoes'),
        hint: game.i18n.localize('ExEss.WearingDownFoesDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedessence", "fasterCombat", {
        name: game.i18n.localize('ExEss.FasterCombat'),
        hint: game.i18n.localize('ExEss.FasterCombatDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedessence", "woundBonuses", {
        name: game.i18n.localize('ExEss.WoundBonuses'),
        hint: game.i18n.localize('ExEss.WoundBonusesDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedessence", "powerfulSpells", {
        name: game.i18n.localize('ExEss.PowerfulSpells'),
        hint: game.i18n.localize('ExEss.PowerfulSpellsDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedessence", "fearsomeSize", {
        name: game.i18n.localize('ExEss.FearsomeSize'),
        hint: game.i18n.localize('ExEss.FearsomeSizeDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedessence", "alternateAnima", {
        name: game.i18n.localize('ExEss.AlternateAnima'),
        hint: game.i18n.localize('ExEss.AlternateAnimaDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedessence", "combatReforged", {
        name: game.i18n.localize('ExEss.CombatReforged'),
        hint: game.i18n.localize('ExEss.CombatReforgedDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register("exaltedessence", "narrativePoints", {
        name: game.i18n.localize('ExEss.NarrativePoints'),
        hint: game.i18n.localize('ExEss.NarrativePointsDescription'),
        scope: "world",
        config: false,
        type: Boolean,
        ruleChange: true,
        default: false
    });

    game.settings.register('exaltedessence', 'weaponToWithering', {
        name: game.i18n.localize('ExEss.WeaponDamageWithering'),
        hint: game.i18n.localize('ExEss.WeaponDamageWitheringDescription'),
        default: false,
        scope: 'world',
        type: Boolean,
        config: true,
        ruleChange: true,
    });

    game.settings.register("exaltedessence", "sheetStyle", {
        name: "ExEss.SheetStyle",
        hint: "ExEss.SheetStyleDescription",
        scope: "world",
        config: true,
        default: "tree",
        type: String,
        choices: {
            "db": "ExEss.Dragonblooded",
            "exigent": "ExEss.Exigent",
            "janest": "ExEss.Janest",
            "leaves": "ExEss.Leaves",
            "lunar": "ExEss.Lunar",
            "mountain": "ExEss.Mountain",
            "none": "ExEss.None",
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

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class RulesConfigurator extends HandlebarsApplicationMixin(ApplicationV2) {

    static PARTS = {
        sheet: { template: "systems/exaltedessence/templates/dialogues/rules-config.html" },
        footer: { template: "templates/generic/form-footer.hbs" }
    };

    static DEFAULT_OPTIONS = {
        window: {
            title: "Rules Config",
        },
        tag: "form",
        form: {
            handler: RulesConfigurator.myFormHandler,
            submitOnClose: true,
            submitOnChange: false,
            closeOnSubmit: true
        },
        position: { width: 600 },
        classes: [`standard-form`],
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        context.settings = Array.from(game.settings.settings).filter(s => s[1].ruleChange && !s[1].homebrew).map(i => i[1]);
        // context.homebrewSettings = Array.from(game.settings.settings).filter(s => s[1].ruleChange && s[1].homebrew).map(i => i[1]);

        context.settings.forEach(s => s.inputType = s.type == Boolean ? "checkbox" : "text");
        // context.homebrewSettings.forEach(s => s.inputType = s.type == Boolean ? "checkbox" : "text");

        context.settings.forEach(s => s.value = game.settings.get(s.namespace, s.key));
        // context.homebrewSettings.forEach(s => s.value = game.settings.get(s.namespace, s.key));
        return context;
    }

    static async myFormHandler(event, form, formData) {
        for (const setting in formData.object) {
            game.settings.set("exaltedessence", setting, formData.object[setting]);
        }
    }
}