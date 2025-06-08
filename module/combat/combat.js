import RollForm from "../apps/dice-roller.js";

export class ExaltedCombat extends Combat {
    async resetTurnsTaken() {
        const updates = this.combatants.map(c => {
            return {
                _id: c.id,
                [`system.acted`]: c.isDefeated
                    ? true
                    : false,
            };
        });
        return this.updateEmbeddedDocuments("Combatant", updates);
    }

    async _preCreate(...[data, options, user]) {
        this.turn = null;
        return super._preCreate(data, options, user);
    }

    async startCombat() {
        await this.resetTurnsTaken();
        return this.update({ round: 1, turn: null });
    }


    async nextRound() {
        await this.resetTurnsTaken();
        let advanceTime = Math.max(this.turns.length - (this.turn || 0), 0) * CONFIG.time.turnTime;
        advanceTime += CONFIG.time.roundTime;
        return this.update({ round: this.round + 1, turn: null }, { advanceTime });
    }

    async previousRound() {
        await this.resetTurnsTaken();
        const round = Math.max(this.round - 1, 0);
        let advanceTime = 0;
        if (round > 0)
            advanceTime -= CONFIG.time.roundTime;
        return this.update({ round, turn: null }, { advanceTime });
    }

    async resetAll() {
        await this.resetTurnsTaken();
        this.combatants.forEach(c => c.updateSource({ initiative: null }));
        return this.update({ turn: null, combatants: this.combatants.toObject() }, { diff: false });
    }

    async toggleTurnOver(id) {
        const combatant = this.getEmbeddedDocument("Combatant", id);
        await combatant?.toggleCombatantTurnOver();
        const turn = this.turns.findIndex(t => t.id === id);
        return this.update({ turn });
    }


    async rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt) {
        const combatant = this.combatants.get(ids[0]);
        if (combatant.token.actor) {
            if (combatant.token.actor.type === "npc") {
                game.rollForm = await new RollForm(combatant.token.actor, { classes: [" exaltedessence exaltedessence-dialog dice-roller"] }, {}, { rollType: 'joinBattle', pool: 'primary' }).render(true);
            }
            else {
                game.rollForm = await new RollForm(combatant.token.actor, { classes: [" exaltedessence exaltedessence-dialog dice-roller"] }, {}, { rollType: 'joinBattle', ability: 'close' }).render(true);
            }
        }
        else {
            super.rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt);
        }
    }

    async rollAll(options) {
        const ids = this.combatants.reduce((ids, c) => {
            if (c.isOwner && (c.initiative === null)) ids.push(c.id);
            return ids;
        }, []);
        await super.rollInitiative(ids, options);
        return this.update({ turn: null });
    }

    async rollNPC(options = {}) {
        const ids = this.combatants.reduce((ids, c) => {
            if (c.isOwner && c.isNPC && (c.initiative === null)) ids.push(c.id);
            return ids;
        }, []);
        await super.rollInitiative(ids, options);
        return this.update({ turn: null });
    }
}