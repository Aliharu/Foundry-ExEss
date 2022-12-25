// Import Modules
import { EXALTEDESSENCE } from "./config.js";

import { ExaltedessenceActor } from "./actor/actor.js";
import { ExaltedessenceActorSheet } from "./actor/actor-sheet.js";
import { ExaltedessenceItem } from "./item/item.js";
import { ExaltedessenceItemSheet } from "./item/item-sheet.js";

import TraitSelector from "./apps/trait-selector.js";
import { registerSettings } from "./settings.js";
import { RollForm } from "./apps/dice-roller.js";
import ItemSearch from "./apps/item-search.js";
import { ExaltedCombatant } from "./combat/combat.js";
import { ExaltedCombatTracker } from "./combat/combat-tracker.js";

Hooks.once('init', async function () {

  registerSettings();

  game.exaltedessence = {
    applications: {
      TraitSelector,
      ItemSearch,
    },
    entities: {
      ExaltedessenceActor,
      ExaltedessenceItem,
    },
    config: EXALTEDESSENCE,
    rollItemMacro: rollItemMacro,
    RollForm
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  Combatant.prototype._getInitiativeFormula = function () {
    const actor = this.actor;
    var initDice = 0;
    if (this.actor.type != 'npc') {
      initDice = actor.system.attributes.finesse.value + Math.max(actor.system.abilities.ranged.value, actor.system.abilities.close.value) + 2;
    }
    else {
      initDice = actor.system.pools.primary.value;
    }
    let roll = new Roll(`${initDice}d10cs>=7`).evaluate({ async: false });
    let diceRoll = roll.total;
    let bonus = 0;
    for (let dice of roll.dice[0].results) {
      if (dice.result >= 10) {
        bonus++;
      }
    }
    return `${diceRoll + bonus}`;
  }

  // Define custom Entity classes
  CONFIG.EXALTEDESSENCE = EXALTEDESSENCE;
  CONFIG.statusEffects = EXALTEDESSENCE.statusEffects;
  CONFIG.Actor.documentClass = ExaltedessenceActor;
  CONFIG.Item.documentClass = ExaltedessenceItem;

  CONFIG.Combat.documentClass = ExaltedCombat;
  CONFIG.Combatant.documentClass = ExaltedCombatant;
  CONFIG.ui.combat = ExaltedCombatTracker;

  game.socket.on('system.exaltedessence', handleSocket);

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("exaltedessence", ExaltedessenceActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("exaltedessence", ExaltedessenceItemSheet, { makeDefault: true });

  // Pre-load templates
  loadTemplates([
    "systems/exaltedessence/templates/dialogues/ability-base.html",
    "systems/exaltedessence/templates/dialogues/add-roll-charm.html",
    "systems/exaltedessence/templates/actor/active-effects.html",
    "systems/exaltedessence/templates/actor/equipment-list.html",
    "systems/exaltedessence/templates/actor/charm-list.html",
    "systems/exaltedessence/templates/actor/intimacies-list.html",
    "systems/exaltedessence/templates/dialogues/accuracy-roll.html",
    "systems/exaltedessence/templates/dialogues/damage-roll.html",
  ]);

  function handleSocket({ type, id, data }) {
    if (!game.user.isGM) return;

    // if the logged in user is the active GM with the lowest user id
    const isResponsibleGM = game.users
      .some(user => user.isGM && user.active)

    if (!isResponsibleGM) return;
    if (type === 'healthDamage') {
      const targetedActor = game.canvas.tokens.get(id).actor;
      if (targetedActor) {
        const targetActorData = duplicate(targetedActor);
        targetActorData.system.health = data;
        targetedActor.update(targetActorData);
      }
    }
    if (type === 'addOnslaught') {
      const targetedActor = game.canvas.tokens.get(id).actor;
      const onslaught = targetedActor.effects.find(i => i.label == "Onslaught");
      if (onslaught) {
        let changes = duplicate(onslaught.data.changes);
        if (targetedActor.system.hardness.value > 0) {
          changes[0].value = changes[0].value - 1;
          onslaught.update({ changes });
        }
      }
      else {
        targetedActor.createEmbeddedDocuments('ActiveEffect', [{
          label: 'Onslaught',
          icon: 'systems/exaltedessence/assets/icons/surrounded-shield.svg',
          origin: targetedActor.uuid,
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
    if(type === 'deleteOnslaught') {
      const targetedActor = game.canvas.tokens.get(id).actor;
      const onslaught = targetedActor.effects.find(i => i.label == "Onslaught");
      if (onslaught) {
          onslaught.delete();
      }
    }
  }

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function () {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper('ifGreater', function (arg1, arg2, options) {
    return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper('numLoop', function (num, options) {
    let ret = ''

    for (let i = 0, j = num; i < j; i++) {
      ret = ret + options.fn(i)
    }

    return ret
  })
});

Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifNotEquals', function (arg1, arg2, options) {
  return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

$(document).ready(() => {
  const diceIconSelector = '#chat-controls .chat-control-icon .fa-dice-d20';

  $(document).on('click', diceIconSelector, ev => {
    ev.preventDefault();
    new RollForm(null, {}, {}, { rollType: 'base' }).render(true);;
  });
});

Hooks.on('updateCombat', (async (combat, update) => {
  // Handle non-gm users.
  if(!game.user.isGM) return;

  if (combat.current === undefined) {
    combat = game.combat;
  }

  if (update && update.round) {
    for (var combatant of combat.combatants) {
      const actorData = duplicate(combatant.actor)
      if (actorData.system.motes.value < (actorData.system.motes.max - actorData.system.motes.commited)) {
        actorData.system.motes.value++;
      }
      combatant.actor.update(actorData);
    }
  }
}));

Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createExaltedessenceMacro(data, slot));

  $("#chat-log").on("click", " .item-row", ev => {
    const li = $(ev.currentTarget).next();
    li.toggle("fast");
  });

});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createExaltedessenceMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
  const item = data.data;

  // Create the macro command
  const command = `game.exaltedessence.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "exaltedessence.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  const item = actor ? actor.items.find(i => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}

export class ExaltedCombat extends Combat {
  async resetTurnsTaken() {
    const updates = this.combatants.map(c => {
      return {
        _id: c.id,
        [`flags.acted`]: c.isDefeated
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