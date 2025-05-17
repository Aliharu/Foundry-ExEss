// Import Modules
import { EXALTEDESSENCE } from "./config.js";

import { ExaltedessenceActor } from "./actor/actor.js";
import { ExaltedEssenceActorSheet } from "./actor/actor-sheet.js";
import { ExaltedessenceItem } from "./item/item.js";
import { ExaltedessenceItemSheet } from "./item/item-sheet.js";
import ExaltedActiveEffectConfig from "./active-effect-config.js";


import TraitSelector from "./apps/trait-selector.js";
import { registerSettings } from "./settings.js";
import ItemSearch from "./apps/item-search.js";
import { ExaltedCombatant } from "./combat/combat.js";
import { ExaltedCombatTracker } from "./combat/combat-tracker.js";
import { CharacterData, NpcData } from "./template/actor-template.js";
import { ItemArmorData, ItemCharmData, ItemData, ItemIntimacyData, ItemMeritData, ItemQualityData, ItemRitualData, ItemSpellData, ItemWeaponData } from "./template/item-template.js";
import RollForm from "./apps/dice-roller.js";
import TemplateImporter from "./apps/template-importer.js";

Hooks.once('init', async function () {

  registerSettings();

  game.exaltedessence = {
    applications: {
      TraitSelector,
      ItemSearch,
      TemplateImporter,
    },
    entities: {
      ExaltedessenceActor,
      ExaltedessenceItem,
    },
    config: EXALTEDESSENCE,
    weaponAttack: weaponAttack,
    triggerItem: triggerItem,
    rollItemMacro: rollItemMacro,
    RollForm
  };

  CONFIG.Actor.dataModels = {
    character: CharacterData,
    npc: NpcData
  }

  CONFIG.Item.dataModels = {
    armor: ItemArmorData,
    charm: ItemCharmData,
    intimacy: ItemIntimacyData,
    item: ItemData,
    merit: ItemMeritData,
    ritual: ItemRitualData,
    spell: ItemSpellData,
    quality: ItemQualityData,
    weapon: ItemWeaponData,
  }

  // Define custom Entity classes
  CONFIG.EXALTEDESSENCE = EXALTEDESSENCE;
  CONFIG.statusEffects = EXALTEDESSENCE.statusEffects;
  CONFIG.Actor.documentClass = ExaltedessenceActor;
  CONFIG.Item.documentClass = ExaltedessenceItem;

  CONFIG.Combat.documentClass = ExaltedCombat;
  CONFIG.Combatant.documentClass = ExaltedCombatant;
  CONFIG.ui.combat = ExaltedCombatTracker;
  CONFIG.ActiveEffect.legacyTransferral = false;
  foundry.applications.apps.DocumentSheetConfig.registerSheet(ActiveEffect, "exaltedessence", ExaltedActiveEffectConfig, { makeDefault: true });

  CONFIG.ActiveEffect.sheetClass = ExaltedActiveEffectConfig;

  game.socket.on('system.exaltedessence', handleSocket);

  // Register sheet application classes
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet("exaltedessence", ExaltedEssenceActorSheet, { makeDefault: true });
  foundry.documents.collections.Items.unregisterSheet("core", foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet("exaltedessence", ExaltedessenceItemSheet, { makeDefault: true });

  // Pre-load templates
  foundry.applications.handlebars.loadTemplates([
    "systems/exaltedessence/templates/dialogues/ability-base.html",
    "systems/exaltedessence/templates/dialogues/add-roll-charm.html",
    "systems/exaltedessence/templates/dialogues/added-charm-list.html",
    "systems/exaltedessence/templates/actor/active-effects.html",
    "systems/exaltedessence/templates/actor/equipment-list.html",
    "systems/exaltedessence/templates/actor/charm-list.html",
    "systems/exaltedessence/templates/actor/intimacies-list.html",
    "systems/exaltedessence/templates/dialogues/accuracy-roll.html",
    "systems/exaltedessence/templates/dialogues/damage-roll.html",
    "systems/exaltedessence/templates/item/item-cost.html",
    "systems/exaltedessence/templates/item/item-roll-bonuses.html"
  ]);

  Combatant.prototype._getInitiativeFormula = function () {
    const actor = this.actor;
    var initDice = 0;
    if (this.actor.type === 'npc') {
      initDice = actor.system.pools.primary.value;
    }
    else {
      var highestAttributeNumber = 0;
      var highestAttribute = "force";
      for (let [name, attribute] of Object.entries(this.actor.system.attributes)) {
          if (attribute.value > highestAttributeNumber) {
              highestAttributeNumber = attribute.value;
              highestAttribute = name;
          }
      }
      initDice = Math.max(actor.system.abilities.close.value, actor.system.abilities.ranged.value) + highestAttributeNumber + 2;
    }
    return `${initDice}d10cs>=7ds>=10`;
  }

  foundry.dice.terms.Die.prototype.constructor.MODIFIERS["ds"] = "doubleSuccess";
  //add said function to the Die prototype
  foundry.dice.terms.Die.prototype.doubleSuccess = function (modifier) {
    const rgx = /(?:ds)([<>=]+)?([0-9]+)?/i;
    const match = modifier.match(rgx);
    if (!match) return false;
    let [comparison, target] = match.slice(1);
    comparison = comparison || "=";
    target = parseInt(target) ?? this.faces;
    for (let r of this.results) {
      let success = DiceTerm.compareResult(r.result, comparison, target);
      if (!r.success) {
        r.success = success;
      }
      r.count += (success ? 1 : 0);
    }
  }

  async function handleSocket({ type, id, data, addStatuses = [] }) {
    if (type === 'addOpposingCharm') {
      if(game.rollForm) {
        game.rollForm.addOpposingCharm(data);
      }
    }
    if (!game.user.isGM) return;

    // if the logged in user is the active GM with the lowest user id
    const isResponsibleGM = game.users
      .some(user => user.isGM && user.active);

    if (!isResponsibleGM) return;

    const targetedActor = game.canvas.tokens.get(id)?.actor;

    if (type === 'updateTargetData') {
      if (targetedActor) {
        await targetedActor.update(data);
        for (const status of addStatuses) {
          const effectExists = targetedActor.effects.find(e => e.statuses.has(status));
          if (!effectExists) {
            await game.canvas.tokens.get(id).toggleStatusEffect(status);
          }
        }
      }
    }

    if (type === 'removeOnslaught') {
      if (targetedActor) {
        const onslaught = targetedActor.effects.find(i => i.flags.exaltedessence?.statusId == "onslaught");
        if (onslaught) {
            onslaught.delete();
        }
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
  });

  Handlebars.registerHelper("enrichedHTMLItems", function (sheetData, type, itemID) {
    return sheetData.itemDescriptions[itemID];
  });
});

Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('ifNotEquals', function (arg1, arg2, options) {
  return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('healthCheck', function (health, type, options) {
  let healthLevels = options.data.root.system.health.levels;
  if (health < healthLevels.zero.value) {
    return '0'
  }
  else if (health < healthLevels.zero.value + healthLevels.one.value) {
    return '1'
  }
  else if (health < healthLevels.zero.value + healthLevels.one.value + healthLevels.two.value) {
    return '2'
  }
  return 'i'
});

$(document).ready(() => {
  const diceIconSelector = '#chat-controls .chat-control-icon .fa-dice-d20';

  $(document).on('click', diceIconSelector, ev => {
    ev.preventDefault();
    new RollForm(null, {classes: [" exaltedessence exaltedessence-dialog dice-roller"]}, {}, { rollType: 'base' }).render(true);
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
      const actorData = foundry.utils.foundry.utils.duplicate(combatant.actor);
      if (actorData.system.details.exalt === 'getimian') {
        if (actorData.system.settings.charmspendpool === 'still') {
          if(actorData.system.still.value < actorData.system.still.total) {
            actorData.system.still.value++;
          }
          else if(actorData.system.flowing.value < actorData.system.flowing.total) {
            actorData.system.flowing.value++;
          }
        }
        if (actorData.system.settings.charmspendpool === 'flowing' && actorData.system.flowing.value < actorData.system.flowing.total) {
          if(actorData.system.flowing.value < actorData.system.flowing.total) {
            actorData.system.flowing.value++;
          }
          else if(actorData.system.still.value < actorData.system.still.total) {
            actorData.system.still.value++;
          }
        }
      }
      else {
        if (actorData.system.motes.value < (actorData.system.motes.max - actorData.system.motes.committed)) {
          actorData.system.motes.value++;
        }
      }
      combatant.actor.update(actorData);
    }
  }
}));

Hooks.on("renderPause", function () {
  const iconSrc = game.settings.get("exaltedessence", "pauseIcon");
  document.querySelectorAll(".paused img").forEach(img => {
    img.src = `systems/exaltedessence/assets/pause/${iconSrc}.png`;
  });
});

Hooks.on("renderGamePause", function () {
  const iconSrc = game.settings.get("exaltedessence", "pauseIcon");
  document.querySelectorAll(".paused img").forEach(img => {
    img.src = `systems/exaltedessence/assets/pause/${iconSrc}.png`;
  });
});

// Hooks.on("renderActorDirectory", (app, html, data) => {
//   if (html instanceof jQuery) {
//     html = $(html)[0];
//   }
//   const button = document.createElement("button");
//   button.classList.add("template-import-button");
//   button.innerHTML = `<i class="fas fa-suitcase"></i> ${game.i18n.localize("ExEss.Import")}`;
//   html.querySelector(".header-actions").append(button);

//   html.querySelectorAll('.template-import-button').forEach(element => {
//     element.addEventListener('click', async (ev) => {
//       game.templateImporter = new TemplateImporter("qc").render(true);
//     });
//   });
// });

Hooks.on("renderItemDirectory", (app, html, data) => {
  if (html instanceof jQuery) {
    html = $(html)[0];
  }
  const button = document.createElement("button");
  button.classList.add("template-import-button");
  button.innerHTML = `<i class="fas fa-suitcase"></i> ${game.i18n.localize("ExEss.Import")}`;
  html.querySelector(".header-actions").append(button);

  html.querySelectorAll('.template-import-button').forEach(element => {
    element.addEventListener('click', async (ev) => {
      game.templateImporter = new TemplateImporter("charm").render(true);
    });
  });
});

Hooks.on("renderCompendiumDirectory", (app, html, data) => {
  if (html instanceof jQuery) {
    html = $(html)[0];
  }
  const button = document.createElement("button");
  button.classList.add("item-search-button");
  button.innerHTML = `<i class="fas fa-suitcase"></i> ${game.i18n.localize("ExEss.ItemSearch")}`;
  html.querySelector(".header-actions").append(button);


  html.querySelectorAll('.item-search-button').forEach(element => {
    element.addEventListener('click', async (ev) => {
      game.itemSearch.render(true)
    });
  });
})

Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (["Item", "savedRoll"].includes(data.type)) {
      createItemMacro(data, slot);
      return false;
    }
  });

  $("#chat-log").on("click", " .item-row", ev => {
    const li = $(ev.currentTarget).next();
    li.toggle("fast");
  });

  if (foundry.utils.isNewerVersion("1.0.0", game.settings.get("exaltedessence", "systemMigrationVersion"))) {
    for (let actor of game.actors) {
      try {
        let updateData = foundry.utils.deepClone(actor.toObject());
        updateData.system.details.animacolor = updateData.system.details.color;
        if (!foundry.utils.isEmpty(updateData)) {
          await actor.update(updateData, { enforceTypes: false });
        }
      } catch (error) {
        error.message = `Failed migration for Actor ${actor.name}: ${error.message} `;
        console.error(error);
      }
      await game.settings.set("exaltedessence", "systemMigrationVersion", game.system.version);
    }
  }

});

