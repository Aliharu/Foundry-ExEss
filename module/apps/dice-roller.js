import { EXALTEDESSENCE } from "../config.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export default class RollForm extends HandlebarsApplicationMixin(ApplicationV2) {
    constructor(actor, options, object, data) {
        super(options);
        this.object = {};
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
                this.object.poise = 0;
                this.object.doubleExtraSuccess = false;
                this.object.resolve = 0;
                this.object.successModifier = data.accuracy || 0;
                this.object.power = this.actor.system.power.value || 0;
                this.object.damageSuccesses = data.damage || 0;
                this.object.overwhelming = data.overwhelming || 0;
                this.object.conditions = (this.actor.token && this.actor.token.actor.effects) ? this.actor.token.actor.effects : [];
                this.object.weaponType = data.weaponType || 'melee';
                this.object.weaponWeight = data.weight || 'light';
                this.object.range = 'close';
                this.object.diceModifier = 0;
                this.object.triggerSelfDefensePenalty = 0;
                this.object.totalDice = 0;
                this.object.rollButtonTooltip = "";
                this.object.triggerMessages = [];

                this.object.unusedDiceRoll = null;
                this.object.unusedDiceRollDisplay = null;
                this.object.unusedDiceRollTotal = null;

                if (this._isAttackRoll()) {
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
            this.object.difficulty = 3;
            if (this.object.rollType === 'focusWill' && game.settings.get("exaltedessence", "powerfulSpells")) {
                this.object.difficulty++;
            }
            if (this._isAttackRoll() || this.object.rollType === "social" || this.object.rollType === "joinBattle") {
                this.object.difficulty = 0;
            }
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
            this.object.gambit = '';
            this.object.activateAura = '';
            this.object.addOppose = {
                addedBonus: {
                    dice: 0,
                    successes: 0,
                    defense: 0,
                    soak: 0,
                    resolve: 0,
                    hardness: 0,
                    poise: 0,
                    damage: 0,
                },
                manualBonus: {
                    dice: 0,
                    successes: 0,
                    defense: 0,
                    soak: 0,
                    resolve: 0,
                    hardness: 0,
                    poise: 0,
                    damage: 0,
                }
            };

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
                this.object.weaponTags = data.weapon.traits?.weapontags?.selected || {};
                var weaponAccuracy = data.weapon.accuracy || 0;
                this.object.damage.damageSuccessModifier = data.weapon.damage || 0;
                this.object.overwhelming = data.weapon.overwhelming || 0;
                if (this.actor.type === 'npc') {
                    if (this.actor.system.battlegroup) {
                        this.object.overwhelming = Math.min(this.actor.system.size.value + 1, 5);
                        if (game.settings.get("exaltedessence", "fearsomeSize")) {
                            this.object.damage.damageSuccessModifier = Math.max(this.actor.system.size.value, this.object.damage.damageSuccessModifier);
                        }
                    }
                }
                this.object.weaponType = data.weapon.weapontype || "melee";
                if (this.actor.type === 'character') {
                    if (this.object.weaponType === 'melee') {
                        this.object.ability = 'close';
                        this.object.range = 'close';
                    }
                    else {
                        this.object.ability = 'ranged';
                        this.object.short = 'close';
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
                        if (this.object.weaponTags['twohanded'] && this.object.weaponWeight === 'heavy') {
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

        if (this.object.addedCharms === undefined) {
            this.object.addedCharms = [];
        }
        if (this.object.opposingCharms === undefined) {
            this.object.opposingCharms = [];
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
            this.object.activateAura = '';
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
            this.object.gambit = '';
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
            if (this.actor?.system.dicemodifier.value) {
                this.object.diceModifier += this.actor.system.dicemodifier.value;
            }
            if (this.actor?.system.penaltymodifier.value) {
                this.object.diceModifier -= this.actor.system.penaltymodifier.value;
            }
            if (this.object.charmList === undefined) {
                this.object.charmList = this.actor.charms;
                if (this.actor.qualities?.length > 0) {
                    this.object.charmList['qualities'] = {
                        name: game.i18n.localize("ExEss.Qualities"),
                        list: this.actor.items.filter(quality => quality.type === 'quality'),
                        visible: true,
                        collapse: true,
                    }
                }
                if (this.actor.merits?.length > 0) {
                    this.object.charmList['merits'] = {
                        name: game.i18n.localize("ExEss.Merits"),
                        list: this.actor.items.filter(quality => quality.type === 'merit'),
                        visible: true,
                        collapse: true,
                    }
                }
                if (this.actor.items.filter(item => item.type === 'spell')) {
                    this.object.charmList['spells'] = {
                        name: game.i18n.localize("ExEss.Spells"),
                        list: this.actor.items.filter(spell => spell.type === 'spell'),
                        visible: true,
                        collapse: true,
                    }
                }
                if (this.actor.items.filter(item => item.type === 'item')) {
                    this.object.charmList['items'] = {
                        name: game.i18n.localize("ExEss.Items"),
                        list: this.actor.items.filter(spell => spell.type === 'item'),
                        visible: true,
                        collapse: true,
                    }
                }
                if (this.object.charmList) {
                    for (var charmlist of Object.values(this.object.charmList)) {
                        for (const charm of charmlist.list) {
                            this.getEnritchedHTML(charm);
                        }
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
                    { id: 'aim', name: game.i18n.localize("Aim"), added: false, show: this._isAttackRoll(), description: '+3 Dice, Cannot be used on the same turn as a reflexive move or flurry.', img: 'systems/exaltedessence/assets/icons/targeting.svg' },
                    { id: 'chopping', name: game.i18n.localize("ExEss.ChoppingPowerful"), added: false, show: false, description: game.settings.get("exaltedessence", "combatReforged") ? 'Reduce defense by 1.  Gain +1 Overwhelming on withering or increase threshold to restore Poise by 1 on a successful decisive attack' : `Reduce defense by 1. Increase dice by 2 on withering (+1 OVW in combat reforged).  -1 enemy hardness on decisive`, img: 'systems/exaltedessence/assets/icons/battered-axe.svg' },
                    { id: 'piercing', name: game.i18n.localize("ExEss.Piercing"), added: false, show: false, description: 'Reduce defense by 1.  Ignore 2 soak.', img: 'systems/exaltedessence/assets/icons/fast-arrow.svg' },
                    { id: 'rush', name: game.i18n.localize("ExEss.Rush"), added: false, show: this._isAttackRoll(), description: 'Special attack, move 1 range band closer and gain +3 dice on attack.', img: 'systems/exaltedessence/assets/icons/running-ninja.svg' },
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
                this.object.poise = this.object.target.actor.system.poise.value;

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
                        this.object.poise -= 1;
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
                    if (game.settings.get("exaltedessence", "combatReforged") && this.object.target.actor.effects.some(e => e.name === 'grappling')) {
                        this.object.defense -= 1;
                    }
                }
                if (this.object.woundPenalty && (game.settings.get("exaltedessence", "woundBonuses") || game.settings.get("exaltedessence", "combatReforged"))) {
                    this.object.defense -= this.object.target.actor.system.health.penalty;
                    this.object.soak -= this.object.target.actor.system.health.penalty;
                }
                if (this.object.defense < 0) {
                    this.object.defense = 0;
                }
            }
            for (var [ability, charmlist] of Object.entries(this.object.charmList)) {
                for (const charm of charmlist.list.filter(charm => (charm.system.active && this._autoAddCharm(charm)) || (charm.type === 'weapon' && data.weapon?.parent?.id === charm.id))) {
                    this.addCharm(charm);
                }
            }
            if (this.object.rollType !== 'useOpposingCharms') {
                this._preChatMessage();
            }
        }

    }

    static DEFAULT_OPTIONS = {
        window: {
            title: "Dice Roller",
            resizable: true,
            controls: [
                {
                    icon: 'fa-solid fa-dice-d6',
                    label: "Save Roll",
                    action: "saveRoll",
                }
            ]
        },
        position: { width: 730 },
        tag: "form",
        form: {
            handler: RollForm.myFormHandler,
            submitOnClose: false,
            submitOnChange: true,
            closeOnSubmit: false
        },
        classes: [`leaves-background`],
        actions: {
            saveRoll: RollForm.saveRoll,
            enableAddCharms: RollForm.enableAddCharms,
            triggerRemoveCharm: RollForm.triggerRemoveCharm,
            showGambitDialog: RollForm.showGambitDialog,
            triggerAddCharm: RollForm.triggerAddCharm,
            addSpecialAttack: RollForm.addSpecialAttack,
            removeSpecialAttack: RollForm.removeSpecialAttack,
            removeOpposingCharm: RollForm.removeOpposingCharm,
        },
    };

    static PARTS = {
        header: {
            template: "systems/exaltedessence/templates/dialogues/dice-roll/dice-roll-header.html",
        },
        tabs: { template: 'systems/exaltedessence/templates/dialogues/tabs.html' },
        dice: {
            template: "systems/exaltedessence/templates/dialogues/dice-roll/dice-tab.html",
        },
        damage: {
            template: "systems/exaltedessence/templates/dialogues/dice-roll/damage-tab.html",
        },
        social: {
            template: "systems/exaltedessence/templates/dialogues/dice-roll/social-tab.html",
        },
        cost: {
            template: "systems/exaltedessence/templates/dialogues/dice-roll/cost-tab.html",
        },
        charms: {
            template: "systems/exaltedessence/templates/dialogues/dice-roll/charms-tab.html",
        },
        footer: {
            template: "systems/exaltedessence/templates/dialogues/dice-roll/dice-roll-footer.html",
        },
    };

    _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        if (this.object.rollType === 'base') {
            options.parts = ['dice', 'footer'];
        }
        if (this.object.rollType === 'useOpposingCharms') {
            options.parts = ['header', 'tabs', 'dice', 'cost', 'charms', 'footer'];
            if (options.position) {
                options.position.height = 670;
            }
        }

    }

    static async myFormHandler(event, form, formData) {
        // Do things with the returned FormData
        const formObject = foundry.utils.expandObject(formData.object);
        const gambitChange = formObject.object.gambit !== undefined && this.object.gambit !== formObject.object.gambit;
        const excellencyTrue = (formObject.object.abilityExcellency === true && this.object.abilityExcellency === false) || (formObject.object.attributeExcellency === true && this.object.attributeExcellency === false);
        const excellencyFalse = (formObject.object.abilityExcellency === false && this.object.abilityExcellency === true) || (formObject.object.attributeExcellency === false && this.object.attributeExcellency === true);


        foundry.utils.mergeObject(this, formData.object);
        if (this.object.rollType !== "base") {
            if (gambitChange) {
                const gambitCosts = {
                    '': 0,
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
            }
            this._checkAttributeBonuses();
            this._checkExcellencyBonuses();

            if (this.actor.system.details.exalt !== 'solar' && (!game.settings.get("exaltedessence", "alternateAnima") || this.actor.system.anima.value < 3)) {
                if (excellencyTrue) {
                    this.object.cost.motes++;
                }

                if (excellencyFalse) {
                    this.object.cost.motes--;
                }
            }
        }

        if (event.type === 'submit') {
            if (this.object.rollType === 'useOpposingCharms') {
                await this.useOpposingCharms();
            } else {
                if (this._isAttackRoll()) {
                    if (this.object.showDamage) {
                        await this._damageRoll();
                        this.close();
                    } else {
                        await this._attackRoll();
                        this.tabGroups['primary'] = 'damage';
                    }
                } else {
                    await this._roll();
                    this.close(false);
                }
            }

        }
        this.render();
    }

    _onRender(context, options) {
        this.element.querySelectorAll('.collapsable').forEach(element => {
            element.addEventListener('click', (ev) => {
                const li = $(ev.currentTarget).next();
                if (li.attr('id')) {
                    this.object[li.attr('id')] = li.is(":hidden");
                }
                li.toggle("fast");
            });
        });

        this.element.querySelectorAll('.charm-list-collapsable').forEach(element => {
            element.addEventListener('click', (ev) => {
                const li = $(ev.currentTarget).next();
                if (li.attr('id')) {
                    this.object.charmList[li.attr('id')].collapse = !li.is(":hidden");
                }
                li.toggle("fast");
            });
        });
    }

    async _preChatMessage() {
        if (game.user.targets && game.user.targets.size > 0) {
            for (const target of Array.from(game.user.targets)) {
                const messageContent = await foundry.applications.handlebars.renderTemplate("systems/exaltedessence/templates/chat/targeting-card.html", {
                    actor: this.actor,
                    targetActor: target.actor,
                    imgUrl: CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.ability] || "systems/exaltedessence/assets/icons/d10.svg",
                    rollType: CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.ability] || "ExEss.Roll",
                });
                ChatMessage.create({
                    user: game.user.id,
                    content: messageContent,
                    style: CONST.CHAT_MESSAGE_STYLES.OTHER,
                    flags: {
                        "exaltedessence": {
                            targetActorId: target.actor.id,
                            targetTokenId: target.id,
                        }
                    },
                });
            }
        } else if (CONFIG.EXALTEDESSENCE.targetableRollTypes.includes(this.object.rollType)) {
            const messageContent = await foundry.applications.handlebars.renderTemplate("systems/exaltedessence/templates/chat/targeting-card.html", {
                actor: this.actor,
                targetActor: null,
                imgUrl: CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.ability] || "systems/exaltedessence/assets/icons/d10.svg",
                rollType: CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.ability] || "ExEss.Roll",
            });
            ChatMessage.create({
                user: game.user.id,
                content: messageContent,
                style: CONST.CHAT_MESSAGE_STYLES.OTHER,
                flags: {
                    "exaltedessence": {
                        targetActorId: null,
                        targetTokenId: null,
                    }
                },
            });
        } else if (game.settings.get("exaltedessence", "nonTargetRollCards")) {
            const messageContent = await foundry.applications.handlebars.renderTemplate("systems/exaltedessence/templates/chat/pre-roll-card.html", {
                actor: this.actor,
                imgUrl: CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.ability] || "systems/exaltedessence/assets/icons/d10.svg",
                rollType: CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.ability] || "ExEss.Roll",
            });
            ChatMessage.create({
                user: game.user.id,
                content: messageContent,
                style: CONST.CHAT_MESSAGE_STYLES.OTHER,
                flags: {
                    "exaltedessence": {
                        targetActorId: null,
                        targetTokenId: null,
                    }
                },
            });
        }
    }

    async _prepareContext(_options) {
        if (!this.tabGroups['primary']) this.tabGroups['primary'] = 'dice';
        this.selects = CONFIG.EXALTEDESSENCE.selects;
        const tabs = [
            {
                id: "dice",
                group: "primary",
                label: this._isAttackRoll() ? "ExEss.Accuracy" : "ExEss.Dice",
                cssClass: this.tabGroups['primary'] === 'dice' ? 'active' : '',
            },
        ];
        if (this._isAttackRoll()) {
            tabs.push({
                id: "damage",
                group: "primary",
                label: "ExEss.Damage",
                cssClass: this.tabGroups['primary'] === 'damage' ? 'active' : '',
            });
        }
        if (this.object.rollType === 'social') {
            tabs.push({
                id: "social",
                group: "primary",
                label: "ExEss.Social",
                cssClass: this.tabGroups['primary'] === 'social' ? 'active' : '',
            });
        }
        tabs.push({
            id: "cost",
            group: "primary",
            label: "ExEss.Cost",
            cssClass: this.tabGroups['primary'] === 'cost' ? 'active' : '',
        });
        tabs.push({
            id: "charms",
            group: "primary",
            label: "ExEss.Charms",
            cssClass: this.tabGroups['primary'] === 'charms' ? 'active' : '',
        });

        const penalties = [];
        const effects = [];
        const weaponTags = [];

        if (this.actor) {
            for (const condition of this.actor.allApplicableEffects()) {
                if (condition.statuses.has('prone')) {
                    penalties.push(
                        {
                            img: "icons/svg/falling.svg",
                            name: "ExEss.Prone",
                            summary: "-3 dice on attacks"
                        },
                    );
                } else {
                    effects.push(
                        {
                            img: condition.img,
                            name: condition.name,
                        },
                    );
                }
            }
            if (this.object.target?.actor.effects) {
                if (this.object.target.actor.effects.some(e => e.name === 'concealment')) {
                    penalties.push(
                        {
                            name: "Target has Concealment",
                            summary: "-2 dice on attack"
                        },
                    );
                }
                if (this.object.target.actor.effects.some(e => e.name === 'prone')) {
                    effects.push(
                        {
                            name: "Target is prone",
                            summary: "-2 Defense"
                        },
                    );
                }
                if (this.object.target.actor.effects.some(e => e.name === 'surprised')) {
                    effects.push(
                        {
                            name: "Target is Surprised",
                            summary: "-1 Defense"
                        },
                    );
                    if (game.settings.get("exaltedessence", "combatReforged")) {
                        effects.push(
                            {
                                name: "Target is Surprised",
                                summary: "-1 Poise"
                            },
                        );
                    }
                }
                if (this.object.target.actor.effects.some(e => e.name === 'lightcover')) {
                    if (this.object.weaponType !== 'melee') {
                        penalties.push(
                            {
                                name: "Target has light cover",
                                summary: "+1 Defense"
                            },
                        );
                    }
                }
                if (this.object.target.actor.effects.some(e => e.name === 'heavycover')) {
                    if (this.object.weaponType !== 'melee') {
                        penalties.push(
                            {
                                name: "Target has heavy cover",
                                summary: "+2 Defense"
                            },
                        );
                    }
                }
                if (game.settings.get("exaltedessence", "combatReforged") && this.object.target.actor.effects.some(e => e.name === 'grappling')) {
                    penalties.push(
                        {
                            name: "Target Is in a Grapple",
                            summary: "-1 Defense"
                        },
                    );
                }
            }
        }

        if (this.object.rollType !== 'base') {
            if (this.object.flurry) {
                penalties.push(
                    {
                        name: "ExEss.Flurry",
                        summary: "-3 Dice"
                    },
                );
            }

            if (this.object.woundPenalty) {
                if (game.settings.get("exaltedessence", "woundBonuses") || game.settings.get("exaltedessence", "combatReforged")) {
                    penalties.push(
                        {
                            name: "ExEss.WoundBonus",
                            summary: `${this.actor.system.health.penalty} Dice`
                        },
                    );
                } else {
                    penalties.push(
                        {
                            name: "ExEss.WoundPenalty",
                            summary: `${this.actor.system.health.penalty * -1} Dice`
                        },
                    );
                }

            }
            if (this._isAttackRoll() && game.settings.get("exaltedessence", "combatReforged")) {
                if (this.object.weaponType !== 'melee' && this.object.range === 'close') {
                    penalties.push(
                        {
                            name: "ExEss.RangePenalty",
                            summary: `-3 Dice`
                        },
                    );
                }
            }
            if (this.object.getimianflow) {
                effects.push(
                    {
                        name: "Getimian Flow Bonus",
                        summary: "+1 Success"
                    },
                );
            }

            if (this.actor?.type === 'character' && this.object.augmentattribute) {
                if (this.actor.system.attributes[this.object.attribute].value < 5) {
                    effects.push(
                        {
                            name: "Augment Attribute",
                            summary: "+1 Dice"
                        },
                    );
                }
                if (this.actor.system.essence.value > 1) {
                    effects.push(
                        {
                            name: "Augment Attribute",
                            summary: "Double 9s"
                        },
                    );
                }
            }

            if (this.actor?.type === 'npc' && this.actor.system.battlegroup) {
                if (this._isAttackRoll()) {
                    effects.push(
                        {
                            name: "Drill Bonus",
                            summary: `${this.actor.system.drill.value} Dice`,
                        },
                    );
                }
                if (this.object.rollType === 'withering') {
                    effects.push(
                        {
                            name: "Overwhelming from Size",
                            summary: Math.min(this.actor.system.size.value + 1, 5),
                        },
                    );
                }
                if (this.object.rollType === 'decisive') {
                    effects.push(
                        {
                            name: "Drill Damage Bonus",
                            summary: `${this.actor.system.drill.value} Dice`,
                        },
                    );
                }
                if (this.object.rollType === 'buildPower') {
                    effects.push(
                        {
                            name: "Drill Build Power Bonus",
                            summary: `${this.actor.system.drill.value} Successes`,
                        },
                    );
                }

            }

            if (this.object.armorPenalty) {
                let armorPenaltyDice = 0
                for (let armor of this.actor.armor) {
                    if (armor.system.equipped) {
                        armorPenaltyDice -= Math.abs(armor.system.penalty);
                    }
                }
                penalties.push(
                    {
                        name: "ExEss.ArmorPenalty",
                        summary: `${armorPenaltyDice} Dice`
                    },
                );
            }

            if (this.object.weaponTags) {
                if (this.object.rollType === 'decisive') {
                    if (this.object.weaponTags['twohanded']) {
                        weaponTags.push(
                            {
                                name: "ExEss.TwoHanded",
                                summary: `+1 Damage`
                            },
                        );
                    }
                }
                if (this.object.rollType === 'withering') {
                    if (this.object.weaponTags['balanced']) {
                        weaponTags.push(
                            {
                                name: "ExEss.Balanced",
                                summary: `+1 Overwhelming `
                            },
                        );
                    }
                    if (this.object.weaponTags['paired']) {
                        weaponTags.push(
                            {
                                name: "ExEss.Paired",
                                summary: `+1 Power Gained`
                            },
                        );
                    }
                }
                if (this.object.rollType === 'gambit') {
                    if (this.object.weaponTags['balanced']) {
                        weaponTags.push(
                            {
                                name: "ExEss.Balanced",
                                summary: `+1 Dice`
                            },
                        );
                    }
                }
                if (this.object.weaponTags['improvised']) {
                    weaponTags.push(
                        {
                            name: "ExEss.Improvised",
                            summary: `-2 Weapon Accuracy`
                        },
                    );
                }
            }
        }

        const totalOpposedBonuses = {
            dice: 0,
            successes: 0,
            defense: 0,
            soak: 0,
            hardness: 0,
            poise: 0,
            resolve: 0,
            guile: 0,
            damage: 0,
        }

        if (this.object.rollType === 'useOpposingCharms') {
            totalOpposedBonuses.defense = this.object.addOppose.manualBonus.defense + this.object.addOppose.addedBonus.defense;
            totalOpposedBonuses.soak = this.object.addOppose.manualBonus.soak + this.object.addOppose.addedBonus.soak;
            totalOpposedBonuses.resolve = this.object.addOppose.manualBonus.resolve + this.object.addOppose.addedBonus.resolve;
            totalOpposedBonuses.poise = this.object.addOppose.manualBonus.poise + this.object.addOppose.addedBonus.poise;
        }
        this.object.rollButtonTooltip = "";
        if (this.object.showDamage) {
            this.object.totalDice = await this._assembleDamagePool(true);
        } else {
            this.object.totalDice = await this._assembleDicePool(true);
        }

        let diceFooterLabel = `Roll ${this.object.totalDice} Dice`;
        if (this.object.rollType === 'useOpposingCharms' || (this.object.showDamage && (this.object.rollType !== 'decisive' || game.settings.get("exaltedessence", "fasterCombat")))) {
            diceFooterLabel = "Confirm Results";
        }

        const gambitList = CONFIG.EXALTEDESSENCE.gambits;
        if (game.settings.get("exaltedessence", "combatReforged")) {
            gambitList['grapple'] = 'ExEss.Grapple';
        }

        return {
            actor: this.actor,
            selects: this.selects,
            data: this.object,
            tab: this.tabGroups['primary'],
            tabs: tabs,
            isAttackRoll: this._isAttackRoll(),
            penalties: penalties,
            effects: effects,
            weaponTags: weaponTags,
            totalOpposedBonuses: totalOpposedBonuses,
            useCombatReforged: game.settings.get("exaltedessence", "combatReforged"),
            hardnessLabel: game.settings.get("exaltedessence", "combatReforged") ? game.i18n.localize("ExEss.Poise") : game.i18n.localize("ExEss.Hardness"),
            diceFooterLabel: diceFooterLabel,
            gambitList: gambitList,
            buttons: [
                { type: "submit", icon: "fa-solid fa-dice-d10", label: this.object.rollType === 'useOpposingCharms' ? "ExEss.Add" : "ExEss.Roll" },
                { action: "close", type: "button", icon: "fa-solid fa-xmark", label: "ExEss.Cancel" },
            ],
        };
    }

    async _preparePartContext(partId, context) {
        context.tab = context.tabs.find(item => item.id === partId);
        // if (this.object.addingCharms) {
        //     context.hideElement = (partId !== 'addCharms' ? 'hide-element' : '')
        // } else {
        //     context.hideElement = (partId === 'addCharms' ? 'hide-element' : '')
        // }
        return context;
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
                    this.saveRoll(this.object);
                },
            };
            buttons = [rollButton, ...buttons];
        }

        return buttons;
    }

    async getEnritchedHTML(charm) {
        charm.enritchedHTML = await foundry.applications.ux.TextEditor.enrichHTML(charm.system.description, { async: true, secrets: this.actor.isOwner, relativeTo: charm });
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

    static async saveRoll() {
        const rollData = { ...this.object };

        let html = await foundry.applications.handlebars.renderTemplate("systems/exaltedessence/templates/dialogues/save-roll.html", { 'name': this.object.name || 'New Roll' });

        new foundry.applications.api.DialogV2({
            window: { title: game.i18n.localize("ExEss.SaveRoll"), },
            content: html,
            classes: [`${game.settings.get("exaltedessence", "sheetStyle")}-background`],
            buttons: [{
                action: "save",
                label: game.i18n.localize("ExEss.Save"),
                default: true,
                callback: (event, button, dialog) => button.form.elements
            }, {
                action: "cancel",
                label: game.i18n.localize("ExEss.Cancel"),
                callback: (event, button, dialog) => false
            }],
            submit: result => {
                if (result && result.name?.value) {
                    let results = result.name.value;
                    let uniqueId = this.object.id || foundry.utils.randomID(16);
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
                }
            }
        }).render({ force: true });
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
            if (item.type === 'merit') {
                this.object.diceModifier += CONFIG.EXALTEDESSENCE.meritDiceBonuses[item.system.rating];
            }
            if (item.system.gain) {
                this.object.gain.motes += item.system.gain.motes;
                this.object.gain.anima += item.system.gain.anima;
                this.object.gain.health += item.system.gain.health;
                this.object.gain.power += item.system.gain.power;
            }
            if (item.system.cost) {
                this.object.cost.motes += item.system.cost.motes;
                if (!item.system.active) {
                    this.object.cost.committed += item.system.cost.committed;
                }
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
            }

            if (item.system.diceroller) {
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
                if (item.system.diceroller.damage.doubleextrasuccess) {
                    this.object.damage.doubleExtraSuccess = item.system.diceroller.damage.doubleextrasuccess;
                }
                if (item.system.diceroller.damage.ignoresoak > 0) {
                    this.object.damage.ignoreSoak += item.system.diceroller.damage.ignoresoak;
                }
                if (item.system.diceroller.activateaura) {
                    this.object.activateAura = item.system.diceroller.activateaura;
                }
                if (this.object.rollType === 'useOpposingCharms') {
                    this.object.addOppose.addedBonus.defense += item.system.diceroller.opposedbonuses.defense;
                    this.object.addOppose.addedBonus.soak += item.system.diceroller.opposedbonuses.soak;
                    this.object.addOppose.addedBonus.resolve += item.system.diceroller.opposedbonuses.resolve;
                    this.object.addOppose.addedBonus.poise += item.system.diceroller.opposedbonuses.hardness;
                }
            }
            await this._addBonuses(item, 'itemAdded', "benefit");

            this.render();
        }
    }


    _getHealthFormula(formula) {
        let numberValue = formula.replace(/[^0-9]/g, '');
        if (numberValue) {
            if (formula.includes('a')) {
                this.object.cost.healthaggravated += parseInt(numberValue);
            } else {
                this.object.cost.healthlethal += parseInt(numberValue);
            }
        }
    }


    _getFormulaValue(charmValue, overrideActor, item) {
        if (!charmValue || charmValue === "0") return 0;

        // Check for negative value notation and clean up
        let negativeValue = false;
        if (charmValue.startsWith('-(') && charmValue.endsWith(')')) {
            charmValue = charmValue.slice(2, -1); // Remove `-(...)`
            negativeValue = true;
        }

        // Helper function to evaluate a single operation
        const evaluate = (leftVar, operand, rightVar) => {
            switch (operand) {
                case '+': return leftVar + rightVar;
                case '-': return leftVar - rightVar;
                case '*': return leftVar * rightVar;
                case '/>': return Math.ceil(leftVar / rightVar);
                case '/<': return Math.floor(leftVar / rightVar);
                case '|': return Math.max(leftVar, rightVar);
                case 'cap': return Math.min(leftVar, rightVar);
                default: throw new Error(`Unknown operator: ${operand}`);
            }
        };

        // Helper function to parse values (operands)
        const parseValue = (token) => this._getActorFormulaValue(token.trim(), overrideActor, item);

        // Recursive function to evaluate expressions with parentheses and operations
        const evaluateExpression = (expression) => {
            // Match parentheses and solve inner expressions first
            while (expression.includes('(')) {
                expression = expression.replace(/\(([^()]+)\)/g, (_, inner) => evaluateExpression(inner));
            }

            // Split expression into tokens by operators, respecting order of operations
            const operators = [['*', '/>', '/<'], ['+', '-'], ['|', 'cap']]; // Order of precedence
            let tokens = expression.split(/(\s+)/).filter(token => token.trim() !== ''); // Split and filter whitespace

            for (const operatorGroup of operators) {
                let i = 0;
                while (i < tokens.length) {
                    const token = tokens[i];
                    if (operatorGroup.includes(token)) {
                        const leftVar = parseValue(tokens[i - 1]);
                        const rightVar = parseValue(tokens[i + 1]);
                        const result = evaluate(leftVar, token, rightVar);
                        tokens.splice(i - 1, 3, result.toString()); // Replace operation with result
                        i = i - 1; // Adjust index after splice
                    } else {
                        i++;
                    }
                }
            }

            return parseValue(tokens[0]);
        };

        // Evaluate the expression and apply the negative sign if necessary
        const rollerValue = evaluateExpression(charmValue);
        return negativeValue ? -rollerValue : rollerValue;
    }

    _getActorFormulaValue(formula, overrideActor = null, item = null) {
        let formulaVal = 0;
        let forumlaActor = this.actor;
        if (overrideActor) {
            forumlaActor = overrideActor;
        }
        if (parseInt(formula)) {
            return parseInt(formula);
        }
        if (formula?.toLowerCase() === 'thresholdsuccesses' || formula?.toLowerCase() === 'extrasuccesses') {
            return this.object.extraSuccesses || 0;
        }
        // if (formula?.toLowerCase() === 'damagedealt') {
        //     return this.object.damageLevelsDealt || 0;
        // }
        if (formula?.toLowerCase() === 'rollsuccesses') {
            return this.object.diceRollTotal || 0;
        }
        if (formula?.toLowerCase() === 'unuseddicerollsuccesses') {
            return this.object.unusedDiceRollTotal || 0;
        }
        if (formula?.toLowerCase() === 'gambitdifficulty') {
            return this.object.diceRollTotal || 0;
        }
        if (formula?.toLowerCase() === 'target-defense') {
            return this.object.defense || 0;
        }
        if (formula?.toLowerCase() === 'overwhelming') {
            return this.object.overwhelming || 0;
        }
        if (formula?.toLowerCase() === 'rangebands') {
            return {
                'close': 0,
                'short': 1,
                'medium': 2,
                'long': 3,
                'extreme': 4,
            }[this.object.range];
        }
        if (formula?.toLowerCase() === 'weaponaccuracy') {
            return this.object.weaponAccuracy || 0;
        }
        if (formula.includes('target-')) {
            formula = formula.replace('target-', '');
            if (this.object.target?.actor) {
                forumlaActor = this.object.target?.actor;
            }
            else {
                return 0;
            }
        }
        if (formula.includes('rerollfaces-')) {
            formula = formula.replace('rerollfaces-', '');
            let countRerolledDice = false;
            if (!parseInt(formula)) {
                return 0;
            }
            if (this.object.diceRoll) {
                return this.object.diceRoll.filter(die => die.rerolled && die.result === parseInt(formula)).length;
            } else {
                return 0;
            }
        }
        else if (formula.includes('rollfaces-')) {
            formula = formula.replace('rollfaces-', '');
            let countRerolledDice = false;
            if (formula.includes('-precedence')) {
                formula = formula.replace('-precedence', '');
                countRerolledDice = true;
            }
            if (!parseInt(formula)) {
                return 0;
            }
            if (this.object.diceRoll) {
                return this.object.diceRoll.filter(die => (countRerolledDice || ((!die.rerolled || die.result >= this.object.targetNumber) && !die.successCanceled)) && die.result === parseInt(formula)).length;
            } else {
                return 0;
            }
        }
        if (formula.includes('attacker-')) {
            formula = formula.replace('attacker-', '');
            if (this.object.rollType === 'useOpposingCharms') {
                if (this.object.attacker) {
                    forumlaActor = this.object.attacker;
                } else {
                    return 0;
                }
            } else {
                forumlaActor = this.actor;
            }
        }
        let negativeValue = false;
        if (formula.includes('-')) {
            formula = formula.replace('-', '');
            negativeValue = true;
        }
        if (forumlaActor.getRollData()[formula]?.value) {
            formulaVal = forumlaActor.getRollData()[formula]?.value;
        }
        if (negativeValue) {
            formulaVal *= -1;
        }
        return formulaVal;
    }

    async _addTriggerBonuses(type = 'beforeRoll') {
        if (!this.object.bonusesTriggered) {
            this.object.bonusesTriggered = {
                beforeRoll: false,
                afterRoll: false,
                beforeDefense: false,
                beforeDamageRoll: false,
                attackMissed: false,
                afterDamageRoll: false
            }
        }
        for (const charm of this.object.addedCharms) {
            await this._addBonuses(charm, type, "benefit");
        }
        for (const charm of this.object.opposingCharms) {
            await this._addBonuses(charm, type, "opposed");
        }
        // Triggers should only happen once, except for ones involving defense charms
        this.object.bonusesTriggered[type] = true;
    }

    async _addBonuses(charm, type, bonusType = "benefit") {
        if (!charm.system.triggers) {
            return;
        }
        const doublesChart = {
            '7': 'sevens',
            '8': 'eights',
            '9': 'nines',
            '10': 'tens',
        };
        let triggerHasBeenActivatedOnItem = false;
        for (const trigger of Object.values(charm.system.triggers.dicerollertriggers).filter(trigger => trigger.triggerTime === type)) {
            let triggerActor = charm.actor || this.actor;
            if (trigger.actorType === 'target') {
                if (this.object.rollType === 'useOpposingCharms') {
                    if (!this.object.attacker) {
                        continue;
                    }
                    triggerActor = this.object.attacker;
                } else if (bonusType === 'benefit') {
                    if (!this.object.target?.actor) {
                        continue;
                    }
                    triggerActor = this.object.target.actor;
                } else {
                    triggerActor = this.actor;
                }
            }
            try {
                if (await this._triggerRequirementsMet(charm, trigger, bonusType, 1, false, triggerHasBeenActivatedOnItem, triggerActor)) {
                    triggerHasBeenActivatedOnItem = true;
                    for (const bonus of Object.values(trigger.bonuses)) {
                        if ((type === 'itemAdded' || !this.object.bonusesTriggered[type] || ['defense', 'soak', 'hardness', 'resolve'].includes(bonus.effect))) {
                            let cleanedValue = bonus.value.toLowerCase().trim();
                            if (cleanedValue === 'true' || cleanedValue === 'false') {
                                cleanedValue = cleanedValue === "true";
                            }
                            if (cleanedValue === 'prompt') {
                                cleanedValue = await foundry.applications.api.DialogV2.prompt({
                                    window: { title: game.i18n.localize(charm.name) },
                                    content: `<div class="resource-label">Trigger: ${trigger.name}</div><label class="resource-label">Input value for: ${game.i18n.localize(CONFIG.EXALTEDESSENCE.numberBonusTypeLabels[bonus.effect])}</label><input name="promptValue" type="text" placeholder="Insert number or formula" autofocus>`,
                                    ok: {
                                        label: "Submit",
                                        callback: (event, button, dialog) => button.form.elements.promptValue.value
                                    }
                                });
                                cleanedValue = cleanedValue.toString().toLowerCase().trim();
                            }
                            if (cleanedValue === 'intimacy' || cleanedValue === '-intimacy') {
                                cleanedValue = await foundry.applications.api.DialogV2.wait({
                                    window: { title: game.i18n.localize("ExEss.Intimacy"), resizable: true },
                                    content: `Select intimacy bonus for ${charm.name}`,
                                    classes: [this.actor.getSheetBackground(), 'button-select-dialog'],
                                    modal: true,
                                    buttons: [
                                        {
                                            action: 'none',
                                            label: `${game.i18n.localize("ExEss.None")} (0)`,
                                            callback: (event, button, dialog) => `0`
                                        },
                                        {
                                            action: 'minor',
                                            label: `${game.i18n.localize("ExEss.Minor")} (${cleanedValue === '-intimacy' ? '-1' : '1'})`,
                                            callback: (event, button, dialog) => `${cleanedValue === '-intimacy' ? '-1' : '1'}`
                                        },
                                        {
                                            action: 'major',
                                            label: `${game.i18n.localize("ExEss.Major")} (${cleanedValue === '-intimacy' ? '-2' : '2'})`,
                                            callback: (event, button, dialog) => `${cleanedValue === '-intimacy' ? '-2' : '2'}`
                                        },
                                        {
                                            action: 'defining',
                                            label: `${game.i18n.localize("ExEss.Defining")} (${cleanedValue === '-intimacy' ? '-3' : '3'})`,
                                            callback: (event, button, dialog) => `${cleanedValue === '-intimacy' ? '-3' : '3'}`
                                        },
                                    ]
                                });
                            }
                            switch (bonus.effect) {
                                case 'diceModifier':
                                case 'nonCharmDiceModifier':
                                    if (this.object.rollType === 'useOpposingCharms') {
                                        // this.object.addOppose.addedBonus.dice += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    } else {
                                        this.object.diceModifier += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    }
                                    break;
                                case 'penaltyModifier':
                                case 'diceToSuccesses':
                                case 'rerollNumber':
                                case 'overwhelming':
                                    this.object[bonus.effect] += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    break;
                                case 'successModifier':
                                    if (this.object.diceRollTotal) {
                                        this.object.diceRollTotal += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    }
                                    this.object.successModifier += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    break;
                                case 'doubleSuccess':
                                    if (cleanedValue < this.object.doubleSuccess) {
                                        this.object.doubleSuccess = cleanedValue;
                                    }
                                    break;
                                case 'decreaseTargetNumber':
                                    this.object.targetNumber -= this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    break;
                                case 'rerollFailed':
                                case 'rollTwice':
                                    this.object[bonus.effect] = (typeof cleanedValue === "boolean" ? cleanedValue : true);
                                    break;
                                case 'activateAura':
                                    this.object[bonus.effect] = cleanedValue;
                                    break;
                                case 'damageDice':
                                case 'damageSuccessModifier':
                                    this.object.damage[bonus.effect] += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    break;
                                case 'rerollNumber-damage':
                                    this.object.damage.rerollNumber += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    break;
                                case 'doubleSuccess-damage':
                                    if (cleanedValue < this.object.damage.doubleSuccess) {
                                        this.object.damage.doubleSuccess = cleanedValue;
                                    }
                                    break;
                                case 'decreaseTargetNumber-damage':
                                    this.object.damage.targetNumber -= this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    break;
                                case 'rollTwice-damage':
                                    this.object.damage.rollTwice = (typeof cleanedValue === "boolean" ? cleanedValue : true);
                                    break;
                                case 'ignoreSoak':
                                    this.object.damage[bonus.effect] += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    break;
                                case 'doubleExtraSuccess-damage':
                                    this.object.damage.doubleExtraSuccess = (typeof cleanedValue === "boolean" ? cleanedValue : true);
                                    break;
                                case 'motes-spend':
                                case 'anima-spend':
                                case 'power-spend':
                                case 'stunt-spend':
                                    const spendKey = bonus.effect.replace('-spend', '');
                                    this.object.cost[spendKey] += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    break;
                                case 'health-spend':
                                    this._getHealthFormula(cleanedValue);
                                    break;
                                case 'motes-gain':
                                case 'health-gain':
                                case 'anima-gain':
                                case 'power-gain':
                                    const gainKey = bonus.effect.replace('-gain', '');
                                    this.object.gain[gainKey] += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    break;
                                case 'defense':
                                case 'soak':
                                case 'resolve':
                                case 'hardness':
                                    if (this.object.rollType === 'useOpposingCharms') {
                                        this.object.addOppose.addedBonus[bonus.effect] += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                    } else {
                                        this.object[bonus.effect] += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                        if (bonus.effect === 'hardness') {
                                            this.object.poise += this._getFormulaValue(cleanedValue, triggerActor, charm);
                                        }
                                    }
                                    break;
                                case 'setDamageType':
                                    this.object.damage.type = cleanedValue;
                                    break;
                                // case 'inflictStatus':
                                //     if (CONFIG.EXALTEDESSENCE.statusEffects.some(status => status.id === cleanedValue)) {
                                //         this._addStatusEffect(cleanedValue);
                                //     }
                                //     break;
                                case 'displayMessage':
                                    const getValue = (obj, path) => {
                                        return path.split('.').reduce((o, k) => o?.[k], obj);
                                    };

                                    const result = bonus.value.replace(/\${(.*?)}/g, (_, key) => {
                                        const value = getValue(this.object, key.trim());
                                        return value ?? `\${${key}}`;
                                    });
                                    // const result = bonus.value.replace(/\${(.*?)}/g, (_, key) => this.object[key.trim()] ?? `\${${key}}`);
                                    (this.object.triggerMessages || []).push(result);
                                    break;
                                case 'addSpecialAttack':
                                    this._enableSpecialAttack(bonus.value);
                                    break;
                            }
                        }
                    }
                }
            } catch (e) {
                ui.notifications.error(`<p>Error in Trigger:</p><pre>${trigger?.name || 'No Name Trigger'}</pre><p>See the console (F12) for details</p>`);
                console.error(e);
            }
        }
    }

    async _triggerRequirementsMet(charm, trigger, bonusType = "benefit", triggerAmountIndex, display, triggerHasBeenActivatedOnItem, triggerActor) {
        let fufillsRequirements = true;
        let opposingActor = this.object.target?.actor;
        if (bonusType === 'benefit' && this.object.rollType === 'useOpposingCharms') {
            opposingActor = this.object.attacker;
        }
        if (bonusType === 'opposed' && this.object.rollType !== 'useOpposingCharms') {
            opposingActor = this.actor;
        }

        for (const requirementObject of Object.values(trigger.requirements)) {
            if (!fufillsRequirements) {
                break;
            }
            let cleanedValue = requirementObject.value.toLowerCase().trim();
            if (cleanedValue === 'true' || cleanedValue === 'false') {
                cleanedValue = cleanedValue === "true";
            }
            switch (requirementObject.requirement) {
                case 'rollType':
                    if (requirementObject.value === 'abilityRoll') {
                        if (this.object.rollType === 'useOpposingCharms') {
                            fufillsRequirements = false;
                        }
                    }
                    else if (requirementObject.value === 'attack') {
                        if (!this._isAttackRoll()) {
                            fufillsRequirements = false;
                        }
                    }
                    else {
                        if (this.object.rollType.toLowerCase() !== requirementObject.value) {
                            fufillsRequirements = false;
                        }
                    }
                    break;
                case 'gambitType':
                    if (this.object.gambit === 'none' || this.object.gambit !== requirementObject.value) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'hasSpecialAttack':
                    if (!this.object.specialAttacksList.some(attack => attack.added && attack.id === requirementObject.value)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'ability':
                    if (this.actor.type === 'character' && this.object.ability !== requirementObject.value) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'attribute':
                    if (this.actor.type === 'character' && this.object.attribute !== requirementObject.value) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'formula':
                    if (!this._getBooleanFormulaValue(cleanedValue, bonusType === "opposed" ? triggerActor : null, charm)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'hasStatus':
                    if (cleanedValue === 'anycover') {
                        if (!triggerActor.effects.some(e => e.statuses.has('lightcover')) && !triggerActor.effects.some(e => e.statuses.has('heavycover'))) {
                            fufillsRequirements = false;
                        }
                    } else {
                        if (!triggerActor.effects.some(e => e.statuses.has(cleanedValue))) {
                            fufillsRequirements = false;
                        }
                    }
                    break;
                case 'isExalt':
                    if (this.actor?.system.details.exalt !== requirementObject.value) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'hasAura':
                    if (triggerActor.system.details.aura !== cleanedValue) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'hasNature':
                    if (triggerActor.system.details.nature !== cleanedValue) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'materialResonance':
                    if (!triggerActor.system.traits.resonance.value.includes(cleanedValue)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'isControlSpell':
                    if (charm?.type !== 'spell') {
                        fufillsRequirements = false;
                    } else if (charm.system.controlspell !== cleanedValue) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'booleanPrompt':
                    if (!display) {
                        const result = requirementObject.value.replace(/\${(.*?)}/g, (_, key) => this.object[key.trim()] || `\${${key}}`);
                        const value = await foundry.applications.api.DialogV2.confirm({
                            window: { title: game.i18n.localize('ExEss.Requirement') },
                            content: `<p>${result}</p>`,
                            classes: ["dialog", this.actor ? this.actor.getSheetBackground() : `${game.settings.get("exaltedessence", "sheetStyle")}-background`],
                            modal: true
                        });
                        if (!value) {
                            fufillsRequirements = false;
                        }
                    }
                    break;
                case 'upgradeActive':
                    if (!Object.values(charm.system.modes).some(mode => mode.id === requirementObject.value && mode.active)) {
                        fufillsRequirements = false;
                    }
                    break;
                case 'noTriggersActivated':
                    if (!(typeof cleanedValue === "boolean" ? cleanedValue : true) && !triggerHasBeenActivatedOnItem) {
                        fufillsRequirements = false;
                    }
                    if ((typeof cleanedValue === "boolean" ? cleanedValue : true) && triggerHasBeenActivatedOnItem) {
                        fufillsRequirements = false;
                    }
                    break;
            }
            if ((trigger.requirementMode || 'and') === 'or' && fufillsRequirements) {
                return true;
            }
        }
        return fufillsRequirements;
    }

    _getBooleanFormulaValue(charmValue, opposedCharmActor = null, item = null) {
        if (typeof charmValue === 'boolean') {
            return charmValue;
        }
        if (charmValue) {
            const operandRegex = /(==|!=|<=|>=|<|>)/;

            // Check if the operand exists in the string
            if (!operandRegex.test(charmValue)) {
                return false;
            }

            // Split the formula string based on operand
            const [leftOperand, operand, rightOperand] = charmValue.split(operandRegex);

            let leftVar = this._getFormulaValue(leftOperand.trim(), opposedCharmActor, item);
            let rightVar = this._getFormulaValue(rightOperand.trim(), opposedCharmActor, item);

            // Perform operation based on operand
            switch (operand) {
                case "==":
                    return leftVar == rightVar;
                case "!=":
                    return leftVar != rightVar;
                case "<=":
                    return leftVar <= rightVar;
                case ">=":
                    return leftVar >= rightVar;
                case "<":
                    return leftVar < rightVar;
                case ">":
                    return leftVar > rightVar;
                default:
                    console.log("Invalid Operator");
                    return false;
            }
        }
        return false;
    }


    async addOpposingCharm(charm) {
        if (this.object.rollType === 'useOpposingCharms') {
            this.addCharm(charm);
        } else {
            await this.addOpposedBonus(charm);
            this.render();
        }
    }

    async addOpposedBonus(charm) {
        const index = this.object.opposingCharms.findIndex(opposedCharm => charm._id === opposedCharm._id);
        if (index === -1) {
            this.object.opposingCharms.push(charm);
            if (this._isAttackRoll()) {
                this.object.defense += charm.system.diceroller.opposedbonuses.defense;
                this.object.soak += charm.system.diceroller.opposedbonuses.soak;
                this.object.hardness += charm.system.diceroller.opposedbonuses.hardness;
                this.object.poise += charm.system.diceroller.opposedbonuses.hardness;
            }
            if (this.object.rollType === 'social') {
                this.object.resolve += charm.system.diceroller.opposedbonuses.resolve;
            }
            this.render();
        }
    }

    async addMultiOpposedBonuses(data) {
        for (const charm of data.charmList) {
            charm.actor = data.actor;
            await this.addOpposedBonus(charm);
        }
        this.object.defense += data.defense;
        this.object.soak += data.soak;
        this.object.hardness += data.hardness;
        this.object.poise += data.hardness;
        if (this.object.rollType === 'social') {
            this.object.resolve += data.resolve;
        }
        this.render();
    }

    static addSpecialAttack(event, target) {
        event.stopPropagation();
        let li = target.closest(".item");
        this._enableSpecialAttack(li.dataset.itemId);
        this.render();
    }

    _enableSpecialAttack(id) {
        for (let specialAttack of this.object.specialAttacksList) {
            if (specialAttack.id === id) {
                specialAttack.added = true;
            }
        }
        if (id === 'rush' || id === 'aim') {
            this.object.diceModifier += 3;
        }
        else {
            if (id === 'chopping' && this.object.rollType === 'withering') {
                if (game.settings.get("exaltedessence", "combatReforged")) {
                    this.object.diceModifier += 2;
                } else {
                    this.object.overwhelming += 1;
                }
            }
            else if (id === 'piercing' && this.object.rollType === 'decisive') {
                this.object.damage.ignoreSoak += 2;
            }
            this.object.triggerSelfDefensePenalty += 1;
        }
    }

    static removeSpecialAttack(event, target) {
        event.stopPropagation();
        let li = target.closest(".item");
        let id = li.dataset.itemId;
        for (let specialAttack of this.object.specialAttacksList) {
            if (specialAttack.id === id) {
                specialAttack.added = false;
            }
        }
        if (id === 'rush' || id === 'aim') {
            this.object.diceModifier -= 3;
        }
        else {
            if (id === 'chopping' && this.object.rollType === 'withering') {
                if (game.settings.get("exaltedessence", "combatReforged")) {
                    this.object.diceModifier -= 2;
                } else {
                    this.object.overwhelming -= 1;
                }
            }
            else if (id === 'piercing' && this.object.rollType === 'decisive') {
                this.object.damage.ignoreSoak -= 2;
            }
            this.object.triggerSelfDefensePenalty = Math.max(0, this.object.triggerSelfDefensePenalty - 1);
        }
        this.render();
    }

    static enableAddCharms() {
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
    }

    static async showGambitDialog(event, target) {
        const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedessence/templates/dialogues/gambits.html");

        new foundry.applications.api.DialogV2({
            window: { title: game.i18n.localize("ExEss.Gambits"), resizable: true },
            content: html,
            position: {
                width: 650,
                height: 600
            },
            buttons: [{ action: 'close', label: game.i18n.localize("ExEss.Close") }],
            classes: ['exaltedessence-dialog', this.actor.getSheetBackground()],
        }).render(true);
    }

    static triggerAddCharm(event, target) {
        event.stopPropagation();
        let li = $(target).parents(".item");
        let item = this.actor.items.get(li.data("item-id"));
        this.addCharm(item);
    }

    static triggerRemoveCharm(event, target) {
        event.stopPropagation();
        let li = $(target).parents(".item");
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

            if (item.type === 'merit') {
                this.object.diceModifier -= CONFIG.EXALTEDESSENCE.meritDiceBonuses[item.system.rating];
            }
            if (item.system.gain) {
                this.object.gain.motes -= item.system.gain.motes;
                this.object.gain.anima -= item.system.gain.anima;
                this.object.gain.health -= item.system.gain.health;
                this.object.gain.power -= item.system.gain.power;
            }

            if (item.system.cost) {
                this.object.cost.motes -= item.system.cost.motes;
                if (!item.system.active) {
                    this.object.cost.committed -= item.system.cost.committed;
                }
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
            }

            if (item.system.diceroller) {
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
                if (item.system.diceroller.damage.doubleextrasuccess) {
                    this.object.damage.doubleExtraSuccess = false;
                }
                if (item.system.diceroller.damage.ignoresoak > 0) {
                    this.object.damage.ignoreSoak -= item.system.diceroller.damage.ignoresoak;
                }
                if (item.system.diceroller.activateaura === this.object.activateAura) {
                    this.object.activateAura = '';
                }
                if (this.object.rollType === 'useOpposingCharms') {
                    this.object.addOppose.addedBonus.defense -= item.system.diceroller.opposedbonuses.defense;
                    this.object.addOppose.addedBonus.soak -= item.system.diceroller.opposedbonuses.soak;
                    this.object.addOppose.addedBonus.hardness -= item.system.diceroller.opposedbonuses.hardness;
                    this.object.addOppose.addedBonus.poise -= item.system.diceroller.opposedbonuses.hardness;
                    this.object.addOppose.addedBonus.resolve -= item.system.diceroller.opposedbonuses.resolve;
                }
            }
        }
        this.render();
    }

    static async removeOpposingCharm(event, target) {
        event.stopPropagation();
        let li = $(target).parents(".item");
        let id = li.data("item-id");
        const charm = this.object.opposingCharms.find(opposedCharm => id === opposedCharm._id);
        const index = this.object.opposingCharms.findIndex(opposedCharm => id === opposedCharm._id);
        if (index > -1) {
            this.object.opposingCharms.splice(index, 1);
            if (this._isAttackRoll()) {
                this.object.defense -= charm.system.diceroller.opposedbonuses.defense;
                this.object.soak -= charm.system.diceroller.opposedbonuses.soak;
                this.object.hardness -= charm.system.diceroller.opposedbonuses.hardness;
                this.object.poise -= charm.system.diceroller.opposedbonuses.hardness;
            }
            if (this.object.rollType === 'social') {
                this.object.resolve -= charm.system.diceroller.opposedbonuses.resolve;
            }
            this.render();
        }
        this.render();
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on("change", "#gambit", ev => {
            const gambitCosts = {
                'none': 0,
                'grapple': 0,
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
                if (item.system.diceroller.damage.doubleextrasuccess) {
                    this.object.damage.doubleExtraSuccess = false;
                }
                if (item.system.diceroller.damage.ignoresoak > 0) {
                    this.object.damage.ignoreSoak -= item.system.diceroller.damage.ignoresoak;
                }
                if (item.system.diceroller.activateaura === this.object.activateAura) {
                    this.object.activateAura = '';
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
                    this.object.hardness -= charm.system.diceroller.opposedbonuses.hardness;
                    this.object.poise -= charm.system.diceroller.opposedbonuses.hardness;
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
            preBonusSuccesses: preBonusSuccesses,
            diceRoll: diceRoll,
        };
    }

    async _assembleDicePool(display) {
        let dicePool = 0;
        let rollButtonTooltip = "<h5>Dice</h5>";
        let totalPenalties = this.object.penaltyModifier;
        let totalIgnorePenalties = this.object.ignorePenalties;
        let rangeModifier = 0;

        if (this.object.rollType === 'base') {
            dicePool = this.object.dice;
            rollButtonTooltip += `<p>Base: ${dicePool}</p>`;
        }
        else {
            if (this.actor.type === 'character') {
                let attributeDice = this.actor.system.attributes[this.object.attribute].value;
                rollButtonTooltip += `<p>Attribute: ${attributeDice}</p>`;

                let abilityDice = this.actor.system.abilities[this.object.ability].value;
                rollButtonTooltip += `<p>Ability: ${abilityDice}</p>`;

                if (this.object.attributeExcellency) {
                    let excellencyDice = 0;
                    excellencyDice += Math.max(attributeDice, abilityDice);
                    if (this.object.augmentattribute) {
                        if (this.actor.system.attributes[this.object.attribute].value < 5) {
                            excellencyDice++;
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
                    rollButtonTooltip += `<p>Excellency: ${excellencyDice}</p>`;
                    attributeDice += excellencyDice;
                }
                if (this.object.abilityExcellency) {
                    rollButtonTooltip += `<p>Excellency: ${abilityDice}</p>`;
                    abilityDice = abilityDice * 2;
                }

                if (this.object.getimianflow) {
                    this.object.successModifier += 1;
                }

                dicePool = attributeDice + abilityDice;
            }
            else if (this.actor.type === 'npc') {
                let poolDice = this.actor.system.pools[this.object.pool].value;
                rollButtonTooltip += `<p>Base Pool: ${poolDice}</p>`;
                dicePool = poolDice;

                if (this.object.poolExcellency) {
                    if (this.object.pool === 'primary') {
                        dicePool += 4;
                        rollButtonTooltip += `<p>Excellency: 4</p>`;

                    }
                    else if (this.object.pool === 'secondary') {
                        dicePool += 3;
                        rollButtonTooltip += `<p>Excellency: 3</p>`;
                    }
                }

                if (this.actor.system.battlegroup && this._isAttackRoll()) {
                    dicePool += this.actor.system.drill.value;
                    rollButtonTooltip += `<p>Drill: ${this.actor.system.drill.value}</p>`;
                }
            }
            if (this.object.woundPenalty) {
                dicePool = dicePool + ((game.settings.get("exaltedessence", "woundBonuses") || game.settings.get("exaltedessence", "combatReforged")) ? (this.actor.system.health.penalty !== 'inc' ? this.actor.system.health.penalty : 2) : -(this.actor.system.health.penalty !== 'inc' ? this.actor.system.health.penalty : 2));
                rollButtonTooltip += `<p>Wounds: ${(this.actor.system.health.penalty !== 'inc' ? this.actor.system.health.penalty : 2) * ((game.settings.get("exaltedessence", "woundBonuses") || game.settings.get("exaltedessence", "combatReforged")) ? 1 : -1)}</p>`;
            }
            if (this._isAttackRoll() && game.settings.get("exaltedessence", "combatReforged")) {
                if (this.object.weaponType !== 'melee' && this.object.range === 'close') {
                    rollButtonTooltip += `<p>Range: -3</p>`
                }
                dicePool -= 3;
            }
            if (this.object.armorPenalty) {
                for (let armor of this.actor.armor) {
                    if (armor.system.equipped) {
                        dicePool -= Math.abs(armor.system.penalty);
                        rollButtonTooltip += `<p>Armor: ${armor.system.penalty}</p>`;
                    }
                }
            }
            if (this.object.stunt) {
                dicePool += 2;
                rollButtonTooltip += `<p>Stunt: 2</p>`;
            }
            if (this.object.flurry) {
                dicePool -= 3;
                rollButtonTooltip += `<p>Flurry: -3</p>`;
            }
            if (game.settings.get("exaltedessence", "combatReforged")) {

            }

            dicePool += this.object.diceModifier;
            rollButtonTooltip += `<p>Misc Dice: ${this.object.diceModifier}</p>`;
        }
        if (dicePool < 0) {
            dicePool = 0;
        }
        if (display) {
            this.object.rollButtonTooltip = rollButtonTooltip;
        }
        return dicePool;
    }

    async _assembleDamagePool(display) {
        let damageDicePool = 0;
        let rollButtonTooltip = "<h5>Damage Dice</h5>";

        if (this.object.rollType === 'decisive') {
            let postDefenseTotal = this.object.accuracyResult - this.object.defense;
            if (this.object.power) {
                damageDicePool += this.object.power;
                rollButtonTooltip += `<p>Power: ${this.object.power}</p>`;
            }
            if (postDefenseTotal > 0) {
                damageDicePool += postDefenseTotal;
                rollButtonTooltip += `<p>Extra Successes: ${postDefenseTotal}</p>`;
            }
            if (this.actor.type === 'npc' && this.actor.system.battlegroup) {
                damageDicePool += this.actor.system.drill.value;
                rollButtonTooltip += `<p>Drill: ${this.actor.system.drill.value}</p>`;
            }
            if (this.object.damage.damageDice) {
                damageDicePool += this.object.damage.damageDice;
                rollButtonTooltip += `<p>Misc: ${this.object.damage.damageDice}</p>`;
            }

            if (display) {
                this.object.rollButtonTooltip = rollButtonTooltip;
            }
        }
        return damageDicePool;
    }

    async _baseAbilityDieRoll() {
        await this._addTriggerBonuses('beforeRoll');

        let dice = await this._assembleDicePool(false);
        this.object.dice = dice;

        if (this.object.rollType === 'buildPower' && this.actor.type === 'npc' && this.actor.system.battlegroup) {
            this.object.successModifier += this.actor.system.drill.value;
        }

        let rollModifiers = {
            successModifier: this.object.successModifier,
            doubleSuccess: this.object.doubleSuccess,
            targetNumber: this.object.targetNumber,
            reroll: this.object.reroll,
            rerollFailed: this.object.rerollFailed,
            rerollNumber: this.object.rerollNumber,
        }

        const diceRollResults = await this._calculateRoll(dice, rollModifiers);
        this.object.roll = diceRollResults.roll;
        this.object.diceDisplay = diceRollResults.diceDisplay;
        this.object.diceRollTotal = diceRollResults.total;
        this.object.preBonusSuccesses = diceRollResults.preBonusSuccesses;
        let diceRoll = diceRollResults.diceRoll;

        if (this.object.rollTwice || this.object.rollTwiceLowest) {
            if (this.object.rollTwice && !this.object.rollTwiceLowest) {
                const secondRoll = await this._calculateRoll(dice, rollModifiers);
                if (secondRoll.total > diceRollResults.total) {
                    this.object.roll = secondRoll.roll;
                    this.object.diceDisplay = secondRoll.diceDisplay;
                    this.object.diceRollTotal = secondRoll.total;

                    this.object.unusedDiceRoll = diceRollResults.roll;
                    this.object.unusedDiceRollDisplay = diceRollResults.diceDisplay;
                    this.object.unusedDiceRollTotal = diceRollResults.total;
                    diceRoll = secondRoll.diceRoll;
                } else {
                    this.object.unusedDiceRoll = secondRoll.roll;
                    this.object.unusedDiceRollDisplay = secondRoll.diceDisplay;
                    this.object.unusedDiceRollTotal = secondRoll.total;
                }
            } else if (this.object.rollTwiceLowest && !this.object.rollTwice) {
                const secondRoll = await this._calculateRoll(dice, rollModifiers);
                if (secondRoll.total < diceRollResults.total) {
                    this.object.roll = secondRoll.roll;
                    this.object.diceDisplay = secondRoll.diceDisplay;
                    this.object.diceRollTotal = secondRoll.total;

                    this.object.unusedDiceRoll = diceRollResults.roll;
                    this.object.unusedDiceRollDisplay = diceRollResults.diceDisplay;
                    this.object.unusedDiceRollTotal = diceRollResults.total;
                    diceRoll = secondRoll.diceRoll;
                } else {
                    this.object.unusedDiceRoll = secondRoll.roll;
                    this.object.unusedDiceRollDisplay = secondRoll.diceDisplay;
                    this.object.unusedDiceRollTotal = secondRoll.total;
                }
            }
        }
        this.object.roll.dice[0].options.rollOrder = 1;

        await this._addTriggerBonuses('afterRoll');
        if (this.object.rollType !== 'base' && !this._isAttackRoll()) {
            this._updateRollerResources();
        }
        console.log(this.object);
    }

    async _abilityRoll() {
        await this._baseAbilityDieRoll();

        let resourceResult = ``;
        let difficultyResult = ``;
        let postDifficultyTotal = this.object.diceRollTotal - this.object.difficulty;
        this.object.extraSuccesses = Math.max(0, postDifficultyTotal);
        if (this.object.rollType === 'buildPower' || this.object.rollType === 'focusWill') {
            resourceResult = this._buildResource(postDifficultyTotal);
        }
        if (this.object.rollType === 'social') {
            resourceResult = this._socialInfluence();
        }
        if (this.object.rollType === "joinBattle") {
            let combat = game.combat;
            if (combat) {
                let combatant = this._getActorCombatant();
                if (combatant) {
                    combat.setInitiative(combatant.id, this.object.diceRollTotal);
                }
            }
        }
        if (postDifficultyTotal < 0) {
            difficultyResult += `<h4 class="dice-total">Roll Failed</h4>`;
        } else {
            difficultyResult += `<h4 class="dice-total">${postDifficultyTotal} Extra Successes</h4>`;
        }
        let theContent = `
              <div><div class="dice-roll">
                      <div class="dice-result">
                          <h4 class="dice-total">${this.object.dice} Dice + ${this.object.successModifier} ${this.object.successModifier === 1 ? "success" : "successes"}</h4>
                          <div class="dice-tooltip">
                            ${this._getDiceDisplay()}
                          </div>
                          <h4 class="dice-total">${this.object.diceRollTotal} Successes ${this.object.difficulty ? `vs Difficulty ${this.object.difficulty}` : ''}</h4>
                          ${difficultyResult}
                          ${resourceResult}
                      </div>
                  </div>
              </div>`
        await this._createChatMessageContent(theContent, 'Dice Roll', [this.object.roll]);
    }

    _buildResource(postDifficultyTotal) {
        let self = (this.object.buildPowerTarget || 'self') === 'self';

        var message = '';
        if (postDifficultyTotal < 0) {
            if (this.object.rollType === 'buildPower') {
                message = `<h4 class="dice-total">Build Power Failed</h4>`;
            }
            else if (this.object.rollType === 'focusWill') {
                message = `<h4 class="dice-total">Focus Will Failed</h4>`;
            }
        }
        else {
            let extraPower = ``;
            let powerGained = postDifficultyTotal + 1;
            if (self) {
                const actorData = foundry.utils.duplicate(this.actor);
                if (game.settings.get("exaltedessence", "combatReforged") && this.actor.effects.some(e => e.statuses.has('break'))) {
                    powerGained = Math.max(0, powerGained - (actorData.system.poise.max - actorData.system.poise.value));
                }
                if (this.object.rollType === 'buildPower') {
                    if (powerGained + actorData.system.power.value > 10) {
                        const extraPowerValue = Math.floor((powerGained + actorData.system.power.value - 10));
                        extraPower = `<h4 class="dice-total">${extraPowerValue} Extra Power!</h4>`;
                    }
                    // actorData.system.power.value = Math.min(10, total + actorData.system.power.value + 1);
                    this._updateCharacterPower(actorData, postDifficultyTotal + 1);
                }
                else {
                    actorData.system.will.value = Math.min(10, postDifficultyTotal + actorData.system.will.value + 1);
                }
                this.actor.update(actorData);
            }
            else {
                this.object.updateTargetActorData = true;
                if (this.object.rollType === 'buildPower') {
                    if (game.settings.get("exaltedessence", "combatReforged") && this.object.newTargetData.effects.some(e => e.statuses.includes('break'))) {
                        powerGained = Math.max(0, powerGained - (this.object.newTargetData.system.poise.max - this.object.newTargetData.system.poise.value));
                    }
                    if (powerGained + this.object.newTargetData.system.power.value > 10) {
                        const extraPowerValue = Math.floor((powerGained + this.object.newTargetData.system.power.value - 10));
                        extraPower = `<h4 class="dice-total">${extraPowerValue} Extra Power!</h4>`;
                    }
                    // this.object.newTargetData.system.power.value = Math.min(10, total + this.object.newTargetData.system.power.value + 1);
                    this._updateCharacterPower(this.object.newTargetData, postDifficultyTotal + 1, true);
                }
                else {
                    this.object.newTargetData.system.will.value = Math.min(10, postDifficultyTotal + this.object.newTargetData.system.will.value + 1);
                }
            }
            if (this.object.rollType === 'buildPower') {
                message = `<h4 class="dice-total">${postDifficultyTotal + 1} Power Built!</h4> ${extraPower}`;
            }
            else if (this.object.rollType === 'focusWill') {
                message = `<h4 class="dice-total">${postDifficultyTotal + 1} Will Focused!</h4>`;
            }
        }
        return message;
    }

    _autoAddCharm(charm) {
        if (!charm.system.autoaddtorolls) {
            return false;
        }
        switch (charm.system.autoaddtorolls) {
            case 'action':
                return (this.object.rollType !== 'useOpposingCharms');
            case 'attacks':
                return this._isAttackRoll();
            case 'opposedRolls':
                return (this.object.rollType === 'useOpposingCharms');
            case 'sameAbility':
                return (charm.type === 'charm' || charm.type === 'merit') && (charm.system.ability === this.object.ability || charm.system.ability === this.object.attribute);
        }
        if (this.object.rollType === charm.system.autoaddtorolls) {
            return true;
        }
        return false;
    }

    _socialInfluence() {
        this.object.resolve = Math.max(1, this.object.resolve + parseInt(this.object.opposedIntimacy) + parseInt(this.object.opposedVirtue) - parseInt(this.object.supportedIntimacy) - parseInt(this.object.supportedVirtue));
        this.object.extraSuccesses = Math.max(0, this.object.diceRollTotal - this.object.resolve);
        let message = '';
        if (this.object.diceRollTotal < this.object.resolve) {
            message = `<h4 class="dice-total">${this.object.diceRollTotal} Successes vs ${this.object.resolve} Resolve</h4><h4 class="dice-total">Influence Failed</h4>`;
        }
        else {
            let total = this.object.diceRollTotal - this.object.resolve;
            message = `<h4 class="dice-total">${this.object.diceRollTotal} Successes vs ${this.object.resolve} Resolve</h4> <h4 class="dice-total">${total} Extra Successes!</h4>`;
        }
        return message;
    }

    async _attackRoll() {
        await this._baseAbilityDieRoll();
        let messageContent = `
              <div>
                  <div class="dice-roll">
                      <div class="dice-result">
                          <h4 class="dice-total">${this.object.dice} Dice + ${this.object.successModifier} successes</h4>
                          <div class="dice-tooltip">
                            ${this._getDiceDisplay()}
                          </div>
                          <h4 class="dice-total">${this.object.diceRollTotal} Successes</h4>
                      </div>
                  </div>
              </div>`;
        await this._createChatMessageContent(messageContent, 'Dice Roll', [this.object.roll]);
        this.object.showDamage = true;
        this.object.accuracyResult = this.object.diceRollTotal;
        this.render();
    }

    async _damageRoll() {
        const actorData = foundry.utils.duplicate(this.actor);
        let postDefenseTotal = this.object.accuracyResult - this.object.defense;

        let title = "Decisive Attack";
        if (this.object.rollType === 'withering') {
            title = "Withering Attack";
        }
        if (this.object.rollType === 'gambit') {
            title = "Gambit";
        }
        if (this.object.damage.doubleExtraSuccess) {
            let basePostDefenseTotal = this.object.preBonusSuccesses - this.object.defense;
            if (basePostDefenseTotal > 0) {
                postDefenseTotal += basePostDefenseTotal;
            }
        }
        this.object.extraSuccesses = Math.max(0, postDefenseTotal);
        await this._addTriggerBonuses('beforeDamageRoll');
        let messageContent = '';
        let combatReforgedMessage = '';
        if (this.object.target && this.object.rollType === 'withering' && game.settings.get("exaltedessence", "combatReforged")) {
            combatReforgedMessage += `<h4 class="dice-total">${postDefenseTotal} Extra Successes vs ${this.object.poise} Poise</h4>`;
            const targetBroken = this._updateTargetPoise(postDefenseTotal);
            if (targetBroken) {
                combatReforgedMessage += '<h4 class="dice-total">Target Broken</h4>';
            } else {
                combatReforgedMessage += `<h4 class="dice-total">${this.object.overwhelming} Poise Damage</h4>`;
            }
        }

        if (postDefenseTotal < 0) {
            let overwhlemingMessage = '';
            let extraPowerMessage = ``;
            if (this.object.rollType === 'withering') {
                if (!game.settings.get("exaltedessence", "combatReforged")) {
                    overwhlemingMessage = `<h4 class="dice-total">${this.object.overwhelming} Power Built!</h4>`;
                    actorData.system.power.value = Math.min(10, this.object.overwhelming + actorData.system.power.value);
                    if (this.object.overwhelming + actorData.system.power.value > 10) {
                        const extraPowerValue = Math.floor((this.object.overwhelming + actorData.system.power.value - 10));
                        extraPowerMessage = `<h4 class="dice-total">${extraPowerValue} Extra Power!</h4>`;
                    }
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
                              <h4 class="dice-total">${this.object.accuracyResult} Successes</h4>
                              <h4 class="dice-total">${this.object.defense} defense</h4>
                              ${this.object.rollType === 'withering' ? `<h4 class="dice-total">${this.object.overwhelming} Overwhelming</h4>` : ``}
                              <h4 class="dice-total">Attack Missed!</h4>
                              ${overwhlemingMessage}
                              ${extraPowerMessage}
                          </div>
                      </div>
                  </div>`;
            await this._createChatMessageContent(messageContent, 'Dice Roll');
        }
        else {
            if (this.object.rollType === 'decisive') {
                let rolledDamageSuccesses = 0;
                let diceRollResults = null;
                let damageDicePool = await this._assembleDamagePool(false);
                if (game.settings.get("exaltedessence", "fasterCombat")) {
                    rolledDamageSuccesses = damageDicePool + this.object.damage.damageSuccessModifier;
                } else {
                    // Deal Damage
                    let rollModifiers = {
                        successModifier: this.object.damage.damageSuccessModifier,
                        doubleSuccess: this.object.damage.doubleSuccess,
                        targetNumber: this.object.damage.targetNumber,
                        reroll: this.object.damage.reroll,
                        rerollFailed: this.object.damage.rerollFailed,
                        rerollNumber: this.object.damage.rerollNumber,
                        preRollMacros: [],
                        macros: [],
                    }
                    diceRollResults = await this._calculateRoll(damageDicePool, rollModifiers);
                    if (this.object.damage.rollTwice) {
                        const secondRoll = await this._calculateRoll(damageDicePool, rollModifiers);
                        if (secondRoll.total > diceRollResults.total) {
                            diceRollResults = secondRoll;
                        }
                    }
                    rolledDamageSuccesses = diceRollResults.total;
                }

                let damageTotal = Math.max(0, rolledDamageSuccesses - Math.max(0, this.object.soak - this.object.damage.ignoreSoak));
                actorData.system.power.value = Math.max(0, actorData.system.power.value - this.object.power);
                if (game.settings.get("exaltedessence", "fearsomeSize") && this.actor.system.battlegroup) {
                    actorData.system.power.value = Math.max(this.actor.system.size.value, actorData.system.power.value);
                }

                this.actor.update(actorData);
                if (damageTotal > 0) {
                    this._dealHealthDamage(damageTotal);
                    if (game.settings.get("exaltedessence", "calculateOnslaught")) {
                        this._removeOnslaught();
                    }
                } else if (game.settings.get("exaltedessence", "wearingDownFoes")) {
                    this._addOnslaught(rolledDamageSuccesses, 'wearingDown');
                }

                messageContent = `
                    <div>
                        <div class="dice-roll">
                            <div class="dice-result">
                                <h4 class="dice-total">${this.object.accuracyResult} Successes vs ${this.object.defense} Defense</h4>
                                <h4 class="dice-total">${postDefenseTotal} Extra Successes + ${this.object.power} Power</h4>
                                ${damageDicePool ? `<h4 class="dice-total">${damageDicePool + this.object.damage.damageSuccessModifier} Damage</h4>` : `<h4 class="dice-total">${damageDicePool} Damage Dice + ${this.object.damage.damageSuccessModifier} Successes </h4>`}
                                <div class="dice-tooltip">
                                  ${diceRollResults ? `<div class="dice">
                                      <ol class="dice-rolls">${diceRollResults.diceDisplay}</ol>
                                  </div>
                                </div>` : ''}
                                <h4 class="dice-total">${rolledDamageSuccesses} Damage - ${this.object.soak} Soak ${this.object.damage.ignoreSoak ? `(Ignore ${this.object.damage.ignoreSoak})` : ''}</h4>
                                <h4 class="dice-total">${damageTotal} Total Damage</h4>
                            </div>
                        </div>
                    </div>`
                await this._createChatMessageContent(messageContent, 'Decisive Damage', diceRollResults ? [diceRollResults.roll] : []);
            }
            else if (this.object.rollType === 'withering') {
                let powerGained = postDefenseTotal + this.object.bonusPower + 1;
                if (postDefenseTotal < this.object.overwhelming && !game.settings.get("exaltedessence", "combatReforged")) {
                    powerGained = this.object.overwhelming + 1;
                }
                let extraPowerMessage = ``;
                if (game.settings.get("exaltedessence", "combatReforged")) {
                    if (game.settings.get("exaltedessence", "combatReforged") && this.actor.effects.find(e => e.statuses.has('break'))) {
                        powerGained = Math.max(0, powerGained - (actorData.system.poise.max - actorData.system.poise.value));
                    }
                }
                if (powerGained + actorData.system.power.value > 10) {
                    const extraPowerValue = Math.floor((powerGained + actorData.system.power.value - 10));
                    extraPowerMessage = `<h4 class="dice-total">${extraPowerValue} Extra Power!</h4>`;
                }
                // actorData.system.power.value = Math.min(10, powerGained + actorData.system.power.value);
                this._updateCharacterPower(actorData, powerGained);
                this.actor.update(actorData);
                messageContent = `
                      <div>
                          <div class="dice-roll">
                              <div class="dice-result">
                                  <h4 class="dice-total">${this.object.accuracyResult} Successes vs ${this.object.defense} defense</h4>
                                  ${this.object.bonusPower ? `<h4 class="dice-total">${this.object.bonusPower} Bonus Power</h4>` : ''}
                                  <h4 class="dice-total">1 Base + ${postDefenseTotal} Extra Successes</h4>
                                  <h4 class="dice-total">${this.object.overwhelming} Overwhelming</h4>
                                  ${combatReforgedMessage}
                                  <h4 class="dice-total">${powerGained} Power Built!</h4>
                                  ${extraPowerMessage}
                              </div>
                          </div>
                      </div>`
                await this._createChatMessageContent(messageContent, 'Decisive Damage');
                if (this.object.target) {
                    if (game.settings.get("exaltedessence", "combatReforged")) {
                        this._updateTargetPoise(postDefenseTotal);
                    }
                    else if (game.settings.get("exaltedessence", "calculateOnslaught")) {
                        if (game.settings.get("exaltedessence", "wearingDownFoes")) {
                            this._addOnslaught(postDefenseTotal + 1, 'wearingDown');
                        } else {
                            this._addOnslaught(1);
                        }
                    }
                }
            }
            else if (this.object.rollType === 'gambit') {
                actorData.system.power.value = Math.max(0, actorData.system.power.value - this.object.powerSpent);
                this.actor.update(actorData);
                messageContent = `
                      <div>
                          <div class="dice-roll">
                              <div class="dice-result">
                                <h4 class="dice-total">${this.object.accuracyResult} Successes vs ${this.object.defense} defense</h4>
                                  <h4 class="dice-total">${this.object.powerSpent} Power Spent</h4>
                                  <h4 class="dice-total">Gambit Successful!</h4>
                              </div>
                          </div>
                      </div>`
                await this._createChatMessageContent(messageContent, 'Withering Power');
            }
        }
        if (postDefenseTotal >= 0 && this.object.target) {
            if (this.object.gambit) {
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
                changes.name = `${game.i18n.localize("ExEss.DefensePenalty")} (${changes[1].value - 1})`;
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
                    name: `${game.i18n.localize("ExEss.DefensePenalty")} (-1)`,
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
        this._updateRollerResources();
        this.attackSequence();
    }

    _addOnslaught(number = 1, type = 'core') {
        this.object.updateTargetActorData = true;
        const onslaught = this.object.newTargetData.effects.find(i => i.flags.exaltedessence?.statusId == "onslaught");
        if (type === 'core') {
            if (onslaught?.system?.changes) {
                onslaught.name = `${game.i18n.localize("ExEss.ConcentratedAttacks")} (${onslaught.system.changes[0].value - number})`;
                onslaught.system.changes[0].value = onslaught.system.changes[0].value - number;
            }
            else {
                this.object.newTargetData.effects.push({
                    name: game.i18n.localize("ExEss.ConcentratedAttacks"),
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
                    system: {
                        changes: [
                            {
                                "key": "system.hardness.value",
                                "value": 0,
                                "mode": 2
                            }
                        ]
                    }
                });
            }
        } else {
            if (onslaught?.system?.changes) {
                onslaught.name = `${game.i18n.localize("ExEss.WearingDown")} (${onslaught.system.changes[0].value - number})`;
                onslaught.system.changes[0].value = onslaught.system.changes[0].value - number;
                onslaught.system.changes[1].value = onslaught.system.changes[1].value - number;
            } else {
                this.object.newTargetData.effects.push({
                    name: `${game.i18n.localize("ExEss.WearingDown")} (${number})`,
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
                    system: {
                        changes: [
                            {
                                "key": "system.hardness.value",
                                "value": number * -1,
                                "mode": 2
                            },
                            {
                                "key": "system.soak.value",
                                "value": number * -1,
                                "mode": 2
                            }
                        ]
                    }
                });
            }
        }
    }

    async _createChatMessageContent(content, cardName = 'Roll', rollArray = [], flags={}) {
        const messageData = {
            name: cardName,
            rollTypeImgUrl: CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetImages[this.object.ability] || "systems/exaltedessence/assets/icons/d10.svg",
            rollTypeLabel: CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.rollType] || CONFIG.EXALTEDESSENCE.rollTypeTargetLabels[this.object.ability] || "ExEss.Roll",
            messageContent: content,
            rollData: this.object,
            rollingActor: this.actor,
        }
        let chatMessageContents = await foundry.applications.handlebars.renderTemplate("systems/exaltedessence/templates/chat/roll-card.html", messageData);
        const chatMessage = ChatMessage.applyMode(
            { user: game.user.id, speaker: this.actor !== null ? ChatMessage.getSpeaker({ actor: this.actor }) : {}, content: chatMessageContents, style: CONST.CHAT_MESSAGE_STYLES.OTHER, rolls: rollArray, flags: flags },
            game.settings.get('core', 'messageMode')
        );
        ChatMessage.create(chatMessage);
    }

    _removeOnslaught() {
        if (this.object.target) {
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
            case 'distract':
                this._addEndofRoundDefensePenalty(postDefenseTotal + 1);
                break;
        }
    }

    _updateTargetPoise(postDefenseTotal) {
        this.object.updateTargetActorData = true;
        if (this.object.poise <= postDefenseTotal) {
            this.object.newTargetData.system.poise.value = 0;
            this.object.addStatuses.push('break');
            return true;
        }
        else {
            if (!this.object.target.actor.effects.find(e => e.statuses.has('break'))) {
                this.object.newTargetData.system.poise.value -= Math.max(0, this.object.newTargetData.system.poise.value - this.object.overwhelming);
            }
        }
        return false;
    }

    _updateCharacterPower(actorData, powerChange) {
        let finalPowerUpdate = powerChange;
        if (game.settings.get("exaltedessence", "combatReforged")) {
            if (actorData.effects.some(e => e.statuses.includes('break'))) {
                finalPowerUpdate = Math.max(0, finalPowerUpdate - (actorData.system.poise.max - actorData.system.poise.value));
                actorData.system.poise.value = Math.min(actorData.system.poise.value + powerChange, actorData.system.poise.max);
            }
        }
        actorData.system.power.value = Math.min(10, actorData.system.power.value + finalPowerUpdate);
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
            name: `Defense Penalty (${value * -1})`,
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
                    await this.object.target.actor.toggleStatusEffect(status);
                }
            }
            if (this.object.target.actor.effects.find(e => e.statuses.has('break') && this.object.newTargetData.system.poise.value >= this.object.newTargetData.system.poise.max)) {
                await this.object.target.actor.toggleStatusEffect('break');
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

    _getDiceDisplay() {
        return `
            <div class="dice">
                <ol class="dice-rolls">${this.object.diceDisplay}</ol>
            </div>
            ${this.object.unusedDiceRollDisplay ? `<div class="flex-center resource-label">Unused Roll</div><div class="dice">
                <ol class="dice-rolls">${this.object.unusedDiceRollDisplay}</ol>
            </div>` : ''}`
    }

    async useOpposingCharms() {
        const addingCharms = [];
        for (const charm of this.object.addedCharms) {
            const newCharm = foundry.utils.duplicate(charm);
            newCharm.timesAdded = charm.timesAdded;
            addingCharms.push(newCharm);
        }
        const data = {
            charmList: addingCharms,
            dice: this.object.addOppose.manualBonus.dice,
            successes: this.object.addOppose.manualBonus.successes,
            defense: this.object.addOppose.manualBonus.defense,
            soak: this.object.addOppose.manualBonus.soak,
            resolve: this.object.addOppose.manualBonus.resolve,
            poise: this.object.addOppose.manualBonus.poise,
            hardness: this.object.addOppose.manualBonus.hardness,
            damage: this.object.addOppose.manualBonus.damage,
        }

        if (game.rollForm) {
            data.actor = this.actor;
            await game.rollForm.addMultiOpposedBonuses(data);
        }

        game.socket.emit('system.exaltedessence', {
            type: 'addMultiOpposingCharms',
            data: data,
            actorId: this.actor._id,
        });
        const messageContent = await foundry.applications.handlebars.renderTemplate("systems/exaltedessence/templates/chat/added-opposing-charms-card.html", {
            actor: this.actor,
            addingCharms: addingCharms,
        });
        ChatMessage.create({
            user: game.user.id,
            content: messageContent,
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            flags: {
                "exaltedessence": {
                    targetActorId: null,
                    targetTokenId: null,
                }
            },
        });
        await this._updateRollerResources();
        this.close();
    }

    async _updateRollerResources() {
        const actorData = foundry.utils.duplicate(this.actor);
        let newAnimaValue = Math.max(0, actorData.system.anima.value - this.object.cost.anima + this.object.gain.anima);
        let moteCost = this.object.cost.motes;
        if (game.settings.get("exaltedessence", "alternateAnima")) {
            moteCost += this.actor.altAnimaSpendConversion(this.object.cost.anima);
        } else {
            actorData.system.anima.value = newAnimaValue;
        }
        if (actorData.system.details.exalt === 'getimian') {
            if (actorData.system.settings.charmspendpool === 'still') {
                actorData.system.still.value = Math.max(0, actorData.system.still.value - moteCost - this.object.cost.committed);
                actorData.system.still.value += this.object.gain.motes;
            }
            if (actorData.system.settings.charmspendpool === 'flowing') {
                actorData.system.flowing.value = Math.max(0, actorData.system.flowing.value - moteCost - this.object.cost.committed);
                actorData.system.flowing.value += this.object.gain.motes;
            }
        }
        else {
            actorData.system.motes.value = Math.max(0, actorData.system.motes.value - moteCost - this.object.cost.committed + this.object.gain.motes);
        }
        actorData.system.motes.committed += this.object.cost.committed;
        actorData.system.stunt.value = Math.max(0, actorData.system.stunt.value - this.object.cost.stunt);

        this._updateCharacterPower(actorData, this.object.gain.power - this.object.cost.power);
        if (game.settings.get("exaltedessence", "combatReforged") && this.actor.effects.find(e => e.statuses.has('break'))) {
            if (actorData.system.poise.value === actorData.system.poise.max) {
                this.actor.toggleStatusEffect('break');
            }
        }
        this.object.power = actorData.system.power.value;
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
        if (this.object.activateAura) {
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