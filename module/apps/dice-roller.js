export class RollForm extends FormApplication {
    constructor(actor, options, object, data) {
        super(object, options);
        this.actor = actor;

        if (data.rollId) {
            this.object = this.actor.system.savedRolls[data.rollId];
        }
        else {
            this.object.rollType = data.rollType;
            this.object.resolve = 0;
            if (data.rollType !== 'base') {
                if (this.actor.type === 'npc') {
                    this.object.pool = data.pool || "primary";
                }
                else {
                    if (data.attribute) {
                        this.object.attribute = data.attribute;
                    }
                    else {
                        this.object.attribute = this._getHighestAttribute();
                    }
                    this._checkAttributeBonuses();
                    this.object.ability = data.ability || "athletics";
                }
                this.object.characterType = this.actor.type;
                this.object.buildPowerTarget = 'self';


                this.object.defense = 0;
                this.object.soak = 0;
                this.object.doubleExtraSuccess = false;
                this.object.resolve = 0;
                this.object.accuracySuccesses = data.accuracy || 0;
                this.object.power = this.actor.system.power.value || 0;
                this.object.damageSuccesses = data.damage || 0;
                this.object.overwhelming = data.overwhelming || 0;
                this.object.conditions = (this.actor.token && this.actor.token.actorData.effects) ? this.actor.token.actorData.effects : [];
                this.object.weaponType = data.weaponType || 'melee';
                this.object.diceModifier = 0;

                if (data.rollType === 'withering' || data.rollType === 'gambit' || data.rollType === 'decisive') {
                    if (this.object.conditions.some(e => e.name === 'prone')) {
                        this.object.diceModifier -= 3;
                    }
                }
                this.object.title = "Decisive Attack";
                if (data.rollType === 'withering') {
                    this.object.title = "Withering Attack";
                }
                if (data.rollType === 'gambit') {
                    this.object.title = "Gambit";
                }
                if (data.rollType === 'gambit' || data.rollType === 'decisive') {
                    this.object.isDecisive = true;
                }
            }
            else {
                this.object.dice = 0;
            }
            this.object.targetNumber = 7;
            this.object.successModifier = 0;
            this.object.difficulty = 0;
            this.object.rerollNumber = 0;
            this.object.dice = 0;

            this.object.doubleSuccess = 10;
            this.object.rerollFailed = false;

            this.object.flurry = false;
            this.object.woundPenalty = true;
            this.object.stunt = false;
            if (data.rollType !== 'base' && this.actor.type === 'character') {
                this.object.stunt = true;
            }
            this.object.armorPenalty = false;
            this.object.attributeExcellency = false;
            this.object.abilityExcellency = false;
            this.object.poolExcellency = false;
            this.object.showDamage = false;
            this.object.powerSpent = 0;

            this.object.supportedIntimacy = 0;
            this.object.opposedIntimacy = 0;
            this.object.supportedVirtue = 0;
            this.object.opposedVirtue = 0;

            this.object.reroll = {
                one: { status: false, number: 1 },
                two: { status: false, number: 2 },
                three: { status: false, number: 3 },
                four: { status: false, number: 4 },
                five: { status: false, number: 5 },
                six: { status: false, number: 6 },
                seven: { status: false, number: 7 },
                eight: { status: false, number: 8 },
                nine: { status: false, number: 9 },
                ten: { status: false, number: 10 },
            }

            this.object.damage = {
                damageDice: data.damageDice || 0,
                damageSuccessModifier: data.damage || 0,
                doubleSuccess: 10,
                rerollFailed: false,
                targetNumber: data.targetNumber || 7,
                doubleExtraSuccess: false,
                reroll: {
                    one: { status: false, number: 1 },
                    two: { status: false, number: 2 },
                    three: { status: false, number: 3 },
                    four: { status: false, number: 4 },
                    five: { status: false, number: 5 },
                    six: { status: false, number: 6 },
                    seven: { status: false, number: 7 },
                    eight: { status: false, number: 8 },
                    nine: { status: false, number: 9 },
                    ten: { status: false, number: 10 },
                }
            };
        }

        if (this.object.damage.type === undefined) {
            this.object.damage.type = 'lethal';
        }
        if (this.object.damage.type === undefined) {
            this.object.damage.type = 'lethal';
        }
        if (this.object.diceToSuccesses === undefined) {
            this.object.diceToSuccesses = 0;
        }
        if (this.object.bonusPower === undefined) {
            if (game.settings.get("exaltedessence", "weaponToWithering")) {
                this.object.bonusPower = data.damage || 0;
            }
            else {
                this.object.bonusPower = 0;
            }
        }
        if (this.object.rollType !== 'base') {
            if (this.object.getimianflow === undefined && this.actor.type !== 'npc') {
                this._checkAttributeBonuses();
            }
            if (this.object.augmentattribute === undefined && this.actor.type !== 'npc') {
                this._checkExcellencyBonuses();
            }
            this.object.target = Array.from(game.user.targets)[0] || null;

            if (this.object.target) {
                this.object.defense = this.object.target.actor.system.defence.value;
                this.object.soak = this.object.target.actor.system.soak.value;

                if (this.object.rollType === 'social') {
                    this.object.resolve = this.object.target.actor.system.resolve.value;
                }

                if (this.object.target.actor.effects) {
                    if (this.object.target.actor.effects.some(e => e.name === 'concealment')) {
                        this.object.diceModifier -= 2;
                    }
                    if (this.object.target.actor.effects.some(e => e.name === 'prone')) {
                        this.object.defense -= 2;
                    }
                    if (this.object.target.actor.effects.some(e => e.name === 'surprised')) {
                        this.object.defense -= 1;
                    }
                    if (this.object.target.actor.effects.some(e => e.name === 'lightcover')) {
                        if (this.object.weaponType !== 'melee') {
                            this.object.defense += 1;
                        }
                    }
                    if (this.object.target.actor.effects.some(e => e.name === 'heavycover')) {
                        if (this.object.weaponType !== 'melee') {
                            this.object.defense += 2;
                        }
                    }
                }
            }
        }

    }

    get template() {
        var template = "systems/exaltedessence/templates/dialogues/ability-roll.html";
        if (this.object.rollType === 'base') {
            template = "systems/exaltedessence/templates/dialogues/dice-roll.html";
        }
        if (this.object.rollType === 'withering' || this.object.rollType === 'decisive' || this.object.rollType === 'gambit') {
            template = "systems/exaltedessence/templates/dialogues/attack-roll.html";
        }
        return template;
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        // Token Configuration
        if (this.object.rollType !== 'base') {
            const rollButton = {
                label: this.object.id ? game.i18n.localize('ExEss.Update') : game.i18n.localize('ExEss.Save'),
                class: 'roll-dice',
                icon: 'fas fa-dice-d6',
                onclick: (ev) => {
                    this._saveRoll(this.object);
                },
            };
            buttons = [rollButton, ...buttons];
        }

        return buttons;
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["dialog", `solar-background`],
            popOut: true,
            template: "systems/storypath-fvtt/templates/dialogues/skill-roll.html",
            id: "roll-form",
            title: `Roll`,
            width: 350,
            submitOnChange: true,
            closeOnSubmit: false
        });
    }

    async _saveRoll(rollData) {
        let html = await renderTemplate("systems/exaltedessence/templates/dialogues/save-roll.html", { 'name': this.object.name || 'New Roll' });
        new Dialog({
            title: "Save Roll",
            content: html,
            default: 'save',
            buttons: {
                save: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Save',
                    default: true,
                    callback: html => {
                        let results = document.getElementById('name').value;
                        let uniqueId = this.object.id || randomID(16);
                        rollData.name = results;
                        rollData.id = uniqueId;
                        rollData.target = null;

                        let updates = {
                            "data.savedRolls": {
                                [uniqueId]: rollData
                            }
                        };
                        this.actor.update(updates);
                        this.saved = true;
                        ui.notifications.notify(`Saved Roll`);
                        return;
                    },
                }
            }
        }).render(true);
    }

    getData() {
        return {
            actor: this.actor,
            data: this.object,
        };
    }

    async _updateObject(event, formData) {
        mergeObject(this, formData);
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("change", "#attribute-select", ev => {
            this._checkAttributeBonuses();
            this._checkExcellencyBonuses();
            this.render();
        });

        html.on("change", "#attribute-excellency-select", ev => {
            this._checkExcellencyBonuses();
            this.render();
        });

        html.find('#roll-button').click((event) => {
            this._roll();
            this.close();
        });

        html.find('#roll-accuracy').click((event) => {
            this._attackRoll();
        });

        html.find('#roll-damage').click((event) => {
            this._damageRoll();
            this.close();
        });


        html.find('#cancel').click((event) => {
            this.close();
        });

        html.find('.collapsable').click(ev => {
            const li = $(ev.currentTarget).next();
            li.toggle("fast");
        });
    }

    _baseAbilityDieRoll() {
        let dice = 0;
        if (this.object.rollType === 'base') {
            dice = this.object.dice;
        }
        else {
            if (this.actor.type === 'character') {
                let attributeDice = this.actor.system.attributes[this.object.attribute].value;
                let abilityDice = this.actor.system.abilities[this.object.ability].value;

                if (this.object.attributeExcellency) {
                    attributeDice += Math.max(attributeDice, abilityDice);
                    if (this.object.augmentattribute) {
                        if (this.actor.system.attributes[this.object.attribute].value < 5) {
                            attributeDice++;
                        }
                        if (this.actor.system.essence.value > 1) {
                            if (this.object.doubleSuccess === 10) {
                                this.object.doubleSuccess = 9;
                            }
                            else if (this.object.doubleSuccess === 9) {
                                this.object.doubleSuccess = 8;
                            }
                        }
                    }
                }
                if (this.object.abilityExcellency) {
                    abilityDice = abilityDice * 2;
                }

                if (this.object.getimianflow) {
                    this.object.successModifier += 1;
                }

                dice = attributeDice + abilityDice;
            }
            else if (this.actor.type === 'npc') {
                let poolDice = this.actor.system.pools[this.object.pool].value;
                dice = poolDice;

                if (this.object.poolExcellency) {
                    if (this.object.pool === 'primary') {
                        dice += 4;
                    }
                    else if (this.object.pool === 'secondary') {
                        dice += 3;
                    }
                }

                if (this.actor.system.battlegroup && this.object.rollType == 'attack') {
                    dice += this.actor.system.drill.value;
                }
            }
            if (this.object.woundPenalty && this.actor.system.health.penalty !== 'inc') {
                dice -= this.actor.system.health.penalty;
            }
            if (this.object.armorPenalty) {
                for (let armor of this.actor.armor) {
                    if (armor.data.equiped) {
                        dice = dice - Math.abs(armor.data.penalty);
                    }
                }
            }
            if (this.object.stunt) {
                dice += 2;
            }
            if (this.object.flurry) {
                dice -= 3;
            }
        }


        let rerollString = '';
        let rerolls = [];

        if (this.object.rollType === 'social') {
            this.object.resolve = Math.max(1, this.object.resolve + parseInt(this.object.opposedIntimacy || 0) - parseInt(this.object.supportedIntimacy || 0));
            this.object.resolve = Math.max(1, this.object.resolve + parseInt(this.object.opposedVirtue || 0) - parseInt(this.object.supportedVirtue || 0));
        }

        for (var rerollValue in this.object.reroll) {
            if (this.object.reroll[rerollValue].status) {
                rerollString += `x${this.object.reroll[rerollValue].number}`;
                rerolls.push(this.object.reroll[rerollValue].number);
            }
        }

        if (this.object.diceModifier) {
            dice += this.object.diceModifier;
        }

        if (this.object.diceToSuccesses > 0) {
            this.object.successModifier += Math.min(dice, this.object.diceToSuccesses);
            dice = Math.max(0, dice - this.object.diceToSuccesses);
        }

        let roll = new Roll(`${dice}d10${rerollString}${this.object.rerollFailed ? `r<${this.object.targetNumber}` : ""}cs>=${this.object.targetNumber}`).evaluate({ async: false });
        let diceRoll = roll.dice[0].results;
        var failedDice = Math.min(dice - roll.total, this.object.rerollNumber);
        let rerolledDice = 0;
        let total = 0;

        while (failedDice !== 0 && (rerolledDice < this.object.rerollNumber)) {
            rerolledDice += failedDice;
            var failedDiceRoll = new Roll(`${failedDice}d10cs>=${this.object.targetNumber}`).evaluate({ async: false });
            failedDice = Math.min(failedDice - failedDiceRoll.total, (this.object.rerollNumber - rerolledDice));
            diceRoll = diceRoll.concat(failedDiceRoll.dice[0].results);
            total += failedDiceRoll.total;
        }

        let getDice = "";
        let bonus = 0;

        for (let dice of diceRoll) {
            if (dice.result >= this.object.doubleSuccess) {
                bonus++;
                getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
            }
            else if (dice.result >= this.object.targetNumber) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
            else if (rerolls.includes(dice.result)) { getDice += `<li class="roll die d10 discarded">${dice.result}</li>`; }
            else if (dice.result == 1) { getDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
            else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
        }

        total += roll.total;
        if (bonus) total += bonus;
        this.object.preBonusSuccesses = total;
        if (this.object.successModifier) total += this.object.successModifier;
        if (this.object.accuracySuccesses) total += this.object.accuracySuccesses;


        this.object.dice = dice;
        this.object.roll = roll;
        this.object.getDice = getDice;
        this.object.total = total;
    }

    _abilityRoll() {
        this._baseAbilityDieRoll();

        var resourceResult = ``;
        if (this.object.rollType === 'buildPower' || this.object.rollType === 'focusWill') {
            resourceResult = this._buildResource();
        }
        if (this.object.rollType === 'social') {
            resourceResult = this._socialInfluence();
        }
        let theContent = `
  <div class="chat-card">
      <div class="card-content">Dice Roll</div>
      <div class="card-buttons">
          <div class="flexrow 1">
              <div>Dice Roller - Number of Successes<div class="dice-roll">
                      <div class="dice-result">
                          <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                          <div class="dice-tooltip">
                              <div class="dice">
                                  <ol class="dice-rolls">${this.object.getDice}</ol>
                              </div>
                          </div>
                          <h4 class="dice-total">${this.object.total} Succeses</h4>
                          ${resourceResult}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
  `
        ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: theContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll });
    }

    _buildResource() {
        var total = this.object.total - 3;
        let self = (this.object.buildPowerTarget || 'self') === 'self';

        if (this.actor.type === 'npc' && this.object.rollType === 'buildPower') {
            if (this.actor.system.battlegroup) {
                this.object.successModifier += data.drill.value;
            }
        }
        var message = '';
        if (total < 0) {
            if (this.object.rollType === 'buildPower') {
                message = `<h4 class="dice-total">Build Power Failed</h4>`;
            }
            else if (this.object.rollType === 'focusWill') {
                message = `<h4 class="dice-total">Focus Will Failed</h4>`;
            }
        }
        else {
            let extraPower = ``;
            if (self) {
                const actorData = duplicate(this.actor);
                if (this.object.rollType === 'buildPower') {
                    if (total + actorData.system.power.value > 10) {
                        const extraPowerValue = Math.floor((total + 1 + actorData.system.power.value - 10));
                        extraPower = `<h4 class="dice-total">${extraPowerValue} Extra Power!</h4>`;
                    }
                    actorData.system.power.value = Math.min(10, total + actorData.system.power.value + 1);
                }
                else {
                    actorData.system.will.value = Math.min(10, total + actorData.system.will.value + 1);
                }
                this.actor.update(actorData);
            }
            if (this.object.rollType === 'buildPower') {
                message = `<h4 class="dice-total">${total + 1} Power Built!</h4> ${extraPower}`;
            }
            else if (this.object.rollType === 'focusWill') {
                message = `<h4 class="dice-total">${total + 1} Will Focused!</h4>`;
            }
        }
        return message;
    }

    _socialInfluence() {
        var message = '';
        if (this.object.total < this.object.resolve) {
            message = `<h4 class="dice-formula">${this.object.total} Succeses vs ${this.object.resolve} Resolve</h4><h4 class="dice-total">Influence Failed</h4>`;
        }
        else {
            var total = this.object.total - this.object.resolve;
            message = `<h4 class="dice-formula">${this.object.total} Succeses vs ${this.object.resolve} Resolve</h4> <h4 class="dice-total">${total} Extra Successes!</h4>`;
        }
        return message;
    }

    _attackRoll() {
        this._baseAbilityDieRoll();
        var messageContent = `
  <div class="chat-card">
      <div class="card-content">${this.object.title}</div>
      <div class="card-buttons">
          <div class="flexrow 1">
              <div>
                  <div class="dice-roll">
                      <div class="dice-result">
                          <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier + this.object.accuracySuccesses} successes</h4>
                          <div class="dice-tooltip">
                              <div class="dice">
                                  <ol class="dice-rolls">${this.object.getDice}</ol>
                              </div>
                          </div>
                          <h4 class="dice-total">${this.object.total} Succeses</h4>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
`;
        ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: this.object.roll });
        this.object.showDamage = true;
        this.object.accuracyResult = this.object.total;
        this.render();
    }

    _damageRoll() {
        const actorData = duplicate(this.actor);

        var postDefenceTotal = this.object.accuracyResult - this.object.defense;
        let title = "Decisive Attack";
        if (this.object.rollType === 'withering') {
            title = "Withering Attack";
        }
        if (this.object.rollType === 'gambit') {
            title = "Gambit";
        }
        if (this.object.damage.doubleExtraSuccess) {
            var basePostDefenseTotal = this.object.preBonusSuccesses - this.object.defense;
            if (basePostDefenseTotal > 0) {
                postDefenceTotal += basePostDefenseTotal;
            }
        }
        var messageContent = '';

        if (this.actor.type === 'npc') {
            if (actorData.system.battlegroup) {
                this.object.overwhelming = Math.min(actorData.system.size.value + 1, 5);
            }
        }

        if (postDefenceTotal < 0) {
            var overwhlemingMessage = '';
            let extraPowerMessage = ``;
            if (this.object.rollType === 'withering') {
                overwhlemingMessage = `<h4 class="dice-total">${this.object.overwhelming} Power Built!</h4>`;
                actorData.system.power.value = Math.min(10, this.object.overwhelming + actorData.system.power.value);
                if (this.object.overwhelming + actorData.system.power.value > 10) {
                    const extraPowerValue = Math.floor((this.object.overwhelming + actorData.system.power.value - 10));
                    extraPowerMessage = `<h4 class="dice-total">${extraPowerValue} Extra Power!</h4>`;
                }
            }
            else {
                actorData.system.power.value = Math.max(0, actorData.system.power.value - 1);
            }
            this.actor.update(actorData);
            messageContent = `
      <div class="chat-card">
          <div class="card-content">${title}</div>
          <div class="card-buttons">
              <div class="flexrow 1">
                  <div>
                      <div class="dice-roll">
                          <div class="dice-result">
                              <h4 class="dice-formula">${this.object.accuracyResult} Succeses</h4>
                              <h4 class="dice-formula">${this.object.defense} defence</h4>
                              ${this.object.rollType === 'withering' ? `<h4 class="dice-formula">${this.object.overwhelming} Overwhelming</h4>` : ``}
                              <h4 class="dice-total">Attack Missed!</h4>
                              ${overwhlemingMessage}
                              ${extraPowerMessage}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    `;
            ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
        }
        else {
            if (this.object.rollType === 'decisive') {
                // Deal Damage
                let damage = postDefenceTotal + this.object.power + this.object.damage.damageDice;
                if (this.actor.type === 'npc') {
                    if (actorData.system.battlegroup) {
                        damage += actorData.system.drill.value;
                    }
                }
                let damageRoll = new Roll(`${damage}d10${this.object.damage.rerollFailed ? `r<${this.object.damage.targetNumber}` : ""}cs>=${this.object.damage.targetNumber}`).evaluate({ async: false });
                let damageDiceRoll = damageRoll.dice[0].results;
                let damageBonus = 0;
                let getDamageDice = "";
                for (let dice of damageDiceRoll) {
                    if (dice.result >= this.object.damage.doubleSuccess) {
                        damageBonus++;
                        getDamageDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
                    }
                    else if (dice.result >= this.object.damage.targetNumber) { getDamageDice += `<li class="roll die d10 success">${dice.result}</li>`; }
                    else if (dice.result == 1) { getDamageDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
                    else { getDamageDice += `<li class="roll die d10">${dice.result}</li>`; }
                }

                let damageSuccess = damageRoll.total + this.object.damage.damageSuccessModifier;
                if (damageBonus) damageSuccess += damageBonus;
                let damageTotal = damageSuccess - this.object.soak;

                actorData.system.power.value = Math.max(0, actorData.system.power.value - this.object.power);
                this.actor.update(actorData);
                if (damageTotal > 0) {
                    this.dealHealthDamage(damageTotal);
                }

                messageContent = `
        <div class="chat-card">
            <div class="card-content">Decisive Damage</div>
            <div class="card-buttons">
                <div class="flexrow 1">
                    <div>
                        <div class="dice-roll">
                            <div class="dice-result">
                                <h4 class="dice-formula">${this.object.accuracyResult} Succeses vs ${this.object.defense} defence</h4>
                                <h4 class="dice-formula">${postDefenceTotal} Extra Succeses + ${this.object.power} power</h4>
                                <h4 class="dice-formula">${damage} Damage dice + ${this.object.damage.damageSuccessModifier} successes </h4>
                                <div class="dice-tooltip">
                                  <div class="dice">
                                      <ol class="dice-rolls">${getDamageDice}</ol>
                                  </div>
                                </div>
                                <h4 class="dice-formula">${damageSuccess} Damage - ${this.object.soak} soak</h4>
                                <h4 class="dice-total">${damageTotal} Total Damage</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      `
                ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: damageRoll });
            }
            else if (this.object.rollType === 'withering') {
                var powerGained = postDefenceTotal + this.object.bonusPower + 1;
                if (postDefenceTotal < this.object.overwhelming) {
                    powerGained = this.object.overwhelming + 1;
                }
                let extraPowerMessage = ``;
                if (powerGained + actorData.system.power.value > 10) {
                    const extraPowerValue = Math.floor((powerGained + actorData.system.power.value - 10));
                    extraPowerMessage = `<h4 class="dice-total">${extraPowerValue} Extra Power!</h4>`;
                }
                actorData.system.power.value = Math.min(10, powerGained + actorData.system.power.value);
                this.actor.update(actorData);
                messageContent = `
          <div class="chat-card">
              <div class="card-content">Withering Power</div>
              <div class="card-buttons">
                  <div class="flexrow 1">
                      <div>
                          <div class="dice-roll">
                              <div class="dice-result">
                                  <h4 class="dice-formula">${this.object.accuracyResult} Succeses vs ${this.object.defense} defense</h4>
                                  <h4 class="dice-formula">${this.object.bonusPower} Bonus Power</h4>
                                  <h4 class="dice-formula">1 Base + ${postDefenceTotal} Extra Succeses</h4>
                                  <h4 class="dice-formula">${this.object.overwhelming} Overwhelming</h4>
                                  <h4 class="dice-total">${powerGained} Power Built!</h4>
                                  ${extraPowerMessage}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        `
                ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
            }
            else if (this.object.rollType === 'gambit') {
                actorData.system.power.value = Math.max(0, actorData.system.power.value - this.object.powerSpent);
                this.actor.update(actorData);
                messageContent = `
          <div class="chat-card">
              <div class="card-content">Withering Power</div>
              <div class="card-buttons">
                  <div class="flexrow 1">
                      <div>
                          <div class="dice-roll">
                              <div class="dice-result">
                                <h4 class="dice-formula">${this.object.accuracyResult} Succeses vs ${this.object.defense} defence</h4>
                                  <h4 class="dice-formula">${this.object.powerSpent} Power Spent</h4>
                                  <h4 class="dice-total">Gambit Successful!</h4>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
        `
                ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
            }
        }
        if (this.object.target && game.settings.get("exaltedessence", "calculateOnslaught")) {
            const onslaught = this.object.target.actor.effects.find(i => i.label == "Onslaught");
            if (this.object.rollType === 'decisive') {
                if (onslaught) {
                    onslaught.delete();
                }
            }
            else if (this.object.rollType === 'withering') {
                if (onslaught) {
                    let changes = duplicate(onslaught.data.changes);
                    if (this.object.target.actor.system.hardness.value > 0) {
                        changes[0].value = changes[0].value - 1;
                        onslaught.update({ changes });
                    }
                }
                else {
                    this.object.target.actor.createEmbeddedDocuments('ActiveEffect', [{
                        label: 'Onslaught',
                        icon: 'systems/exaltedessence/assets/icons/surrounded-shield.svg',
                        origin: this.object.target.actor.uuid,
                        disabled: false,
                        "changes": [
                            {
                                "key": "data.hardness.value",
                                "value": -1,
                                "mode": 2
                            }
                        ]
                    }]);
                }
            }
        }
    }

    async dealHealthDamage(characterDamage) {
        if (this.object.target && game.combat && game.settings.get("exaltedessence", "autoDecisiveDamage") && characterDamage > 0) {
            let totalHealth = 0;
            const targetActorData = duplicate(this.object.target.actor);
            if (this.object.target.actor.type === 'npc') {
                totalHealth = targetActorData.system.health.max;
            }
            else {
                for (let [key, health_level] of Object.entries(targetActorData.system.health.levels)) {
                    totalHealth += health_level.value;
                }
            }

            if (this.object.damage.type === 'lethal') {
                targetActorData.system.health.lethal = Math.min(totalHealth - targetActorData.system.health.aggravated, targetActorData.system.health.lethal + characterDamage);
            }
            if (this.object.damage.type === 'aggravated') {
                targetActorData.system.health.aggravated = Math.min(totalHealth - targetActorData.system.health.lethal, targetActorData.system.health.aggravated + characterDamage);
            }
            this.object.target.actor.update(targetActorData);
        }
    }


    _roll() {
        this._abilityRoll();
    }

    _checkAttributeBonuses() {
        this.object.getimianflow = false;
        this.object.augmentattribute = false;
        if (this.actor.type !== 'npc' || this.actor.system.creaturetype === 'exalt') {
            if (this.actor.system.details.exalt === "getimian") {
                if (this.object.attribute === "force" && (this.actor.system.still.total < this.actor.system.flowing.total)) {
                    this.object.getimianflow = true;
                }
                if (this.object.attribute === "finesse" && (this.actor.system.still.total > this.actor.system.flowing.total)) {
                    this.object.getimianflow = true;
                }
                if (this.object.attribute === "fortitude" && (this.actor.system.still.total >= (this.actor.system.flowing.total - 1) && this.actor.system.still.total <= (this.actor.system.flowing.total + 1))) {
                    this.object.getimianflow = true;
                }
            }
        }
    }

    _checkExcellencyBonuses() {
        this.object.augmentattribute = false;
        if (this.object.attributeExcellency && this.actor.system.details.exalt === "alchemical" && this.actor.system.attributes[this.object.attribute].aug) {
            this.object.augmentattribute = true;
        }
    }


    _getHighestAttribute() {
        var highestAttributeNumber = 0;
        var highestAttribute = "force";
        for (let [name, attribute] of Object.entries(this.actor.system.attributes)) {
            if (attribute.value > highestAttributeNumber) {
                highestAttributeNumber = attribute.value;
                highestAttribute = name;
            }
        }
        return highestAttribute;
    }
}