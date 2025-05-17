/**
* Overrides the display of the combat and turn order tab to add activation
* buttons and either move or remove the initiative button
*/
export default class ExaltedCombatTracker extends foundry.applications.sidebar
    .tabs.CombatTracker {

    static DEFAULT_OPTIONS = {
        classes: ['exaltedessence'],
        actions: {
            toggleTurnOver: this.#toggleTurnOver,
            setCharacterTurn: this.#setCharacterTurn,
        },
    };

    static PARTS = {
        header: {
            template: 'systems/exaltedessence/templates/sidebar/combat-tracker/header.html',
        },
        tracker: {
            template: "systems/exaltedessence/templates/sidebar/combat-tracker/tracker.html"
        },
        footer: {
            template: 'systems/exaltedessence/templates/sidebar/combat-tracker/footer.html',
        },
    };

    async _prepareTrackerContext(context, options) {
        await super._prepareTrackerContext(context, options);
        if (context.turns) {
            context.turns = context.turns.map(t => {
                const combatant = (this.viewed.getEmbeddedDocument("Combatant", t.id));
                return {
                    ...t,
                    css: t.css,
                    acted: combatant?.system.acted,
                    initiativeIconColor: combatant?.actor?.system?.details?.initiativeiconcolor || '#F9B516',
                    initiativeIcon: combatant?.actor?.system?.details?.initiativeicon?.toLowerCase() || 'sun',
                };
            });
            context.turns.sort(function (a, b) {
                const ad = (a.acted && !a.active) ? 1 : 0;
                const bd = (b.acted && !b.active) ? 1 : 0;
                return ad - bd;
            });
        }
    }

    static async #toggleTurnOver(event) {
        event.preventDefault();
        event.stopPropagation();
        const id = event.target.closest('[data-combatant-id]')?.dataset.combatantId;
        if (!id)
            return;
        await this.viewed.toggleTurnOver(id);
    }

    static async #setCharacterTurn(event) {
        event.preventDefault();
        event.stopPropagation();
        const id = event.target.closest('[data-combatant-id]')?.dataset.combatantId;

        if (!id)
            return;
        await this.viewed.setCharacterTurn(id);
    }
}