async function createItemMacro(data, slot) {
  if (data.type !== "Item" && data.type !== "savedRoll") return;
  if (data.type === "Item") {
    if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
      return ui.notifications.warn("You can only create macro buttons for owned Items");
    }
    const item = await Item.fromDropData(data);
    let command = `Hotbar.toggleDocumentSheet("${data.uuid}");`;
    if(item.type === 'weapon') {
      command = `//Swtich withering with (decisive, gambit) to roll different attack types\ngame.exaltedessence.weaponAttack("${data.uuid}", 'withering');`;
    }
    if(item.type === 'charm') {
      command = `//Will add this charm to any roll you have open and if opposed any roll another player has open\ngame.exaltedessence.triggerItem("${data.uuid}");`;
    }
    let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
    if (!macro) {
      if (item.type === 'weapon' || item.type === 'charm') {
        macro = await Macro.create({
          name: item.name,
          type: "script",
          img: item.img,
          command: command,
          flags: { "exaltedessence.itemMacro": true }
        });
      }
      else {
        const name = item.name || `Default`;
        macro = await Macro.create({
          name: `${game.i18n.localize("Display")} ${name}`,
          type: "script",
          img: item.img,
          command: command
        });
      }
      game.user.assignHotbarMacro(macro, slot);
    }
  }
  else {
    const command = `const formActor = await fromUuid("${data.actorId}");
        game.rollForm = new game.exaltedessence.RollForm(${data.actorId.includes('Token') ? 'formActor.actor' : 'formActor'}, {classes: [" exaltedessence exaltedessence-dialog dice-roller"]}, {}, { rollId: "${data.id}" }).render(true); `;
    const macro = await Macro.create({
      name: data.name,
      img: 'systems/exaltedessence/assets/icons/d10.svg',
      type: "script",
      command: command,
    });
    game.user.assignHotbarMacro(macro, slot);
  }
  return false;
}

function weaponAttack(itemUuid, attackType='withering') {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }
    game.rollForm = new RollForm(item.parent, {classes: [" exaltedessence exaltedessence-dialog dice-roller"]}, {}, { rollType: attackType, weapon: item.system }).render(true);
  });
}

function triggerItem(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }
    if(game.rollForm) {
      game.rollForm.addCharm(item);
    }
    if(item.system.diceroller.opposedbonuses.enabled) {
      game.socket.emit('system.exaltedessence', {
        type: 'addOpposingCharm',
        data: item,
      });
    }
  });
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

  
  async rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt) {
    const combatant = this.combatants.get(ids[0]);
    if (combatant.token.actor) {
      if (combatant.token.actor.type === "npc") {
        game.rollForm = await new RollForm(combatant.token.actor, {classes: [" exaltedessence exaltedessence-dialog dice-roller"]}, {}, { rollType: 'joinBattle', pool: 'primary' }).render(true);
      }
      else {
        game.rollForm = await new RollForm(combatant.token.actor, {classes: [" exaltedessence exaltedessence-dialog dice-roller"]}, {}, { rollType: 'joinBattle', ability: 'close'}).render(true);
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