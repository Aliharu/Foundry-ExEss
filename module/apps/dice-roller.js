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
            this.object.successModifier = 0;
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

                this.object.gain = {
                    motes: 0,
                    anima: 0,
                    health: 0,
                    power: 0
                };

                this.object.defense = 0;
                this.object.soak = 0;
                this.object.doubleExtraSuccess = false;
                this.object.resolve = 0;
                this.object.successModifier = data.accuracy || 0;
                this.object.power = this.actor.system.power.value || 0;
                this.object.damageSuccesses = data.damage || 0;
                this.object.overwhelming = data.overwhelming || 0;
                this.object.conditions = (this.actor.token && this.actor.token.actor.effects) ? this.actor.token.actor.effects : [];
                this.object.weaponType = data.weaponType || 'melee';
                this.object.diceModifier = 0;
                this.object.triggerSelfDefensePenalty = 0;


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
            this.object.difficulty = 0;
            this.object.rerollNumber = 0;
            this.object.dice = 0;

            this.object.doubleSuccess = 10;
            this.object.rerollFailed = false;
            this.object.rollTwice = false;

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
            this.object.gambit = 'none';
            this.object.activateAura = 'none';

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
                ignoreSoak: 0,
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

            this.object.addstatuses = [];

            if (data.weapon) {
                this.object.weaponTags = data.weapon.traits.weapontags.selected;
                var weaponAccuracy = data.weapon.accuracy || 0;
                this.object.damage.damageSuccessModifier = data.weapon.damage || 0;
                this.object.overwhelming = data.weapon.overwhelming || 0;
                this.object.weaponType = data.weapon.weapontype || "melee";
                if (this.actor.type === 'character') {
                    if (this.object.weaponType === 'melee') {
                        this.object.ability = 'close';
                    }
                    else {
                        this.object.ability = 'ranged';
                    }
                }
                if (this.object.weaponTags) {
                    if (this.object.rollType === 'decisive') {
                        if (this.object.weaponTags['aggravated']) {
                            this.object.damage.type = 'aggravated';
                        }
                        if (this.object.weaponTags['twohanded']) {
                            this.object.damage.damageSuccessModifier++;
                        }
                    }
                    if (this.object.rollType === 'withering') {
                        if (this.object.weaponTags['balanced']) {
                            this.object.overwhelming++;
                        }
                        if (this.object.weaponTags['paired']) {
                            this.object.bonusPower++;
                        }
                    }
                    if (this.object.rollType === 'gambit') {
                        if (this.object.weaponTags['balanced']) {
                            this.object.diceModifier += 2;
                        }
                    }
                    if (this.object.weaponTags['improvised']) {
                        weaponAccuracy -= Math.min(weaponAccuracy - 2, 0);
                    }
                }
                this.object.successModifier = weaponAccuracy;
                this.object.attackEffectPreset = data.weapon.attackeffectpreset || "none";
                this.object.attackEffect = data.weapon.attackeffect || "";
                if (game.settings.get("exaltedessence", "weaponToWithering")) {
                    this.object.bonusPower = data.weapon.damage || 0;
                }
            }
        }

        if (this.object.addStatuses === undefined) {
            this.object.addStatuses = []
        }
        if (this.object.damage.type === undefined) {
            this.object.damage.type = 'lethal';
        }
        if (this.object.diceToSuccesses === undefined) {
            this.object.diceToSuccesses = 0;
        }
        if (this.object.rollTwice === undefined) {
            this.object.rollTwice = false;
        }
        if (this.object.damage.ignoreSoak === undefined) {
            this.object.damage.ignoreSoak = 0;
            this.object.triggerSelfDefensePenalty = 0;
        }
        if (this.object.weaponTags === undefined) {
            this.object.weaponTags = {};
        }
        if (this.object.activateAura === undefined) {
            this.object.activateAura = 'none';
        }
        if (this.object.cost === undefined) {
            this.object.cost = {
                motes: 0,
                committed: 0,
                power: 0,
                anima: 0,
                stunt: 0,
                healthAggravated: 0,
                healthLethal: 0,
            }
        }
        if (this.object.gain === undefined) {
            this.object.gain = {
                motes: 0,
                anima: 0,
                health: 0,
                power: 0
            };
            this.object.gambit = 'none';
        }
        if (this.object.accuracySuccesses) {
            this.object.successModifier += this.object.accuracySuccesses;
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
            this.object.opposingCharms = [];
            if (this.object.charmList === undefined) {
                this.object.charmList = this.actor.charms;
                for (var charmlist of Object.values(this.object.charmList)) {
                    for (const charm of charmlist.list) {
                        this.getEnritchedHTML(charm);
                    }
                }
            }
            if (this.object.getimianflow === undefined && this.actor.type !== 'npc') {
                this._checkAttributeBonuses();
            }
            if (this.object.augmentattribute === undefined && this.actor.type !== 'npc') {
                this._checkExcellencyBonuses();
            }
            this.object.target = Array.from(game.user.targets)[0] || null;
            this.object.updateTargetActorData = false;
            if (this.object.target) {
                this.object.newTargetData = foundry.utils.duplicate(this.object.target.actor);
            }

            if (this.object.addedCharms === undefined) {
                this.object.addedCharms = [];
            } else {
                for (const addedCharm of this.object.addedCharms) {
                    if (addedCharm.saveId) {
                        addedCharm.id = addedCharm.saveId;
                    }
                    else {
                        var actorItem = this.actor.items.find((item) => item.name === addedCharm.name && item.type === 'charm');
                        if (actorItem) {
                            addedCharm.id = actorItem.id;
                        }
                    }
                }
            }
            if (this.object.specialAttacksList === undefined) {
                this.object.specialAttacksList = [
                    { id: 'aim', name: "Aim", added: false, show: this._isAttackRoll(), description: '+3 Dice, Cannot be used on the same turn as a reflexive move or flurry.', img: 'systems/exaltedessence/assets/icons/targeting.svg' },
                    { id: 'chopping', name: "Chopping/Powerful", added: false, show: false, description: 'Reduce defense by 1. Increase dice by 2 on withering.  -1 enemy hardness on decisive', img: 'systems/exaltedessence/assets/icons/battered-axe.svg' },
                    { id: 'piercing', name: "Piercing", added: false, show: false, description: 'Reduce defense by 1.  Ignore 2 soak.', img: 'systems/exaltedessence/assets/icons/fast-arrow.svg' },
                    { id: 'rush', name: "Rush", added: false, show: this._isAttackRoll(), description: 'Special attack, move 1 range band closer and gain +3 dice on attack.', img: 'systems/exaltedessence/assets/icons/running-ninja.svg' },
                ];
            }

            if (this.object.target) {
                if (this.object.target.actor.type === 'npc') {
                    this.object.defense = this.object.target.actor.system.defense.value;
                }
                else {
                    if (this.object.target.actor.system.parry.value >= this.object.target.actor.system.evasion.value) {
                        this.object.defense = this.object.target.actor.system.parry.value;
                    }
                    else {
                        this.object.defense = this.object.target.actor.system.evasion.value;
                    }
                }
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
                if (this.object.defense < 0) {
                    this.object.defense = 0;
                }
            }
            this._preChatMessage();
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

    async _preChatMessage() {
        if (game.user.targets && game.user.targets.size > 0) {
            for (const target of Array.from(game.user.targets)) {
                const messageContent = await renderTemplate("systems/exaltedessence/templates/chat/targeting-card.html", {
                    actor: this.actor,
                    targetActor: target.actor,
                    imgUrl: CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.ability] || "systems/exaltedessence/assets/icons/d10.svg",
                    rollType: CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.ability] || "ExEss.Roll",
                });
                ChatMessage.create({
                    user: game.user.id,
                    content: messageContent,
                    type: CONST.CHAT_MESSAGE_STYLES.OTHER,
                    flags: {
                        "exaltedessence": {
                            targetActorId: target.actor.id,
                            targetTokenId: target.id,
                        }
                    },
                });
            }
        } else if (CONFIG.EXALTEDESSENCE.targetableRollTypes.includes(this.object.rollType)) {
            const messageContent = await renderTemplate("systems/exaltedessence/templates/chat/targeting-card.html", {
                actor: this.actor,
                targetActor: null,
                imgUrl: CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.ability] || "systems/exaltedessence/assets/icons/d10.svg",
                rollType: CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.ability] || "ExEss.Roll",
            });
            ChatMessage.create({
                user: game.user.id,
                content: messageContent,
                type: CONST.CHAT_MESSAGE_STYLES.OTHER,
                flags: {
                    "exaltedessence": {
                        targetActorId: null,
                        targetTokenId: null,
                    }
                },
            });
        } else if (game.settings.get("exaltedessence", "nonTargetRollCards")) {
            const messageContent = await renderTemplate("systems/exaltedessence/templates/chat/pre-roll-card.html", {
                actor: this.actor,
                imgUrl: CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.ability] || "systems/exaltedessence/assets/icons/d10.svg",
                rollType: CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.ability] || "ExEss.Roll",
            });
            ChatMessage.create({
                user: game.user.id,
                content: messageContent,
                type: CONST.CHAT_MESSAGE_STYLES.OTHER,
                flags: {
                    "exaltedessence": {
                        targetActorId: null,
                        targetTokenId: null,
                    }
                },
            });
        }
    }

    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();
        // Token Configuration
        if (this.object.rollType !== 'base') {
            const charmsButton = {
                label: game.i18n.localize('ExEss.AddCharm'),
                class: 'add-charm',
                id: "add-charm",
                icon: 'fas fa-bolt',
                onclick: (ev) => {
                    this.object.charmList = this.actor.charms;
                    for (var charmlist of Object.values(this.object.charmList)) {
                        for (const charm of charmlist.list) {
                            if (this.object.addedCharms.some((addedCharm) => addedCharm.id === charm._id)) {
                                charm.charmAdded = true;
                            }
                            else {
                                charm.charmAdded = false;
                            }
                            this.getEnritchedHTML(charm);
                        }
                    }
                    if (this.object.addingCharms) {
                        ev.currentTarget.innerHTML = `<i class="fas fa-bolt"></i> ${game.i18n.localize('ExEss.AddCharm')}`;
                    }
                    else {
                        ev.currentTarget.innerHTML = `<i class="fas fa-bolt"></i> ${game.i18n.localize('ExEss.Done')}`;
                    }
                    if (this._isAttackRoll()) {
                        this.object.showSpecialAttacks = true;
                        if (this.object.rollType !== 'gambit') {
                            for (var specialAttack of this.object.specialAttacksList) {
                                if (specialAttack.id === 'chopping' && this.object.rollType === 'withering') {
                                    specialAttack.show = true;
                                }
                                else if (specialAttack.id === 'piercing' && this.object.rollType === 'decisive') {
                                    specialAttack.show = true;
                                }
                                else if (specialAttack.id === 'aim' || specialAttack.id === 'rush') {
                                    specialAttack.show = true;
                                }
                                else {
                                    specialAttack.added = false;
                                    specialAttack.show = false;
                                }
                            }
                        }
                    }
                    this.object.addingCharms = !this.object.addingCharms;
                    this.render();
                },
            };
            buttons = [charmsButton, ...buttons];
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

    async getEnritchedHTML(charm) {
        charm.enritchedHTML = await TextEditor.enrichHTML(charm.system.description, { async: true, secrets: this.actor.isOwner, relativeTo: charm });
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["dialog", `${game.settings.get("exaltedessence", "sheetStyle")}-background`],
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
                            "system.savedRolls": {
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
        }, { classes: ["dialog", `${game.settings.get("exaltedessence", "sheetStyle")}-background`] }).render(true);
    }

    getData() {
        return {
            actor: this.actor,
            data: this.object,
            selects: CONFIG.EXALTEDESSENCE.selects,
        };
    }

    _isAttackRoll() {
        return this.object.rollType === 'withering' || this.object.rollType === 'decisive' || this.object.rollType === 'gambit';
    }

    _getActorCombatant() {
        if (game.combat && (this.actor.token || this.actor.getActiveTokens()[0])) {
            const tokenId = this.actor.token?.id || this.actor.getActiveTokens()[0].id;
            return game.combat.combatants.find(c => c.tokenId === tokenId);
        }
    }

    _getActorToken() {
        if (this.actor.token || this.actor.getActiveTokens()[0]) {
            const tokenId = this.actor.token?.id || this.actor.getActiveTokens()[0].id;
            return canvas.tokens.placeables.filter(x => x.id === tokenId)[0];
        }
    }

    async _updateObject(event, formData) {
        foundry.utils.mergeObject(this, formData);
    }

    async addCharm(item) {
        var existingAddedCharm = this.object.addedCharms.find((addedCharm) => addedCharm.id === item._id);
        if (!existingAddedCharm) {
            item.saveId = item.id;
            this.object.addedCharms.push(item);
            for (var charmlist of Object.values(this.object.charmList)) {
                for (const charm of charmlist.list) {
                    if (this.object.addedCharms.some((addedCharm) => addedCharm.id === charm._id)) {
                        charm.charmAdded = true;
                    }
                }
            }

            this.object.gain.motes += item.system.gain.motes;
            this.object.gain.anima += item.system.gain.anima;
            this.object.gain.health += item.system.gain.health;
            this.object.gain.power += item.system.gain.power;

            this.object.cost.motes += item.system.cost.motes;
            this.object.cost.committed += item.system.cost.committed;
            this.object.cost.anima += item.system.cost.anima;
            this.object.cost.health += item.system.cost.health;
            if (item.system.cost.health > 0) {
                if (item.system.cost.healthtype === 'lethal') {
                    this.object.cost.healthLethal += item.system.cost.health;
                }
                else {
                    this.object.cost.healthAggravated += item.system.cost.health;
                }
            }
            this.object.cost.stunt += item.system.cost.stunt;
            this.object.cost.power += item.system.cost.power;

            this.object.diceModifier += item.system.diceroller.bonusdice;
            this.object.successModifier += item.system.diceroller.bonussuccesses;
            if (item.system.diceroller.doublesuccess < this.object.doubleSuccess) {
                this.object.doubleSuccess = item.system.diceroller.doublesuccess;
            }
            if (item.system.diceroller.rerollfailed) {
                this.object.rerollFailed = item.system.diceroller.rerollfailed;
            }
            if (item.system.diceroller.rolltwice) {
                this.object.rollTwice = item.system.diceroller.rolltwice;
            }
            this.object.rerollNumber += item.system.diceroller.rerolldice;
            this.object.diceToSuccesses += item.system.diceroller.dicetosuccesses;

            this.object.damage.damageDice += item.system.diceroller.damage.bonusdice;
            this.object.damage.damageSuccessModifier += item.system.diceroller.damage.bonussuccesses;
            this.object.overwhelming += item.system.diceroller.damage.overwhelming;
            this.object.damage.postSoakDamage += item.system.diceroller.damage.postsoakdamage;
            if (item.system.diceroller.damage.doubleextrasuccess) {
                this.object.damage.doubleExtraSuccess = item.system.diceroller.damage.doubleextrasuccess;
            }
            if (item.system.diceroller.damage.ignoresoak > 0) {
                this.object.damage.ignoreSoak += item.system.diceroller.damage.ignoresoak;
            }
            if (item.system.diceroller.activateaura !== 'none') {
                this.object.activateAura = item.system.diceroller.activateaura;
            }
            this.render();
        }
    }

    async addOpposingCharm(charm) {
        const index = this.object.opposingCharms.findIndex(opposedCharm => charm._id === opposedCharm._id);
        if (index === -1) {
            this.object.opposingCharms.push(charm);
            if (this._isAttackRoll()) {
                this.object.defense += charm.system.diceroller.opposedbonuses.defense;
                this.object.soak += charm.system.diceroller.opposedbonuses.soak;
            }
            if (this.object.rollType === 'social') {
                this.object.resolve += charm.system.diceroller.opposedbonuses.resolve;
            }
            this.render();
        }
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("change", "#gambit", ev => {
            const gambitCosts = {
                'none': 0,
                'disarm': this.object.defense,
                'distract': 2,
                'ensnare': 3,
                'knockback': 4,
                'knockdown': 4,
                'pilfer': 3,
                'pull': 4,
                'reveal_weakness': 3,
                'unhorse': 5,
            }
            this.object.powerSpent = gambitCosts[this.object.gambit];
            if ((this.object.gambit === 'knockback' || this.object.gambit === 'knockdown') && this.object.weaponTags['smashing']) {
                this.object.powerSpent--;
            }
            if (this.object.gambit === 'ensnare' && this.object.weaponTags['flexible']) {
                this.object.powerSpent--;
            }
            this.render();
        });

        html.on("change", "#attribute-select", ev => {
            this._checkAttributeBonuses();
            this._checkExcellencyBonuses();
            this.render();
        });

        html.on("change", ".excellency-check", ev => {
            if (this.actor.system.details.exalt !== 'solar') {
                if (ev.target.checked) {
                    this.object.cost.motes++;
                }
                else {
                    this.object.cost.motes--;
                }
            }
            this._checkExcellencyBonuses();
            this.render();
        });

        html.find('.add-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = this.actor.items.get(li.data("item-id"));
            this.addCharm(item);
        });

        html.find('.remove-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let item = this.actor.items.get(li.data("item-id"));
            const index = this.object.addedCharms.findIndex(addedItem => item.id === addedItem.id);
            if (index > -1) {
                for (var charmlist of Object.values(this.object.charmList)) {
                    for (const charm of charmlist.list) {
                        if (charm._id === item.id) {
                            charm.charmAdded = false;
                        }
                    }
                }
                this.object.addedCharms.splice(index, 1);

                this.object.gain.motes -= item.system.gain.motes;
                this.object.gain.anima -= item.system.gain.anima;
                this.object.gain.health -= item.system.gain.health;
                this.object.gain.power -= item.system.gain.power;

                this.object.cost.motes -= item.system.cost.motes;
                this.object.cost.committed -= item.system.cost.committed;
                this.object.cost.anima -= item.system.cost.anima;
                if (item.system.cost.health > 0) {
                    if (item.system.cost.healthtype === 'lethal') {
                        this.object.cost.healthLethal -= item.system.cost.health;
                    }
                    else {
                        this.object.cost.healthAggravated -= item.system.cost.health;
                    }
                }
                this.object.cost.stunt -= item.system.cost.stunt;
                this.object.cost.power -= item.system.cost.power;

                this.object.diceModifier -= item.system.diceroller.bonusdice;
                this.object.successModifier -= item.system.diceroller.bonussuccesses;
                if (item.system.diceroller.rerollfailed) {
                    this.object.rerollFailed = false;
                }
                if (item.system.diceroller.rolltwice) {
                    this.object.rollTwice = false;
                }
                this.object.rerollNumber -= item.system.diceroller.rerolldice;
                this.object.diceToSuccesses -= item.system.diceroller.dicetosuccesses;

                this.object.damage.damageDice -= item.system.diceroller.damage.bonusdice;
                this.object.damage.damageSuccessModifier -= item.system.diceroller.damage.bonussuccesses;
                this.object.overwhelming -= item.system.diceroller.damage.overwhelming;
                this.object.damage.postSoakDamage -= item.system.diceroller.damage.postsoakdamage;
                if (item.system.diceroller.damage.doubleextrasuccess) {
                    this.object.damage.doubleExtraSuccess = false;
                }
                if (item.system.diceroller.damage.ignoresoak > 0) {
                    this.object.damage.ignoreSoak -= item.system.diceroller.damage.ignoresoak;
                }
                if (item.system.diceroller.activateaura === this.object.activateAura) {
                    this.object.activateAura = 'none';
                }
            }
            this.render();
        });

        html.find('.add-special-attack').click((ev) => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let id = li.data("item-id");
            for (var specialAttack of this.object.specialAttacksList) {
                if (specialAttack.id === id) {
                    specialAttack.added = true;
                }
            }
            if (id === 'rush' || id === 'aim') {
                this.object.diceModifier += 3;
            }
            else {
                if (id === 'chopping' && this.object.rollType === 'withering') {
                    this.object.diceModifier += 2;
                }
                else if (id === 'piercing' && this.object.rollType === 'decisive') {
                    this.object.damage.ignoreSoak += 2;
                }
                this.object.triggerSelfDefensePenalty += 1;
            }
            this.render();
        });

        html.find('.remove-special-attack').click((ev) => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let id = li.data("item-id");
            if (id === 'rush' || id === 'aim') {
                this.object.diceModifier -= 3;
            }
            else {
                for (var specialAttack of this.object.specialAttacksList) {
                    if (specialAttack.id === id) {
                        specialAttack.added = false;
                    }
                }
                if (id === 'chopping') {
                    this.object.diceModifier -= 2;
                }
                else if (id === 'piercing') {
                    this.object.damage.ignoreSoak -= 2;
                }
                this.object.triggerSelfDefensePenalty = Math.max(0, this.object.triggerSelfDefensePenalty - 1);
            }
            this.render();
        });

        html.find('.remove-opposing-charm').click(ev => {
            ev.stopPropagation();
            let li = $(ev.currentTarget).parents(".item");
            let id = li.data("item-id");
            const charm = this.object.opposingCharms.find(opposedCharm => id === opposedCharm._id);
            const index = this.object.opposingCharms.findIndex(opposedCharm => id === opposedCharm._id);
            if (index > -1) {
                this.object.opposingCharms.splice(index, 1);
                if (this._isAttackRoll()) {
                    this.object.defense -= charm.system.diceroller.opposedbonuses.defense;
                    this.object.soak -= charm.system.diceroller.opposedbonuses.soak;
                }
                if (this.object.rollType === 'social') {
                    this.object.resolve -= charm.system.diceroller.opposedbonuses.resolve;
                }
                this.render();
            }
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

    // Dovie'andi se tovya sagain.
    async _rollTheDice(dice, diceModifiers) {
        var total = 0;
        var results = null;
        let rerolls = [];
        for (var rerollValue in diceModifiers.reroll) {
            if (diceModifiers.reroll[rerollValue].status) {
                rerolls.push(diceModifiers.reroll[rerollValue].number);
            }
        }
        var roll = await new Roll(`${dice}d10cs>=${diceModifiers.targetNumber}`).evaluate();
        results = roll.dice[0].results;
        total = roll.total;
        if (rerolls.length > 0) {
            while (results.some(dieResult => (rerolls.includes(dieResult.result) && !dieResult.rerolled))) {
                var toReroll = 0;
                for (const diceResult of results) {
                    if (!diceResult.rerolled && rerolls.includes(diceResult.result)) {
                        toReroll++;
                        diceResult.rerolled = true;
                    }
                }
                var rerollRoll = await new Roll(`${toReroll}d10cs>=${diceModifiers.targetNumber}`).evaluate();
                results = results.concat(rerollRoll.dice[0].results);
                total += rerollRoll.total;
            }
        }
        for (let dice of results) {
            if (dice.result >= diceModifiers.doubleSuccess && dice.result >= diceModifiers.targetNumber) {
                total += 1;
                dice.doubled = true;
            }
        }

        let rollResult = {
            roll: roll,
            results: results,
            total: total,
        };

        return rollResult;
    }

    async _calculateRoll(dice, diceModifiers) {
        let rollResults = await this._rollTheDice(dice, diceModifiers);
        let diceRoll = rollResults.results;
        let total = rollResults.total;
        var possibleRerolls = 0;
        if (diceModifiers.rerollFailed) {
            for (const diceResult of diceRoll.sort((a, b) => a.result - b.result)) {
                if (!diceResult.rerolled && diceResult.result < this.object.targetNumber) {
                    possibleRerolls++;
                    diceResult.rerolled = true;
                }
            }
            var failedDiceRollResult = await this._rollTheDice(possibleRerolls, diceModifiers);
            diceRoll = diceRoll.concat(failedDiceRollResult.results);
            total += failedDiceRollResult.total;
        }

        possibleRerolls = 0;
        for (const diceResult of diceRoll.sort((a, b) => a.result - b.result)) {
            if (diceModifiers.rerollNumber > possibleRerolls && !diceResult.rerolled && diceResult.result < this.object.targetNumber) {
                possibleRerolls++;
                diceResult.rerolled = true;
            }
        }

        var diceToReroll = Math.min(possibleRerolls, diceModifiers.rerollNumber);
        let rerolledDice = 0;
        while (diceToReroll > 0 && (rerolledDice < diceModifiers.rerollNumber)) {
            rerolledDice += possibleRerolls;
            var rerollNumDiceResults = await this._rollTheDice(diceToReroll, diceModifiers);
            diceToReroll = 0
            for (const diceResult of rerollNumDiceResults.results.sort((a, b) => a.result - b.result)) {
                if (diceModifiers.rerollNumber > possibleRerolls && !diceResult.rerolled && diceResult.result < this.object.targetNumber) {
                    possibleRerolls++;
                    diceToReroll++;
                    diceResult.rerolled = true;
                }
            }
            diceRoll = diceRoll.concat(rerollNumDiceResults.results);
            total += rerollNumDiceResults.total;
        }
        var preBonusSuccesses = total;
        total += diceModifiers.successModifier;
        rollResults.roll.dice[0].results = diceRoll;

        let diceDisplay = "";
        for (let dice of diceRoll.sort((a, b) => b.result - a.result)) {
            if (dice.doubled) {
                diceDisplay += `<li class="roll die d10 success double-success">${dice.result}</li>`;
            }
            else if (dice.result >= diceModifiers.targetNumber) { diceDisplay += `<li class="roll die d10 success">${dice.result}</li>`; }
            else if (dice.rerolled) { diceDisplay += `<li class="roll die d10 rerolled">${dice.result}</li>`; }
            else if (dice.result == 1) { diceDisplay += `<li class="roll die d10 failure">${dice.result}</li>`; }
            else { diceDisplay += `<li class="roll die d10">${dice.result}</li>`; }
        }

        return {
            roll: rollResults.roll,
            diceDisplay: diceDisplay,
            total: total,
            preSuccessBonus: preBonusSuccesses,
            diceRoll: diceRoll,
        };
    }

    async _baseAbilityDieRoll() {
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
            if (this.object.woundPenalty) {
                dice -= this.actor.system.health.penalty !== 'inc' ? this.actor.system.health.penalty : 2;
            }
            if (this.object.armorPenalty) {
                for (let armor of this.actor.armor) {
                    if (armor.data.equipped) {
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

            dice += this.object.diceModifier;
        }
        if (this.object.rollType === 'social') {
            this.object.resolve = Math.max(1, this.object.resolve + parseInt(this.object.opposedIntimacy || 0) - parseInt(this.object.supportedIntimacy || 0));
            this.object.resolve = Math.max(1, this.object.resolve + parseInt(this.object.opposedVirtue || 0) - parseInt(this.object.supportedVirtue || 0));
        }

        if (dice < 0) {
            dice = 0;
        }
        this.object.dice = dice;

        var rollModifiers = {
            successModifier: this.object.successModifier,
            doubleSuccess: this.object.doubleSuccess,
            targetNumber: this.object.targetNumber,
            reroll: this.object.reroll,
            rerollFailed: this.object.rerollFailed,
            rerollNumber: this.object.rerollNumber,
        }

        const diceRollResults = await this._calculateRoll(dice, rollModifiers);
        this.object.roll = diceRollResults.roll;
        this.object.displayDice = diceRollResults.diceDisplay;
        this.object.total = diceRollResults.total;
        this.object.preBonusSuccesses = diceRollResults.preBonusSuccesses;

        if (this.object.rollTwice) {
            const secondRoll = await this._calculateRoll(dice, rollModifiers);
            if (secondRoll.total > diceRollResults.total) {
                this.object.roll = secondRoll.roll;
                this.object.displayDice = secondRoll.diceDisplay;
                this.object.total = secondRoll.total;
                this.object.preBonusSuccesses = secondRoll.preBonusSuccesses;
            }
        }
        this.object.roll.dice[0].options.rollOrder = 1;

        if (this.object.rollType !== 'base') {
            this._updateCharacterResources();
        }
        console.log(this.object);
    }

    async _abilityRoll() {
        await this._baseAbilityDieRoll();

        var resourceResult = ``;
        if (this.object.rollType === 'buildPower' || this.object.rollType === 'focusWill') {
            resourceResult = this._buildResource();
        }
        if (this.object.rollType === 'social') {
            resourceResult = this._socialInfluence();
        }
        if (this.object.rollType === "joinBattle") {
            let combat = game.combat;
            if (combat) {
                let combatant = this._getActorCombatant();
                if (combatant) {
                    combat.setInitiative(combatant.id, this.object.total);
                }
            }
        }
        let theContent = `
              <div><div class="dice-roll">
                      <div class="dice-result">
                          <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                          <div class="dice-tooltip">
                              <div class="dice">
                                  <ol class="dice-rolls">${this.object.displayDice}</ol>
                              </div>
                          </div>
                          <h4 class="dice-total">${this.object.total} Successes</h4>
                          ${resourceResult}
                      </div>
                  </div>
              </div>`
        theContent = await this._createChatMessageContent(theContent, 'Dice Roll');
        ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: theContent, type: CONST.CHAT_MESSAGE_STYLES.OTHER, rolls: [this.object.roll] });
    }

    _buildResource() {
        var total = this.object.total - 3;
        let self = (this.object.buildPowerTarget || 'self') === 'self';

        if (this.actor.type === 'npc' && this.object.rollType === 'buildPower') {
            if (this.actor.system.battlegroup) {
                this.object.successModifier += this.actor.system.drill.value;
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
                const actorData = foundry.utils.duplicate(this.actor);
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
            else {
                this.object.updateTargetActorData = true;
                if (this.object.rollType === 'buildPower') {
                    if (total + this.object.newTargetData.system.power.value > 10) {
                        const extraPowerValue = Math.floor((total + 1 + this.object.newTargetData.system.power.value - 10));
                        extraPower = `<h4 class="dice-total">${extraPowerValue} Extra Power!</h4>`;
                    }
                    this.object.newTargetData.system.power.value = Math.min(10, total + this.object.newTargetData.system.power.value + 1);
                }
                else {
                    this.object.newTargetData.system.will.value = Math.min(10, total + this.object.newTargetData.system.will.value + 1);
                }
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
            message = `<h4 class="dice-formula">${this.object.total} Successes vs ${this.object.resolve} Resolve</h4><h4 class="dice-total">Influence Failed</h4>`;
        }
        else {
            var total = this.object.total - this.object.resolve;
            message = `<h4 class="dice-formula">${this.object.total} Successes vs ${this.object.resolve} Resolve</h4> <h4 class="dice-total">${total} Extra Successes!</h4>`;
        }
        return message;
    }

    async _attackRoll() {
        await this._baseAbilityDieRoll();
        var messageContent = `
              <div>
                  <div class="dice-roll">
                      <div class="dice-result">
                          <h4 class="dice-formula">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                          <div class="dice-tooltip">
                              <div class="dice">
                                  <ol class="dice-rolls">${this.object.displayDice}</ol>
                              </div>
                          </div>
                          <h4 class="dice-total">${this.object.total} Successes</h4>
                      </div>
                  </div>
              </div>`;
        messageContent = await this._createChatMessageContent(messageContent, 'Dice Roll');
        ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_STYLES.OTHER, rolls: [this.object.roll] });
        this.object.showDamage = true;
        this.object.accuracyResult = this.object.total;
        this.render();
    }

    async _damageRoll() {
        const actorData = foundry.utils.duplicate(this.actor);

        var postDefenseTotal = this.object.accuracyResult - this.object.defense;
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
                postDefenseTotal += basePostDefenseTotal;
            }
        }
        var messageContent = '';

        if (this.actor.type === 'npc') {
            if (actorData.system.battlegroup) {
                this.object.overwhelming = Math.min(actorData.system.size.value + 1, 5);
            }
        }

        if (postDefenseTotal < 0) {
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
                  <div>
                      <div class="dice-roll">
                          <div class="dice-result">
                              <h4 class="dice-formula">${this.object.accuracyResult} Successes</h4>
                              <h4 class="dice-formula">${this.object.defense} defense</h4>
                              ${this.object.rollType === 'withering' ? `<h4 class="dice-formula">${this.object.overwhelming} Overwhelming</h4>` : ``}
                              <h4 class="dice-total">Attack Missed!</h4>
                              ${overwhlemingMessage}
                              ${extraPowerMessage}
                          </div>
                      </div>
                  </div>`;
            messageContent = await this._createChatMessageContent(messageContent, 'Dice Roll');
            ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_STYLES.OTHER });
        }
        else {
            if (this.object.rollType === 'decisive') {
                // Deal Damage
                let damage = postDefenseTotal + this.object.power + this.object.damage.damageDice;
                if (this.actor.type === 'npc') {
                    if (actorData.system.battlegroup) {
                        damage += actorData.system.drill.value;
                    }
                }
                var rollModifiers = {
                    successModifier: this.object.damage.damageSuccessModifier,
                    doubleSuccess: this.object.damage.doubleSuccess,
                    targetNumber: this.object.damage.targetNumber,
                    reroll: this.object.damage.reroll,
                    rerollFailed: this.object.damage.rerollFailed,
                    rerollNumber: this.object.damage.rerollNumber,
                    preRollMacros: [],
                    macros: [],
                }
                var diceRollResults = await this._calculateRoll(damage, rollModifiers);
                if (this.object.damage.rollTwice) {
                    const secondRoll = await this._calculateRoll(damage, rollModifiers);
                    if (secondRoll.total > diceRollResults.total) {
                        diceRollResults = secondRoll;
                    }
                }
                let damageTotal = Math.max(0, diceRollResults.total - Math.max(0, this.object.soak - this.object.damage.ignoreSoak));
                actorData.system.power.value = Math.max(0, actorData.system.power.value - this.object.power);

                this.actor.update(actorData);
                if (damageTotal > 0) {
                    this._dealHealthDamage(damageTotal);
                }

                messageContent = `
                    <div>
                        <div class="dice-roll">
                            <div class="dice-result">
                                <h4 class="dice-formula">${this.object.accuracyResult} Successes vs ${this.object.defense} defense</h4>
                                <h4 class="dice-formula">${postDefenseTotal} Extra Successes + ${this.object.power} power</h4>
                                <h4 class="dice-formula">${damage} Damage dice + ${this.object.damage.damageSuccessModifier} successes </h4>
                                <div class="dice-tooltip">
                                  <div class="dice">
                                      <ol class="dice-rolls">${diceRollResults.diceDisplay}</ol>
                                  </div>
                                </div>
                                <h4 class="dice-formula">${diceRollResults.total} Damage - ${this.object.soak} soak (Ignore ${this.object.damage.ignoreSoak})</h4>
                                <h4 class="dice-total">${damageTotal} Total Damage</h4>
                            </div>
                        </div>
                    </div>`
                messageContent = await this._createChatMessageContent(messageContent, 'Decisive Damage');
                ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_STYLES.OTHER, rolls: [diceRollResults.roll] });
            }
            else if (this.object.rollType === 'withering') {
                var powerGained = postDefenseTotal + this.object.bonusPower + 1;
                if (postDefenseTotal < this.object.overwhelming) {
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
                      <div>
                          <div class="dice-roll">
                              <div class="dice-result">
                                  <h4 class="dice-formula">${this.object.accuracyResult} Successes vs ${this.object.defense} defense</h4>
                                  <h4 class="dice-formula">${this.object.bonusPower} Bonus Power</h4>
                                  <h4 class="dice-formula">1 Base + ${postDefenseTotal} Extra Successes</h4>
                                  <h4 class="dice-formula">${this.object.overwhelming} Overwhelming</h4>
                                  <h4 class="dice-total">${powerGained} Power Built!</h4>
                                  ${extraPowerMessage}
                              </div>
                          </div>
                      </div>`
                messageContent = await this._createChatMessageContent(messageContent, 'Decisive Damage');
                ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_STYLES.OTHER });
            }
            else if (this.object.rollType === 'gambit') {
                actorData.system.power.value = Math.max(0, actorData.system.power.value - this.object.powerSpent);
                this.actor.update(actorData);
                messageContent = `
                      <div>
                          <div class="dice-roll">
                              <div class="dice-result">
                                <h4 class="dice-formula">${this.object.accuracyResult} Successes vs ${this.object.defense} defense</h4>
                                  <h4 class="dice-formula">${this.object.powerSpent} Power Spent</h4>
                                  <h4 class="dice-total">Gambit Successful!</h4>
                              </div>
                          </div>
                      </div>`
                messageContent = await this._createChatMessageContent(messageContent, 'Withering Power');
                ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_STYLES.OTHER });
            }
        }
        if (this.object.rollType === 'withering' && this.object.target && game.settings.get("exaltedessence", "calculateOnslaught")) {
            this._addOnslaught(1);
        }
        if (postDefenseTotal >= 0 && this.object.target) {
            if (this.object.rollType === 'decisive' && game.settings.get("exaltedessence", "calculateOnslaught")) {
                this._removeOnslaught();
            }
            if (this.object.rollType === 'gambit') {
                this._resolveGambit(postDefenseTotal);
            }
        }

        if (this.object.triggerSelfDefensePenalty > 0) {
            const existingPenalty = this.actor.effects.find(i => i.name === "Defense Penalty");
            if (existingPenalty) {
                let changes = foundry.utils.duplicate(existingPenalty.changes);
                if (this.actor.type === 'character') {
                    changes[0].value = changes[0].value - 1;
                    changes[1].value = changes[1].value - 1;
                }
                else {
                    changes[0].value = changes[0].value - 1;
                }
                existingPenalty.update({ changes });
            }
            else {
                var changes = [
                    {
                        "key": "system.evasion.value",
                        "value": -1,
                        "mode": 2
                    },
                    {
                        "key": "system.parry.value",
                        "value": -1,
                        "mode": 2
                    }
                ];
                if (this.actor.type === 'npc') {
                    changes = [
                        {
                            "key": "system.defense.value",
                            "value": -1,
                            "mode": 2
                        },
                    ];
                }
                this.actor.createEmbeddedDocuments('ActiveEffect', [{
                    name: "Defense Penalty",
                    img: 'systems/exaltedessence/assets/icons/slashed-shield.svg',
                    origin: this.actor.uuid,
                    disabled: false,
                    duration: {
                        rounds: 10,
                    },
                    "changes": changes
                }]);
            }
        }
        if (this.object.updateTargetActorData) {
            this._updateTargetActor();
        }
        this.attackSequence();
    }

    _addOnslaught(number = 1) {
        this.object.updateTargetActorData = true;
        const onslaught = this.object.newTargetData.effects.find(i => i.flags.exaltedessence?.statusId == "onslaught");
        if (onslaught) {
            onslaught.changes[0].value = onslaught.changes[0].value - number;
        }
        else {
            this.object.newTargetData.effects.push({
                name: 'Onslaught',
                img: 'systems/exaltedessence/assets/icons/surrounded-shield.svg',
                origin: this.object.target.actor.uuid,
                disabled: false,
                duration: {
                    rounds: 10,
                },
                flags: {
                    "exaltedessence": {
                        statusId: 'onslaught',
                    }
                },
                changes: [
                    {
                        "key": "system.hardness.value",
                        "value": number * -1,
                        "mode": 2
                    }
                ]
            });
        }
    }

    async _createChatMessageContent(content, cardName = 'Roll') {
        const messageData = {
            name: cardName,
            rollTypeImgUrl: CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.ability] || "systems/exaltedessence/assets/icons/d10.svg",
            rollTypeLabel: CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.ability] || "ExEss.Roll",
            messageContent: content,
            rollData: this.object,
            rollingActor: this.actor,
        }
        return await renderTemplate("systems/exaltedessence/templates/chat/roll-card.html", messageData);
    }

    _removeOnslaught() {
        this.object.newTargetData.effects = this.object.newTargetData.effects.filter(i => i.flags.exaltedessence?.statusId !== "onslaught");
        if (game.user.isGM) {
            const onslaught = this.object.target.actor.effects.find(i => i.flags.exaltedessence?.statusId == "onslaught");
            if (onslaught) {
                onslaught.delete();
            }
        }
        else {
            game.socket.emit('system.exaltedessence', {
                type: 'removeOnslaught',
                id: this.object.target.id,
                data: null,
            });
        }
    }

    _resolveGambit(postDefenseTotal = 0) {
        this.object.updateTargetActorData = true;
        switch (this.object.gambit) {
            case 'disarm':
                this.object.addStatuses.push('disarmed');
                break;
            case 'knockdown':
                this.object.addStatuses.push('prone');
                break;
            case 'ensnare':
                this.object.addStatuses.push('ensnared');
                break;
            case 'reveal_weakness':
                let soakReduction = (this.object.newTargetData.system.soak.value >= 6) ? (Math.ceil(this.object.newTargetData.system.soak.value / 2)) : 2;
                this.object.newTargetData.effects.push({
                    name: 'Reveal Weakness',
                    img: 'systems/exaltedessence/assets/icons/slashed-shield.svg',
                    origin: this.object.target.actor.uuid,
                    disabled: false,
                    duration: {
                        rounds: postDefenseTotal,
                    },
                    flags: {
                        "exaltedessence": {
                            statusId: 'reveal_weakness',
                        }
                    },
                    changes: [
                        {
                            "key": "system.soak.value",
                            "value": soakReduction * -1,
                            "mode": 2
                        }
                    ]
                });
                break;
            case 'pull':
                this._addEndofRoundDefensePenalty(postDefenseTotal);
                break;
            case 'pull':
                this._addEndofRoundDefensePenalty(postDefenseTotal);
                break;
            case 'distract':
                this._addEndofRoundDefensePenalty(postDefenseTotal + 1);
                break;
        }
    }

    _addEndofRoundDefensePenalty(value) {
        var changes = [
            {
                "key": "system.evasion.value",
                "value": value * -1,
                "mode": 2
            },
            {
                "key": "system.parry.value",
                "value": value * -1,
                "mode": 2
            }
        ];
        if (this.object.target.actor.type === 'npc') {
            changes = [
                {
                    "key": "system.defense.value",
                    "value": value * -1,
                    "mode": 2
                },
            ];
        }
        this.object.newTargetData.effects.push({
            name: 'Defense Penalty',
            img: 'systems/exaltedessence/assets/icons/slashed-shield.svg',
            origin: this.object.target.actor.uuid,
            disabled: false,
            duration: {
                rounds: 1,
            },
            flags: {
                "exaltedessence": {
                    statusId: 'end_of_round',
                }
            },
            "changes": changes
        });
    }

    _dealHealthDamage(characterDamage) {
        if (this.object.target && game.combat && game.settings.get("exaltedessence", "autoDecisiveDamage") && characterDamage > 0) {
            this.object.updateTargetActorData = true;
            let totalHealth = 0;
            if (this.object.target.actor.type === 'npc') {
                totalHealth = this.object.newTargetData.system.health.max;
            }
            else {
                for (let [key, health_level] of Object.entries(this.object.newTargetData.system.health.levels)) {
                    totalHealth += health_level.value;
                }
            }
            if (this.object.damage.type === 'lethal') {
                this.object.newTargetData.system.health.lethal = Math.min(totalHealth - this.object.newTargetData.system.health.aggravated, this.object.newTargetData.system.health.lethal + characterDamage);
            }
            if (this.object.damage.type === 'aggravated') {
                this.object.newTargetData.system.health.aggravated = Math.min(totalHealth - this.object.newTargetData.system.health.lethal, this.object.newTargetData.system.health.aggravated + characterDamage);
            }
        }
    }

    async _updateTargetActor() {
        if (game.user.isGM) {
            await this.object.target.actor.update(this.object.newTargetData);
            for (const status of this.object.addStatuses) {
                const effectExists = this.object.target.actor.effects.find(e => e.statuses.has(status));
                if (!effectExists) {
                    await this.object.target.toggleStatusEffect(status);
                }
            }
        }
        else {
            game.socket.emit('system.exaltedessence', {
                type: 'updateTargetData',
                id: this.object.target.id,
                data: this.object.newTargetData,
                addStatuses: this.object.addStatuses
            });
        }
    }


    async _roll() {
        await this._abilityRoll();
        if (this.object.updateTargetActorData) {
            this._updateTargetActor();
        }
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

    async _updateCharacterResources() {
        const actorData = foundry.utils.duplicate(this.actor);
        var newAnimaValue = Math.max(0, actorData.system.anima.value - this.object.cost.anima + this.object.gain.anima);
        if (actorData.system.details.exalt === 'getimian') {
            if (actorData.system.settings.charmspendpool === 'still') {
                actorData.system.still.value = Math.max(0, actorData.system.still.value - this.object.cost.motes - this.object.cost.committed);
                actorData.system.still.value += this.object.gain.motes;
            }
            if (actorData.system.settings.charmspendpool === 'flowing') {
                actorData.system.flowing.value = Math.max(0, actorData.system.flowing.value - this.object.cost.motes - this.object.cost.committed);
                actorData.system.flowing.value += this.object.gain.motes;
            }
        }
        else {
            actorData.system.motes.value = Math.max(0, actorData.system.motes.value - this.object.cost.motes - this.object.cost.committed + this.object.gain.motes);
        }
        actorData.system.motes.committed += this.object.cost.committed;
        actorData.system.stunt.value = Math.max(0, actorData.system.stunt.value - this.object.cost.stunt);
        actorData.system.power.value = Math.max(0, actorData.system.power.value - this.object.cost.power + this.object.gain.power);
        this.object.power = actorData.system.power.value;
        actorData.system.anima.value = newAnimaValue;
        let totalHealth = 0;
        for (let [key, health_level] of Object.entries(actorData.system.health.levels)) {
            totalHealth += health_level.value;
        }
        if (this.object.cost.healthAggravated > 0) {
            actorData.system.health.aggravated = Math.min(totalHealth - actorData.system.health.lethal, actorData.system.health.aggravated + this.object.cost.healthAggravated);
        }
        if (this.object.cost.healthLethal > 0) {
            actorData.system.health.lethal = Math.min(totalHealth - actorData.system.health.aggravated, actorData.system.health.lethal + this.object.cost.healthLethal);
        }
        if (this.object.gain.health > 0) {
            actorData.system.health.lethal = Math.max(0, actorData.system.health.lethal - this.object.gain.health);
        }
        this.actor.system.power.value = actorData.system.power.value;
        if (this.object.activateAura !== 'none') {
            actorData.system.details.aura = this.object.activateAura;
        }
        await this.actor.update(actorData);
    }

    attackSequence() {
        const actorToken = this._getActorToken();
        if (this.object.target && actorToken && game.settings.get("exaltedessence", "attackEffects")) {
            if (this.object.attackEffectPreset !== 'none') {
                let effectsMap = {
                    'arrow': 'jb2a.arrow.physical.white.01.05ft',
                    'bite': 'jb2a.bite.400px.red',
                    'brawl': 'jb2a.flurry_of_blows.physical.blue',
                    'claws': 'jb2a.claws.400px.red',
                    'fireball': 'jb2a.fireball.beam.orange',
                    'firebreath': 'jb2a.breath_weapons.fire.line.orange',
                    'flamepiece': 'jb2a.bullet.01.orange.05ft',
                    'glaive': 'jb2a.glaive.melee.01.white.5',
                    'goremaul': 'jb2a.maul.melee.standard.white',
                    'greatsaxe': 'jb2a.greataxe.melee.standard.white',
                    'greatsword': 'jb2a.greatsword.melee.standard.white',
                    'handaxe': 'jb2a.handaxe.melee.standard.white',
                    'lightning': 'jb2a.chain_lightning.primary.blue.05ft',
                    'quarterstaff': 'jb2a.quarterstaff.melee.01.white.3',
                    'rapier': 'jb2a.rapier.melee.01.white.4',
                    'scimitar': 'jb2a.scimitar.melee.01.white.0',
                    'shortsword': 'jb2a.shortsword.melee.01.white.0',
                    'spear': 'jb2a.spear.melee.01.white.2',
                    'sword': 'jb2a.sword.melee.01.white.4',
                    'throwdagger': 'jb2a.dagger.throw.01.white.15ft',
                }

                switch (this.object.attackEffectPreset) {
                    case 'fireball':
                        new Sequence()
                            .effect()
                            .file(effectsMap[this.object.attackEffectPreset])
                            .atLocation(actorToken)
                            .stretchTo(this.object.target)
                            .effect()
                            .file("jb2a.fireball.explosion.orange")
                            .atLocation(this.object.target)
                            .delay(2100)
                            .effect()
                            .file("jb2a.ground_cracks.orange.01")
                            .atLocation(this.object.target)
                            .belowTokens()
                            .scaleIn(0.5, 150, { ease: "easeOutExpo" })
                            .duration(5000)
                            .fadeOut(3250, { ease: "easeInSine" })
                            .name("Fireball_Impact")
                            .delay(2300)
                            .waitUntilFinished(-3250)
                            .effect()
                            .file("jb2a.impact.ground_crack.still_frame.01")
                            .atLocation(this.object.target)
                            .belowTokens()
                            .fadeIn(300, { ease: "easeInSine" })
                            .play();
                        break;
                    case 'flamepiece':
                        new Sequence()
                            .effect()
                            .file(effectsMap[this.object.attackEffectPreset])
                            .atLocation(actorToken)
                            .stretchTo(this.object.target)
                            .waitUntilFinished(-500)
                            .effect()
                            .file("jb2a.impact.010.orange")
                            .atLocation(this.object.target)
                            .play()
                        break;
                    case 'goremaul':
                        new Sequence()
                            .effect()
                            .file(effectsMap[this.object.attackEffectPreset])
                            .atLocation(actorToken)
                            .stretchTo(this.object.target)
                            .waitUntilFinished(-1100)
                            .effect()
                            .file("jb2a.impact.ground_crack.orange")
                            .atLocation(this.object.target)
                            .scale(0.5)
                            .belowTokens()
                            .play();
                        break;
                    case 'none':
                        break;
                    default:
                        new Sequence()
                            .effect()
                            .file(effectsMap[this.object.attackEffectPreset])
                            .atLocation(actorToken)
                            .stretchTo(this.object.target)
                            .play()
                        break;
                }
            }
            else if (this.object.attackEffect) {
                new Sequence()
                    .effect()
                    .file(this.object.attackEffect)
                    .atLocation(actorToken)
                    .stretchTo(this.object.target)
                    .play()
            }
        }
    }
}