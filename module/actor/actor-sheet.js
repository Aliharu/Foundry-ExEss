// import {
//   DiceRollerDialogue
// } from "./dialogue-diceRoller.js";
import TraitSelector from "../apps/trait-selector.js";
import { RollForm } from "../apps/dice-roller.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";
import { prepareItemTraits } from "../item/item.js";
import { addDefensePenalty } from "./actor.js";

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
    this.options.classes = [...this.options.classes, this.getTypeSpecificCSSClasses()];
  }

  /**
 * Get the correct HTML template path to use for rendering this particular sheet
 * @type {String}
 */
  get template() {
    if (this.actor.type === "npc") return "systems/exaltedessence/templates/actor/npc-sheet.html";
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

  getTypeSpecificCSSClasses() {
    return `${game.settings.get("exaltedessence", "sheetStyle")}-background`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const context = super.getData();
    context.dtypes = ["String", "Number", "Boolean"];

    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.biographyHTML = await TextEditor.enrichHTML(context.system.biography, {
      secrets: this.document.isOwner,
      async: true
    });

    // Update traits
    this._prepareTraits(context.system.traits);

    // Prepare items.
    if (this.actor.type === 'character') {
      for (let attr of Object.values(context.system.attributes)) {
        attr.isCheckbox = attr.dtype === "Boolean";
      }
      this._prepareCharacterItems(context);
    }
    if (this.actor.type === 'npc') {
      this._prepareCharacterItems(context);
    }

    context.itemDescriptions = {};
    for (let item of this.actor.items) {
      context.itemDescriptions[item.id] = await TextEditor.enrichHTML(item.system.description, { async: true, secrets: this.actor.isOwner, relativeTo: item });
    }

    context.effects = prepareActiveEffectCategories(this.document.effects);

    return context;
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
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      else if (i.type === 'weapon') {
        prepareItemTraits('weapon', i);
        weapons.push(i);
      }
      else if (i.type === 'armor') {
        prepareItemTraits('armor', i);
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
        if (i.system.ability !== undefined) {
          charms[i.system.ability].list.push(i);
          charms[i.system.ability].visible = true;
        }
      }
      else if (i.type === 'spell') {
        if (i.system.circle !== undefined) {
          spells[i.system.circle].list.push(i);
          spells[i.system.circle].visible = true;
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
      trait.cssClass = !isEmpty(trait.selected) ? "" : "inactive";
    }
  }

  _getHeaderButtons() {
    let buttons = super._getHeaderButtons();
    // Token Configuration
    const canConfigure = game.user.isGM || this.actor.isOwner;
    if (this.options.editable && canConfigure) {
      const helpButton = {
        label: game.i18n.localize('ExEss.Help'),
        class: 'help-dialogue',
        icon: 'fas fa-question',
        onclick: () => this.helpDialogue(this.actor.type),
      };
      buttons = [helpButton, ...buttons];
      const colorButton = {
        label: game.i18n.localize('ExEss.DotColors'),
        class: 'set-color',
        icon: 'fas fa-palette',
        onclick: (ev) => this.pickColor(ev),
      };
      buttons = [colorButton, ...buttons];
      const rollButton = {
        label: game.i18n.localize('ExEss.Roll'),
        class: 'roll-dice',
        icon: 'fas fa-dice-d10',
        onclick: () => new RollForm(this.actor, {}, {}, { rollType: 'base' }).render(true),
      };
      buttons = [rollButton, ...buttons];
    }
    return buttons;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    this._setupDotCounters(html);
    this._setupSquareCounters(html);
    this._setupButtons(html);

    html.find('.item-row').click(ev => {
      const li = $(ev.currentTarget).next();
      li.toggle("fast");
    });

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
      let applyChanges = false;
      new Dialog({
        title: 'Delete?',
        content: 'Are you sure you want to delete this item?',
        buttons: {
          delete: {
            icon: '<i class="fas fa-check"></i>',
            label: 'Delete',
            callback: () => applyChanges = true
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: 'Cancel'
          },
        },
        default: "delete",
        close: html => {
          if (applyChanges) {
            const li = $(ev.currentTarget).parents(".item");
            this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
            li.slideUp(200, () => this.render(false));
          }
        }
      }, { classes: ["dialog", `${game.settings.get("exaltedessence", "sheetStyle")}-background`] }).render(true);
    });

    html.find('.add-defense-penalty').mousedown(ev => {
      addDefensePenalty(this.actor);
    });

    html.find('.show-weapon-tags').mousedown(ev => {
      this.showTags('weapons');
    });

    html.find('.show-armor-tags').mousedown(ev => {
      this.showTags('armor');
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
      new RollForm(this.actor, { event: ev }, {}, { rollType: 'base' }).render(true);
    });

    html.find('.rollAbility').mousedown(ev => {
      new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability' }).render(true);
    });

    html.find('.roll-ability').mousedown(ev => {
      var ability = $(ev.target).attr("data-ability");
      new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', ability: ability }).render(true);
    });

    html.find('.roll-pool').mousedown(ev => {
      var pool = $(ev.target).attr("data-pool");
      new RollForm(this.actor, { event: ev }, {}, { rollType: 'ability', pool: pool }).render(true);
    });

    html.find('#buildPower').mousedown(ev => {
      // buildResource(this.actor, 'power');
      new RollForm(this.actor, { event: ev }, {}, { rollType: 'buildPower' }).render(true);
    });

    html.find('#focusWill').mousedown(ev => {
      // buildResource(this.actor, 'will');
      new RollForm(this.actor, { event: ev }, {}, { rollType: 'focusWill', 'ability': 'sagacity' }).render(true);
    });

    html.find('#socialInfluence').mousedown(ev => {
      // socialInfluence(this.actor);
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: 'social', 'ability': 'embassy' }).render(true);
    });

    html.find('.set-pool-flowing').mousedown(ev => {
      this.setSpendPool('flowing');
    });


    html.find('.set-pool-still').mousedown(ev => {
      this.setSpendPool('still');
    });


    html.find('.weapon-roll').click(ev => {
      let item = this.actor.items.get($(ev.target).attr("data-item-id"));
      let rollType = $(ev.target).attr("data-roll-type");
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: rollType, weapon: item.system }).render(true);
    });

    html.find('.weapon-icon').click(ev => {
      ev.stopPropagation();
      let item = this.actor.items.get($(ev.target.parentElement).attr("data-item-id"));
      let rollType = $(ev.target.parentElement).attr("data-roll-type");
      game.rollForm = new RollForm(this.actor, { event: ev }, {}, { rollType: rollType, weapon: item.system }).render(true);
    });

    html.find('.collapsable').click(ev => {
      let type = $(ev.currentTarget).data("type");
      const li = $(ev.currentTarget).next();
      if (type) {
        this.actor.update({ [`system.collapse.${type}`]: !li.is(":hidden") });
      }
    });

    html.find('#anima-up').click(ev => {
      this._updateAnima("up");
    });

    html.find('#anima-down').click(ev => {
      this._updateAnima("down");
    });

    html.find('.data-chat').click(ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this._displayDataChat(ev);
    });

    html.find('.item-chat').click(ev => {
      this._displayCard(ev);
    });

    html.find('.item-spend').click(ev => {
      this._spendItem(ev);
    });

    html.find('.add-opposing-charm').click(ev => {
      this._addOpposingCharm(ev);
    });

    html.find('.saved-roll').click(ev => {
      let li = $(event.currentTarget).parents(".item");
      new RollForm(this.actor, { event: ev }, {}, { rollId: li.data("item-id") }).render(true);
    });

    html.find('.delete-saved-roll').click(ev => {
      let li = $(event.currentTarget).parents(".item");
      var key = li.data("item-id");
      const rollDeleteString = "system.savedRolls.-=" + key;

      let deleteConfirm = new Dialog({
        title: "Delete",
        content: "Delete Saved Roll?",
        buttons: {
          Yes: {
            icon: '<i class="fa fa-check"></i>',
            label: "Delete",
            callback: dlg => {
              this.actor.update({ [rollDeleteString]: null });
              ui.notifications.notify(`Saved Roll Deleted`);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel"
          },
        },
        default: 'Yes'
      });
      deleteConfirm.render(true);
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
      let savedRollhandler = ev => this._onDragSavedRoll(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        if (li.classList.contains("saved-roll-row")) {
          li.addEventListener("dragstart", savedRollhandler, false);
        }
        else {
          li.addEventListener("dragstart", handler, false);
        }
      });
    }
  }

  async _onDragSavedRoll(ev) {
    const li = ev.currentTarget;
    if (ev.target.classList.contains("content-link")) return;
    const savedRoll = this.actor.system.savedRolls[li.dataset.itemId];
    ev.dataTransfer.setData("text/plain", JSON.stringify({ actorId: this.actor.uuid, type: 'savedRoll', id: li.dataset.itemId, name: savedRoll.name }));
  }

  async setSpendPool(type) {
    const actorData = duplicate(this.actor);
    actorData.system.settings.charmspendpool = type;
    this.actor.update(actorData);
  }

  _updateAnima(direction) {
    const actorData = duplicate(this.actor);
    if (direction === "up") {
      if (actorData.system.anima.value < 10) {
        actorData.system.anima.value++;
      }
    }
    else {
      if (actorData.system.anima.value > 0) {
        actorData.system.anima.value--;
      }
    }
    this.actor.update(actorData);
  }

  async calculateHealth() {
    let confirmed = false;
    const actorData = duplicate(this.actor);
    const data = actorData.system;
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
            data.health.max = health;
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
    }, { classes: ["dialog", `${game.settings.get("exaltedessence", "sheetStyle")}-background`] }).render(true);
  }

  async catchBreath() {
    const actorData = duplicate(this.actor);
    const data = actorData.system;
    data.anima.value = 0;
    data.motes.max = data.essence.value * 2 + Math.floor((data.essence.value - 1) / 2) + 3;
    data.motes.value = Math.min(data.motes.value + Math.ceil(data.motes.max / 2), data.motes.max);
    this.actor.update(actorData);
    this._updateAnima("down");
  }

  async recoverHealth() {
    const actorData = duplicate(this.actor);
    const data = actorData.system;
    data.health.lethal = 0;
    this.actor.update(actorData);
  }

  async showTags(type) {
    const template = type === "weapons" ? "systems/exaltedessence/templates/dialogues/weapon-tags.html" : "systems/exaltedessence/templates/dialogues/armor-tags.html";
    const html = await renderTemplate(template);
    new Dialog({
      title: `Tags`,
      content: html,
      buttons: {
        cancel: { label: "Close" }
      }
    }, { classes: ["dialog", `${game.settings.get("exaltedessence", "sheetStyle")}-background`] }).render(true);
  }

  async fullRest() {
    const actorData = duplicate(this.actor);
    const data = actorData.system;
    data.anima.value = 0;
    data.motes.max = data.essence.value * 2 + Math.floor((data.essence.value - 1) / 2) + 3;
    data.motes.value = data.motes.max;
    this.actor.update(actorData);
  }

  async helpDialogue(type) {
    let confirmed = false;
    const template = "systems/exaltedessence/templates/dialogues/help-dialogue.html"
    const html = await renderTemplate(template, { 'type': type });
    new Dialog({
      title: `ReadMe`,
      content: html,
      buttons: {
        cancel: { label: "Close", callback: () => confirmed = false }
      }
    }, { classes: ["dialog", `${game.settings.get("exaltedessence", "sheetStyle")}-background`] }).render(true);
  }

  async pickColor() {
    let confirmed = false;
    const actorData = duplicate(this.actor);
    const data = actorData.system;
    const template = "systems/exaltedessence/templates/dialogues/color-picker.html"
    const html = await renderTemplate(template, { 'color': data.details.color, animaColor: data.details.animacolor, 'initiativeIcon': this.actor.system.details.initiativeicon, 'initiativeIconColor': this.actor.system.details.initiativeiconcolor });
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
          let animaColor = html.find('#animaColor').val();
          let initiativeIconColor = html.find('#initiativeIconColor').val();
          let initiativeIcon = html.find('#initiativeIcon').val();

          if (isColor(color)) {
            this.actor.update({ [`system.details.color`]: color });
          }
          if (isColor(animaColor)) {
            this.actor.update({ [`system.details.animacolor`]: animaColor });
          }
          if (isColor(initiativeIconColor)) {
            this.actor.update({ [`system.details.initiativeiconcolor`]: initiativeIconColor });
          }
          this.actor.update({ [`system.details.initiativeicon`]: initiativeIcon });
        }
      }
    }, { classes: ["dialog", `${game.settings.get("exaltedessence", "sheetStyle")}-background`] }).render(true);
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
        $(this).css("background-color", actorData.system.details.color);
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
          i.system.points = value
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
          $(this).css("background-color", actorData.system.details.color);
        }
      })
    })
    html.find('.resource-value-static').each(function () {
      const value = Number(this.dataset.value)
      $(this).find('.resource-value-static-step').each(function (i) {
        if (i + 1 <= value) {
          $(this).addClass('active')
          $(this).css("background-color", actorData.system.details.color);
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

  _setupButtons(html) {
    const actorData = duplicate(this.actor)
    html.find('.set-pool-flowing').each(function (i) {
      if (actorData.system.settings.charmspendpool === 'flowing') {
        $(this).css("color", '#F9B516');
      }
    });
    html.find('.set-pool-still').each(function (i) {
      if (actorData.system.settings.charmspendpool === 'still') {
        $(this).css("color", '#F9B516');
      }
    });
  }

  _toggleAugment(event) {
    event.preventDefault()
    const element = event.currentTarget
    const attribute = element.dataset.name
    const actorData = duplicate(this.actor)
    var augStatus = actorData.system.attributes[attribute].aug;
    actorData.system.attributes[attribute].aug = !augStatus;
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
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

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
      let roll = new Roll(dataset.roll, this.actor.system);
      let label = dataset.label ? `Rolling ${dataset.label}` : '';
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }

  async _displayDataChat(event) {
    let type = $(event.currentTarget).data("type");
    const token = this.actor.token;
    var content = '';
    var title = 'Advantage';
    switch (type) {
      case "passive":
        content = this.actor.system.anima.passive;
        title = "Passive";
        break;
      case "active":
        content = this.actor.system.anima.active;
        title = "Active";
        break;
      case "iconic":
        content = this.actor.system.anima.iconic;
        title = "Iconic";
        break;
      case "advantage1":
        content = this.actor.system.advantages.one;
        break;
      case "advantage2":
        content = this.actor.system.advantages.two;
        break;
      case "majorVirtue":
        content = this.actor.system.details.majorvirtue;
        title = "Major Virtue";
        break;
      case "minorVirtue":
        content = this.actor.system.details.minorvirtue;
        title = "Minor Virtue";
        break;
    }
    const templateData = {
      actor: this.actor,
      tokenId: token?.uuid || null,
      content: content,
      title: title,
    };
    const html = await renderTemplate("systems/exaltedessence/templates/chat/exalt-ability-card.html", templateData);

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
      item: item,
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

  _addOpposingCharm(event) {
    event.preventDefault();
    event.stopPropagation();

    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));

    if (game.rollForm) {
      game.rollForm.addOpposingCharm(item);
    }

    game.socket.emit('system.exaltedessence', {
      type: 'addOpposingCharm',
      data: item,
    });
  }

  _spendItem(event) {
    event.preventDefault();
    event.stopPropagation();

    const actorData = duplicate(this.actor);

    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));

    let updateActive = null;

    if (item.system.active) {
      actorData.system.active = false;
      updateActive = false;
      if (item.type === 'charm') {
        if (actorData.system.details.exalt === 'getimian') {
          actorData.system[actorData.system.settings.charmspendpool].value += item.system.cost.committed;
        }
        actorData.system.motes.committed -= item.system.cost.committed;
      }
    } else {
      if (item.type === 'charm') {
        if (actorData.system.details.exalt === 'getimian') {
          if (actorData.system.settings.charmspendpool === 'still') {
            actorData.system.still.value = Math.max(0, actorData.system.still.value - item.system.cost.motes - item.system.cost.committed + item.system.gain.motes);
          }
          if (actorData.system.settings.charmspendpool === 'flowing') {
            actorData.system.flowing.value = Math.max(0, actorData.system.flowing.value - item.system.cost.motes - item.system.cost.committed + item.system.gain.motes);
          }
        }
        else {
          actorData.system.motes.value = Math.max(0, actorData.system.motes.value - item.system.cost.motes - item.system.cost.committed + item.system.gain.motes);
        }
        actorData.system.motes.committed += item.system.cost.committed;
        actorData.system.stunt.value = Math.max(0, actorData.system.stunt.value - item.system.cost.stunt);
        actorData.system.power.value = Math.max(0, actorData.system.power.value - item.system.cost.power + item.system.gain.power);
        actorData.system.anima.value = Math.max(0, actorData.system.anima.value - item.system.cost.anima + item.system.gain.anima);
        let totalHealth = 0;
        for (let [key, health_level] of Object.entries(actorData.system.health.levels)) {
          totalHealth += health_level.value;
        }
        actorData.system.health.lethal = Math.min(totalHealth - actorData.system.health.aggravated, actorData.system.health.lethal + item.system.cost.health);
        if (actorData.system.health.lethal > 0) {
          actorData.system.health.lethal = Math.max(0, actorData.system.health.lethal - item.system.gain.health);
        }
      }
      if (item.type === 'spell') {
        actorData.system.will.value = Math.max(0, actorData.system.will.value - item.system.cost);
      }
      if(item.type === 'ritual') {
        actorData.system.will.value += item.system.will;
      }

      if (item.system.activatable) {
        actorData.system.active = true;
        updateActive = true;
      }
    }
    this.actor.update(actorData);

    if (updateActive !== null) {
      item.update({
        [`system.active`]: updateActive,
      });
      for (const effect of this.actor.allApplicableEffects()) {
        if (effect._sourceName === item.name) {
          effect.update({ disabled: !updateActive });
        }
      }
      for (const effect of item.effects) {
        effect.update({ disabled: !updateActive });
      }
    }
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
