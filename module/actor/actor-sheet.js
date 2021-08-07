// import {
//   DiceRollerDialogue
// } from "./dialogue-diceRoller.js";
import TraitSelector from "../apps/trait-selector.js";
import { openRollDialogue } from "../apps/dice-roller.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ExaltedessenceActorSheet extends ActorSheet {

  constructor(...args) {
    super(...args);

    this._filters = {
      effects: new Set()
    }
  }

  /**
 * Get the correct HTML template path to use for rendering this particular sheet
 * @type {String}
 */
  get template() {
    if (this.actor.data.type === "npc") return "systems/exaltedessence/templates/actor/npc-sheet.html";
    return "systems/exaltedessence/templates/actor/actor-sheet.html";
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["exaltedessence", "sheet", "actor"],
      template: "systems/exaltedessence/templates/actor/actor-sheet.html",
      width: 800,
      height: 1026,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];

    // Update traits
    this._prepareTraits(data.data.data.traits);

    // Prepare items.
    if (this.actor.data.type === 'character') {
      for (let attr of Object.values(data.data.data.attributes)) {
        attr.isCheckbox = attr.dtype === "Boolean";
      }
      this._prepareCharacterItems(data);
    }
    if (this.actor.data.type === 'npc') {
      this._prepareCharacterItems(data);
    }

    data.effects = prepareActiveEffectCategories(this.document.effects);

    return data;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const weapons = [];
    const armor = [];
    const merits = [];
    const qualities = [];
    const intimacies = [];
    const rituals = [];

    const charms = {
      athletics: { name: 'ExEss.Athletics', visible: false, list: [] },
      awareness: { name: 'ExEss.Awareness', visible: false, list: [] },
      close: { name: 'ExEss.CloseCombat', visible: false, list: [] },
      craft: { name: 'ExEss.Craft', visible: false, list: [] },
      embassy: { name: 'ExEss.Embassy', visible: false, list: [] },
      integrity: { name: 'ExEss.Integrity', visible: false, list: [] },
      navigate: { name: 'ExEss.Navigate', visible: false, list: [] },
      performance: { name: 'ExEss.Performance', visible: false, list: [] },
      physique: { name: 'ExEss.Physique', visible: false, list: [] },
      presence: { name: 'ExEss.Presence', visible: false, list: [] },
      ranged: { name: 'ExEss.RangedCombat', visible: false, list: [] },
      sagacity: { name: 'ExEss.Sagacity', visible: false, list: [] },
      stealth: { name: 'ExEss.Stealth', visible: false, list: [] },
      war: { name: 'ExEss.War', visible: false, list: [] },
      martial: { name: 'ExEss.MartialArts', visible: false, list: [] },
      evocation: { name: 'ExEss.Evocations', visible: false, list: [] },
    }

    const spells = {
      first: { name: 'ExEss.First', visible: false, list: [] },
      second: { name: 'ExEss.Second', visible: false, list: [] },
      third: { name: 'ExEss.Third', visible: false, list: [] },
    }

    // Iterate through items, allocating to containers
    for (let i of sheetData.items) {
      let item = i.data;

      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      else if (i.type === 'weapon') {
        weapons.push(i);
      }
      else if (i.type === 'armor') {
        armor.push(i);
      }
      // Append to merits.
      else if (i.type === 'merit') {
        merits.push(i);
      }
      else if (i.type === 'quality') {
        qualities.push(i);
      }
      else if (i.type === 'intimacy') {
        intimacies.push(i);
      }
      else if (i.type === 'ritual') {
        rituals.push(i);
      }
      // Append to charms.
      else if (i.type === 'charm') {
        if (i.data.ability !== undefined) {
          charms[i.data.ability].list.push(i);
          charms[i.data.ability].visible = true;
        }
      }
      else if (i.type === 'spell') {
        if (i.data.circle !== undefined) {
          spells[i.data.circle].list.push(i);
          spells[i.data.circle].visible = true;
        }
      }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.weapons = weapons;
    actorData.armor = armor;
    actorData.merits = merits;
    actorData.qualities = qualities;
    actorData.rituals = rituals;
    actorData.intimacies = intimacies;
    actorData.charms = charms;
    actorData.spells = spells;
  }

  /**
 * Prepare the data structure for traits data like languages
 * @param {object} traits   The raw traits data object from the actor data
 * @private
 */
  _prepareTraits(traits) {
    const map = {
      "languages": CONFIG.EXALTEDESSENCE.languages,
    };
    for (let [t, choices] of Object.entries(map)) {
      const trait = traits[t];
      if (!trait) continue;
      let values = [];
      if (trait.value) {
        values = trait.value instanceof Array ? trait.value : [trait.value];
      }
      trait.selected = values.reduce((obj, t) => {
        obj[t] = choices[t];
        return obj;
      }, {});

      // Add custom entry
      if (trait.custom) {
        trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i + 1}`] = c.trim());
      }
      trait.cssClass = !isObjectEmpty(trait.selected) ? "" : "inactive";
    }
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    this._setupDotCounters(html)
    this._setupSquareCounters(html)

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find('.trait-selector').click(this._onTraitSelector.bind(this));

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.resource-value > .resource-value-step').click(this._onDotCounterChange.bind(this))
    html.find('.resource-value > .resource-value-empty').click(this._onDotCounterEmpty.bind(this))
    html.find('.resource-counter > .resource-counter-step').click(this._onSquareCounterChange.bind(this))

    html.find('.augment-attribute').click(this._toggleAugment.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      ev.stopPropagation();
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
      li.slideUp(200, () => this.render(false));
    });

    html.find('#color-picker').mousedown(ev => {
      this.pickColor();
    });

    html.find('#rollDice').mousedown(ev => {
      openRollDialogue(this.actor);
    });

    html.find('#rollAbility').mousedown(ev => {
      this._openAbilityRollDialogue();
    });

    html.find('.roll-ability').mousedown(ev => {
      var ability = $(ev.target).attr("data-ability");
      this._openAbilityRollDialogue(ability);
    });

    html.find('#buildPower').mousedown(ev => {
      this._buildResource('power');
    });

    html.find('#focusWill').mousedown(ev => {
      this._buildResource('will');
    });

    html.find('#rollWithering').mousedown(ev => {
      this._openAttackDialogue($(ev.target).attr("data-accuracy"), $(ev.target).attr("data-damage"), $(ev.target).attr("data-overwhelming"), $(ev.target).attr("data-weapontype"), false);
    });

    html.find('#rollDecisive').mousedown(ev => {
      this._openAttackDialogue($(ev.target).attr("data-accuracy"), $(ev.target).attr("data-damage"), $(ev.target).attr("data-overwhelming"), $(ev.target).attr("data-weapontype"), true);
    });

    html.find('#anima-up').click(ev => {
      this._updateAnima("up");
    });

    html.find('#anima-down').click(ev => {
      this._updateAnima("down");
    });

    html.find('.item-chat').click(ev => {
      this._displayCard(ev);
    });

    html.find('.item-row').click(ev => {
      const li = $(ev.currentTarget).next();
      li.toggle("fast");
    });

    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    html.find('.rollable').click(this._onRoll.bind(this));
    
    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  _updateAnima(direction) {
    const actorData = duplicate(this.actor);
    const data = actorData.data;
    let newLevel = 0;
    if (direction === "up") {
      if (data.anima.value == 0) {
        newLevel = 1;
      }
      else if (data.anima.value < 3) {
        newLevel = 3;
      }
      else if (data.anima.value < 5) {
        newLevel = 5;
      }
      else if (data.anima.value < 7) {
        newLevel = 7;
      }
      else {
        newLevel = 10;
      }
    }
    else {
      if (data.anima.value >= 1) {
        newLevel = 0;
      }
      if (data.anima.value >= 3) {
        newLevel = 2;
      }
      if (data.anima.value >= 5) {
        newLevel = 4;
      }
      if (data.anima.value >= 7) {
        newLevel = 6;
      }
      if (data.anima.value === 10) {
        newLevel = 9;
      }
    }
    data.anima.value = newLevel;
    this.actor.update(actorData);
  }

  async pickColor() {
    let confirmed = false;
    const actorData = duplicate(this.actor);
    const data = actorData.data;
    const template = "systems/exaltedessence/templates/dialogues/color-picker.html"
    const html = await renderTemplate(template, { 'color': data.details.color });
    new Dialog({
      title: `Pick Color`,
      content: html,
      buttons: {
        roll: { label: "Save", callback: () => confirmed = true },
        cancel: { label: "Cancel", callback: () => confirmed = false }
      },
      close: html => {
        if (confirmed) {
          let color = html.find('#color').val();
          if (isColor(color)) {
            data.details.color = color
            this.actor.update(actorData)
          }
        }
      }
    }).render(true);
  }

  _baseAbilityDieRoll(html, data, characterType = 'character', rollType = 'ability') {
    let dice = 0;
    let augmentAttribute = false;

    if (characterType === 'character') {
      let attribute = html.find('#attribute').val();
      let ability = html.find('#ability').val();
      let attributeExcellency = html.find('#attribute-excellency').is(':checked');
      let abilityExcellency = html.find('#ability-excellency').is(':checked');

      let attributeDice = data.attributes[attribute].value;
      let abilityDice = data.abilities[ability].value;

      if (attributeExcellency) {
        attributeDice = attributeDice * 2;
        if (data.details.exalt === "alchemical") {
          if (data.attributes[attribute].aug) {
            if (data.attributes[attribute].value < 5) {
              attributeDice++;
            }
            if (data.essence.value > 1) {
              augmentAttribute = true;
            }
          }
        }
      }
      if (abilityExcellency) {
        abilityDice = abilityDice * 2;
      }

      dice = attributeDice + abilityDice;
    }
    else if (characterType === 'npc') {
      let poolExcellency = html.find('#pool-excellency').is(':checked');
      let pool = html.find('#pool').val();
      let poolDice = data.pools[pool].value;
      dice = poolDice;

      if (poolExcellency) {
        if (pool === 'primary') {
          dice += 4;
        }
        else if (pool === 'secondary') {
          dice += 3;
        }
      }

      if (data.battlegroup && rollType == 'attack') {
        dice += data.drill.value;
      }
    }

    let stunt = html.find('#stunt').is(':checked');
    let woundPenalty = html.find('#wound-penalty').is(':checked');
    let flurry = html.find('#flurry').is(':checked');
    let armorPenalty = html.find('#armor-penalty').is(':checked');

    let diceModifier = parseInt(html.find('#dice-modifier').val()) || 0;
    let successModifier = parseInt(html.find('#success-modifier').val()) || 0;

    let doubleSuccess = this._calculateDoubleDice(html, augmentAttribute);

    let rerollFailed = html.find('#reroll-failed').is(':checked');

    if (armorPenalty) {
      for (let armor of this.actor.armor) {
        if (armor.data.equiped) {
          dice = dice - Math.abs(armor.data.penalty);
        }
      }
    }
    if (stunt) {
      dice += 2;
    }
    if (woundPenalty && data.health.penalty !== 'inc') {
      dice -= data.health.penalty;
    }
    if (flurry) {
      dice -= 3;
    }
    if (diceModifier) {
      dice += diceModifier;
    }

    if (data.details.exalt === "getimian") {
      if (attribute === "force" && (data.still.total < data.flowing.total)) {
        successModifier += 1;
      }
      if (attribute === "finesse" && (data.still.total > data.flowing.total)) {
        successModifier += 1;
      }
      if (attribute === "fortitude" && (data.still.total >= (data.flowing.total - 1) && data.still.total <= (data.flowing.total + 1))) {
        successModifier += 1;
      }
    }

    let roll = new Roll(`${dice}d10${rerollFailed ? "r<7" : ""}cs>=7`).evaluate({ async: false });
    let diceRoll = roll.dice[0].results;
    let getDice = "";

    let bonus = "";

    for (let dice of diceRoll) {
      if (dice.result >= doubleSuccess) {
        bonus++;
        getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
      }
      else if (dice.result >= 7) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
      else if (dice.result == 1) { getDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
      else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
    }

    let total = roll.total;
    if (bonus) total += bonus;
    if (successModifier) total += successModifier;

    return { dice: dice, roll: roll, getDice: getDice, total: total };
  }

  async _buildResource(type = 'power') {
    const characterType = this.actor.data.type;
    let confirmed = false;
    const data = this.actor.data.data;
    const template = "systems/exaltedessence/templates/dialogues/ability-roll.html";
    const highestAttribute = this._getHighestAttribute(data);
    const html = await renderTemplate(template, { 'character-type': characterType, 'attribute': highestAttribute });
    new Dialog({
      title: `Die Roller`,
      content: html,
      buttons: {
        roll: { label: "Roll it!", callback: () => confirmed = true },
        cancel: { label: "Cancel", callback: () => confirmed = false }
      },
      close: html => {
        if (confirmed) {
          var rollResults = this._baseAbilityDieRoll(html, data, characterType, type);
          let successModifier = parseInt(html.find('#success-modifier').val()) || 0;
          var total = rollResults.total - 3;
          if (this.actor.data.type === 'npc' && type === 'power') {
            if (data.battlegroup) {
              successModifier += data.drill.value;
            }
          }
          var message = '';
          if (total < 0) {
            if (type === 'power') {
              message = `<h4 class="dice-total">Build Power Failed</h4>`;
            }
            else if (type === 'will') {
              message = `<h4 class="dice-total">Focus Will Failed</h4>`;
            }
          }
          else {
            if (type === 'power') {
              message = `<h4 class="dice-formula">${rollResults.total} Succeses</h4> <h4 class="dice-total">${total + 1} Power Built!</h4>`;
            }
            else if (type === 'will') {
              message = `<h4 class="dice-formula">${rollResults.total} Succeses</h4> <h4 class="dice-total">${total + 1} Will Focused!</h4>`;
            }
          }
          let the_content = `
          <div class="chat-card item-card">
              <div class="card-content">Dice Roll</div>
              <div class="card-buttons">
                  <div class="flexrow 1">
                      <div>Dice Roller - Number of Successes<div class="dice-roll">
                              <div class="dice-result">
                                  <h4 class="dice-formula">${rollResults.dice} Dice + ${successModifier} successes</h4>
                                  <div class="dice-tooltip">
                                      <div class="dice">
                                          <ol class="dice-rolls">${rollResults.getDice}</ol>
                                      </div>
                                  </div>
                                  ${message}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          `
          ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ token: this.actor }), content: the_content, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });
        }
      }
    }).render(true);
  }

  async _openAbilityRollDialogue(ability="athletics") {
    const data = this.actor.data.data;
    const characterType = this.actor.data.type;
    let confirmed = false;
    const template = "systems/exaltedessence/templates/dialogues/ability-roll.html"
    const highestAttribute = this._getHighestAttribute(data);
    const html = await renderTemplate(template, { 'character-type': characterType, 'attribute': highestAttribute, ability: ability });
    new Dialog({
      title: `Die Roller`,
      content: html,
      buttons: {
        roll: { label: "Roll it!", callback: () => confirmed = true },
        cancel: { label: "Cancel", callback: () => confirmed = false }
      },
      close: html => {
        if (confirmed) {
          var rollResults = this._baseAbilityDieRoll(html, data, characterType, 'ability');
          let bonusSuccesses = parseInt(html.find('#success-modifier').val()) || 0;
          let the_content = `
          <div class="chat-card item-card">
              <div class="card-content">Dice Roll</div>
              <div class="card-buttons">
                  <div class="flexrow 1">
                      <div>Dice Roller - Number of Successes<div class="dice-roll">
                              <div class="dice-result">
                                  <h4 class="dice-formula">${rollResults.dice} Dice + ${bonusSuccesses} successes</h4>
                                  <div class="dice-tooltip">
                                      <div class="dice">
                                          <ol class="dice-rolls">${rollResults.getDice}</ol>
                                      </div>
                                  </div>
                                  <h4 class="dice-total">${rollResults.total} Succeses</h4>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          `
          ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ token: this.actor }), content: the_content, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });
        }
      }
    }).render(true);
  }

  _getHighestAttribute(data) {
    var highestAttributeNumber = 0;
    var highestAttribute = "force";
    for (let [name, attribute] of Object.entries(data.attributes)) {
      if(attribute.value > highestAttributeNumber) {
        highestAttributeNumber = attribute.value;
        highestAttribute = name;
      }
    }
    return highestAttribute;
  }

  async _openAttackDialogue(weaponAccuracy, weaponDamage, overwhelming, weaponType, decisive = true) {
    const characterType = this.actor.data.type;
    let confirmed = false;
    const data = this.actor.data.data;
    const template = "systems/exaltedessence/templates/dialogues/accuracy-roll.html"
    const highestAttribute = this._getHighestAttribute(data);
    const html = await renderTemplate(template, { "weapon-accuracy": weaponAccuracy, "weapon-damage": weaponDamage, "overwhelming": overwhelming, 'character-type': characterType, "attribute": highestAttribute, "ability": weaponType === "melee" ? "close" : "ranged" });
    var rollResults = await new Promise((resolve, reject) => {
      return new Dialog({
        title: `Accuracy`,
        content: html,
        buttons: {
          roll: { label: "Attack!", callback: () => confirmed = true },
          cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        close: html => {
          if (confirmed) {
            // Accuracy
            let bonusSuccesses = parseInt(html.find('#success-modifier').val()) || 0;
            weaponAccuracy = parseInt(weaponAccuracy);
            var rollResults = this._baseAbilityDieRoll(html, data, characterType, 'attack');
            let total = rollResults.total + weaponAccuracy + bonusSuccesses;

            var messageContent = `
              <div class="chat-card item-card">
                  <div class="card-content">Decisive Attack</div>
                  <div class="card-buttons">
                      <div class="flexrow 1">
                          <div>
                              <div class="dice-roll">
                                  <div class="dice-result">
                                      <h4 class="dice-formula">${rollResults.dice} Dice + ${bonusSuccesses + weaponAccuracy} successes</h4>
                                      <div class="dice-tooltip">
                                          <div class="dice">
                                              <ol class="dice-rolls">${rollResults.getDice}</ol>
                                          </div>
                                      </div>
                                      <h4 class="dice-formula">${total} Succeses</h4>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            `;
            ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ token: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });
            return resolve({ 'successess': total });
          }
        }
      }).render(true);
    });

    this._rollAttackDamage(rollResults, weaponDamage, overwhelming, decisive);
  }

  async _rollAttackDamage(accuracyResult, weaponDamage, overwhelming, decisive) {
    let confirmed = false;
    const actorData = duplicate(this.actor);
    const template = "systems/exaltedessence/templates/dialogues/damage-roll.html"
    const html = await renderTemplate(template, { "successes": accuracyResult.successess, "power": actorData.data.power.value, "weapon-damage": weaponDamage, "overwhelming": overwhelming, "decisive": decisive });

    new Dialog({
      title: `Damage`,
      content: html,
      buttons: {
        roll: { label: "Damage!", callback: () => confirmed = true },
        cancel: { label: "Cancel", callback: () => confirmed = false }
      },
      close: html => {
        if (confirmed) {
          let defence = parseInt(html.find('#defence').val()) || 0;
          let soak = parseInt(html.find('#soak').val()) || 0;
          let power = parseInt(html.find('#power').val()) || 0;
          let accuracySuccesses = parseInt(html.find('#successes').val()) || 0;
          var postDefenceTotal = accuracySuccesses - defence;
          var messageContent = '';

          weaponDamage = parseInt(weaponDamage);
          overwhelming = parseInt(overwhelming);

          if (this.actor.data.type === 'npc') {
            if (actorData.data.battlegroup) {
              overwhelming = Math.min(actorData.data.size.value + 1, 5);
            }
          }

          if (postDefenceTotal < 0) {
            var overwhlemingMessage = '';
            if (!decisive) {
              overwhlemingMessage = `<h4 class="dice-total">${overwhelming} Power Built!</h4>`;
            }
            messageContent = `
              <div class="chat-card item-card">
                  <div class="card-content">Withering Attack</div>
                  <div class="card-buttons">
                      <div class="flexrow 1">
                          <div>
                              <div class="dice-roll">
                                  <div class="dice-result">
                                      <h4 class="dice-formula">${accuracySuccesses} Succeses</h4>
                                      <h4 class="dice-formula">${defence} defence</h4>
                                      <h4 class="dice-formula">${overwhelming} Overwhelming</h4>
                                      <h4 class="dice-total">Attack Missed!</h4>
                                      ${overwhlemingMessage}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            `;
            ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ token: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
          }
          else {
            if (decisive) {
              let bonusDamageDice = parseInt(html.find('#damage-dice').val()) || 0;
              let damageSuccesses = parseInt(html.find('#damage-success').val()) || 0;
              //Fix to damage later
              let doubleSevens = html.find('#double-damage-sevens').is(':checked');
              let doubleEights = html.find('#double-damage-eights').is(':checked');
              let doubleNines = html.find('#double-damage-nines').is(':checked');
              let doubleTens = html.find('#double-damage-tens').is(':checked');
              let rerollFailed = html.find('#reroll-damage-failed').is(':checked');

              let doubleDamageSuccess = 11;

              if (doubleSevens) {
                doubleDamageSuccess = 7;
              }
              else if (doubleEights) {
                doubleDamageSuccess = 8;
              }
              else if (doubleNines) {
                doubleDamageSuccess = 9;
              }
              else if (doubleTens) {
                doubleDamageSuccess = 10;
              }
              // Deal Damage
              let damage = postDefenceTotal + power + bonusDamageDice;
              if (this.actor.data.type === 'npc') {
                if (actorData.data.battlegroup) {
                  damage += actorData.data.drill.value;
                }
              }
              let damageRoll = new Roll(`${damage}d10${rerollFailed ? "r<7" : ""}cs>=7`).evaluate({ async: false });
              let damageDiceRoll = damageRoll.dice[0].results;
              let damageBonus = "";
              let getDamageDice = "";
              for (let dice of damageDiceRoll) {
                // comment out if no double successes
                if (dice.result >= doubleDamageSuccess) {
                  damageBonus++;
                  getDamageDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
                }
                else if (dice.result >= 7) { getDamageDice += `<li class="roll die d10 success">${dice.result}</li>`; }
                else if (dice.result == 1) { getDamageDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
                else { getDamageDice += `<li class="roll die d10">${dice.result}</li>`; }
              }

              let damageSuccess = damageRoll.total + weaponDamage;
              if (damageBonus) damageSuccess += damageBonus;
              if (damageSuccesses) damageSuccess += damageSuccesses;

              let damageTotal = damageSuccess - soak;

              messageContent = `
                <div class="chat-card item-card">
                    <div class="card-content">Decisive Attack</div>
                    <div class="card-buttons">
                        <div class="flexrow 1">
                            <div>
                                <div class="dice-roll">
                                    <div class="dice-result">
                                        <h4 class="dice-formula">${accuracySuccesses} Succeses vs ${defence} defence</h4>
                                        <h4 class="dice-formula">${postDefenceTotal} Extra Succeses + ${power} power</h4>
                                        <h4 class="dice-formula">${damage} Damage dice + ${damageSuccesses + weaponDamage} successes </h4>
                                        <div class="dice-tooltip">
                                          <div class="dice">
                                              <ol class="dice-rolls">${getDamageDice}</ol>
                                          </div>
                                        </div>
                                        <h4 class="dice-formula">${damageSuccess} Damage - ${soak} soak</h4>
                                        <h4 class="dice-total">${damageTotal} Total Damage</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              `
              ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ token: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: damageRoll });
            }
            else {
              var powerGained = postDefenceTotal + 1;
              if (postDefenceTotal < overwhelming) {
                powerGained = overwhelming + 1;
              }
              messageContent = `
                  <div class="chat-card item-card">
                      <div class="card-content">Withering Attack</div>
                      <div class="card-buttons">
                          <div class="flexrow 1">
                              <div>
                                  <div class="dice-roll">
                                      <div class="dice-result">
                                          <h4 class="dice-formula">${accuracySuccesses} Succeses vs ${defence} defence</h4>
                                          <h4 class="dice-formula">1 Base + ${postDefenceTotal} Extra Succeses</h4>
                                          <h4 class="dice-formula">${overwhelming} Overwhelming</h4>
                                          <h4 class="dice-total">${powerGained} Power Built!</h4>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                `
              ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ token: this.actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
            }
          }
        }
      }
    }).render(true);
  }

  _calculateDoubleDice(html, augmentAttribute = false) {
    let doubleSevens = html.find('#double-sevens').is(':checked');
    let doubleEights = html.find('#double-eights').is(':checked');
    let doubleNines = html.find('#double-nines').is(':checked');
    let doubleTens = html.find('#double-tens').is(':checked');

    let doubleSuccess = 11;

    if (doubleSevens) {
      doubleSuccess = 7;
    }
    else if (doubleEights) {
      doubleSuccess = 8;
    }
    else if (doubleNines || augmentAttribute) {
      doubleSuccess = 9;
    }
    else if (doubleTens) {
      doubleSuccess = 10;
    }
    return doubleSuccess;
  }

  _onSquareCounterChange(event) {
    event.preventDefault()
    const element = event.currentTarget
    const index = Number(element.dataset.index)
    const oldState = element.dataset.state || ''
    const parent = $(element.parentNode)
    const data = parent[0].dataset
    const states = parseCounterStates(data.states)
    const fields = data.name.split('.')
    const steps = parent.find('.resource-counter-step')
    const fulls = Number(data[states['-']]) || 0
    const halfs = Number(data[states['/']]) || 0

    if (index < 0 || index > steps.length) {
      return
    }

    const allStates = ['', ...Object.keys(states)]
    const currentState = allStates.indexOf(oldState)
    if (currentState < 0) {
      return
    }

    const newState = allStates[(currentState + 1) % allStates.length]
    steps[index].dataset.state = newState

    if ((oldState !== '' && oldState !== '-') || (oldState !== '')) {
      data[states[oldState]] = Number(data[states[oldState]]) - 1
    }

    // If the step was removed we also need to subtract from the maximum.
    if (oldState !== '' && newState === '') {
      data[states['-']] = Number(data[states['-']]) - 1
    }

    if (newState !== '') {
      data[states[newState]] = Number(data[states[newState]]) + Math.max(index + 1 - fulls - halfs, 1)
    }

    const newValue = Object.values(states).reduce(function (obj, k) {
      obj[k] = Number(data[k]) || 0
      return obj
    }, {})

    this._assignToActorField(fields, newValue)
  }

  _onDotCounterChange(event) {
    event.preventDefault()
    const actorData = duplicate(this.actor)
    const element = event.currentTarget
    const dataset = element.dataset
    const index = Number(dataset.index)
    const parent = $(element.parentNode)
    const fieldStrings = parent[0].dataset.name
    const fields = fieldStrings.split('.')
    const steps = parent.find('.resource-value-step')
    if (index < 0 || index > steps.length) {
      return
    }

    steps.removeClass('active')
    steps.each(function (i) {
      if (i <= index) {
        // $(this).addClass('active')
        $(this).css("background-color", actorData.data.details.color);
      }
    })
    this._assignToActorField(fields, index + 1)
  }

  _assignToActorField(fields, value) {
    const actorData = duplicate(this.actor)
    // update actor owned items
    if (fields.length === 2 && fields[0] === 'items') {
      for (const i of actorData.items) {
        if (fields[1] === i._id) {
          i.data.points = value
          break
        }
      }
    } else {
      const lastField = fields.pop()
      if (fields.reduce((data, field) => data[field], actorData)[lastField] === 1 && value === 1) {
        fields.reduce((data, field) => data[field], actorData)[lastField] = 0;
      }
      else {
        fields.reduce((data, field) => data[field], actorData)[lastField] = value
      }
    }
    this.actor.update(actorData)
  }

  _onDotCounterEmpty(event) {
    event.preventDefault()
    const actorData = duplicate(this.actor)
    const element = event.currentTarget
    const parent = $(element.parentNode)
    const fieldStrings = parent[0].dataset.name
    const fields = fieldStrings.split('.')
    const steps = parent.find('.resource-value-empty')

    steps.removeClass('active')
    this._assignToActorField(fields, 0)
  }

  _setupDotCounters(html) {
    const actorData = duplicate(this.actor)
    html.find('.resource-value').each(function () {
      const value = Number(this.dataset.value);
      $(this).find('.resource-value-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
          $(this).css("background-color", actorData.data.details.color);
        }
      })
    })
    html.find('.resource-value-static').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-value-static-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
          $(this).css("background-color", actorData.data.details.color);
        }
      })
    })
  }

  _setupSquareCounters(html) {
    html.find('.resource-counter').each(function () {
      const data = this.dataset
      const states = parseCounterStates(data.states)

      const fulls = Number(data[states['-']]) || 0
      const halfs = Number(data[states['/']]) || 0
      const crossed = Number(data[states.x]) || 0

      const values = new Array(halfs + crossed)

      values.fill('/', 0, halfs)
      values.fill('x', halfs, halfs + crossed)

      $(this).find('.resource-counter-step').each(function () {
        this.dataset.state = ''
        if (this.dataset.index < values.length) {
          this.dataset.state = values[this.dataset.index]
        }
      })
    })
  }

  _toggleAugment(event) {
    event.preventDefault()
    const element = event.currentTarget
    const attribute = element.dataset.name
    const actorData = duplicate(this.actor)
    var augStatus = actorData.data.attributes[attribute].aug;
    actorData.data.attributes[attribute].aug = !augStatus;
    this.actor.update(actorData);
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
    event.preventDefault();
    event.stopPropagation();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments("Item", [itemData])
  }

  /**
 * Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
 * @param {Event} event   The click event which originated the selection
 * @private
 */
  _onTraitSelector(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const label = a.parentElement.querySelector("label");
    const choices = CONFIG.EXALTEDESSENCE[a.dataset.options];
    const options = { name: a.dataset.target, title: label.innerText, choices };
    return new TraitSelector(this.actor, options).render(true)
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    if (dataset.roll) {
      let roll = new Roll(dataset.roll, this.actor.data.data);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  /**
* Display the chat card for an Item as a Chat Message
* @param {object} options          Options which configure the display of the item chat card
* @param {string} rollMode         The message visibility mode to apply to the created card
* @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
*                                  the prepared message data (if false)
*/
  async _displayCard(event) {
    event.preventDefault();
    event.stopPropagation();
    // Render the chat card template
    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));
    const token = this.actor.token;
    const templateData = {
      actor: this.actor,
      tokenId: token?.uuid || null,
      item: item.data,
      labels: this.labels,
    };
    const html = await renderTemplate("systems/exaltedessence/templates/chat/item-card.html", templateData);

    // Create the ChatMessage data object
    const chatData = {
      user: game.user._id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: ChatMessage.getSpeaker({ actor: this.actor, token }),
    };


    // Create the Chat Message or return its data
    return ChatMessage.create(chatData);
  }
}


function parseCounterStates(states) {
  return states.split(',').reduce((obj, state) => {
    const [k, v] = state.split(':')
    obj[k] = v
    return obj
  }, {})
}

function isColor(strColor) {
  const s = new Option().style;
  s.color = strColor;
  return s.color !== '';
}
