// import {
//   DiceRollerDialogue
// } from "./dialogue-diceRoller.js";
import TraitSelector from "../apps/trait-selector.js";
import { buildResource, openAbilityRollDialogue, openAttackDialogue, openRollDialogue, socialInfluence  } from "../apps/dice-roller.js";
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
      force: { name: 'ExEss.Force', visible: false, list: [] },
      finesse: { name: 'ExEss.Finesse', visible: false, list: [] },
      fortitude: { name: 'ExEss.Fortitude', visible: false, list: [] },
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
      other: { name: 'ExEss.Other', visible: false, list: [] },
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

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    // Token Configuration
    const canConfigure = game.user.isGM || this.actor.isOwner;
    if (this.options.editable && canConfigure) {
      if (this.actor.type != 'npc') {
        const colorButton = {
          label: game.i18n.localize('ExEss.DotColors'),
          class: 'set-color',
          icon: 'fas fa-palette',
          onclick: (ev) => this.pickColor(ev),
        };
        buttons = [colorButton, ...buttons];
      }
      const rollButton = {
        label: game.i18n.localize('ExEss.Roll'),
        class: 'roll-dice',
        icon: 'fas fa-dice',
        onclick: () => openRollDialogue(),
      };
      buttons = [rollButton, ...buttons];
    }
    return buttons;
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

    html.find('#calculate-health').mousedown(ev => {
      this.calculateHealth();
    });

    html.find('#color-picker').mousedown(ev => {
      this.pickColor();
    });

    html.find('#recoveryScene').mousedown(ev => {
      this.recoverHealth();
    });

    html.find('#catchBreath').mousedown(ev => {
      this.catchBreath();
    });

    html.find('#fullRest').mousedown(ev => {
      this.fullRest();
    });

    html.find('#rollDice').mousedown(ev => {
      openRollDialogue(this.actor);
    });

    html.find('#rollAbility').mousedown(ev => {
      openAbilityRollDialogue(this.actor);
    });

    html.find('.roll-ability').mousedown(ev => {
      var ability = $(ev.target).attr("data-ability");
      openAbilityRollDialogue(this.actor, ability);
    });

    html.find('.roll-pool').mousedown(ev => {
      var pool = $(ev.target).attr("data-pool");
      openAbilityRollDialogue(this.actor, pool);
    });

    html.find('#buildPower').mousedown(ev => {
      buildResource(this.actor, 'power');
    });

    html.find('#focusWill').mousedown(ev => {
      buildResource(this.actor, 'will');
    });

    html.find('#socialInfluence').mousedown(ev => {
      socialInfluence(this.actor);
    });    

    html.find('.roll-withering').mousedown(ev => {
      openAttackDialogue(this.actor, $(ev.target).attr("data-accuracy"), $(ev.target).attr("data-damage"), $(ev.target).attr("data-overwhelming"), $(ev.target).attr("data-weapontype"), false);
    });

    html.find('.roll-decisive').mousedown(ev => {
      openAttackDialogue(this.actor, $(ev.target).attr("data-accuracy"), $(ev.target).attr("data-damage"), $(ev.target).attr("data-overwhelming"), $(ev.target).attr("data-weapontype"), true);
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

    $(document.getElementById('chat-log')).on('click', '.chat-card', (ev) => {
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

  async calculateHealth() {
    let confirmed = false;
    const actorData = duplicate(this.actor);
    const data = actorData.data;
    let template;
    let html;

    if (actorData.type === 'npc') {
      template = "systems/exaltedessence/templates/dialogues/calculate-npc-health.html";
      html = await renderTemplate(template, { 'health': data.health.levels });
    }
    else {
      template = "systems/exaltedessence/templates/dialogues/calculate-health.html";
      html = await renderTemplate(template, { 'zero': data.health.levels.zero.value, 'one': data.health.levels.one.value, 'two': data.health.levels.two.value });
    }
    new Dialog({
      title: `Calculate Health`,
      content: html,
      buttons: {
        roll: { label: "Save", callback: () => confirmed = true },
        cancel: { label: "Cancel", callback: () => confirmed = false }
      },
      close: html => {
        if (confirmed) {
          data.health.lethal = 0;
          data.health.aggravated = 0;
          if (actorData.type === 'npc') {
            let health = parseInt(html.find('#health').val()) || 0;
            data.health.levels = health;
          }
          else {
            let zero = parseInt(html.find('#zero').val()) || 0;
            let one = parseInt(html.find('#one').val()) || 0;
            let two = parseInt(html.find('#two').val()) || 0;
            data.health.levels.zero.value = zero;
            data.health.levels.one.value = one;
            data.health.levels.two.value = two;
          }
          this.actor.update(actorData);
        }
      }
    }).render(true);
  }

  async catchBreath() {
    const actorData = duplicate(this.actor);
    const data = actorData.data;
    data.anima.value = 0;
    data.motes.total = data.essence.value * 2 + Math.floor((data.essence.value - 1) / 2) + 3;
    data.motes.value = Math.min(data.motes.value + Math.ceil(data.motes.total / 2), data.motes.total);
    this.actor.update(actorData);
    this._updateAnima("down");
  }

  async recoverHealth() {
    const actorData = duplicate(this.actor);
    const data = actorData.data;
    data.health.lethal = 0;
    this.actor.update(actorData);
  }

  async fullRest() {
    const actorData = duplicate(this.actor);
    const data = actorData.data;
    data.anima.value = 0;
    data.motes.total = data.essence.value * 2 + Math.floor((data.essence.value - 1) / 2) + 3;
    data.motes.value = data.motes.total;
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
      user: game.user.id,
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
