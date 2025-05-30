// import {
//   DiceRollerDialogue
// } from "./dialogue-diceRoller.js";
import TraitSelector from "../apps/trait-selector.js";
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
    return foundry.utils.mergeObject(super.defaultOptions, {
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
    context.selects = CONFIG.EXALTEDESSENCE.selects;
    context.isNPC = actorData.type === 'npc';
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
      trait.cssClass = !foundry.utils.isEmpty(trait.selected) ? "" : "inactive";
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
        label: game.i18n.localize('ExEss.Stylings'),
        class: 'set-color',
        icon: 'fas fa-palette',
        onclick: (ev) => this.pickColor(ev),
      };
      buttons = [colorButton, ...buttons];
      const rollButton = {
        label: game.i18n.localize('ExEss.Roll'),
        class: 'roll-dice',
        icon: 'fas fa-dice-d10',
        onclick: () => this.actor.actionRoll({ rollType: 'base' }),
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
    html.find('.item-delete').click(async ev => {
      const deleteItem = await foundry.applications.api.DialogV2.confirm({
        window: { title: game.i18n.localize("ExEss.Delete") },
        content: "<p>Are you sure you want to delete this item?</p>",
        classes: [this.actor.getSheetBackground()],
        modal: true
      });
      if(deleteItem) {
        const li = $(ev.currentTarget).parents(".item");
        this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
        li.slideUp(200, () => this.render(false));
      }
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
      this.actor.actionRoll({ rollType: 'base' });
    });

    html.find('.rollAbility').mousedown(ev => {
      this.actor.actionRoll({ rollType: 'ability' });
    });

    html.find('.roll-ability').mousedown(ev => {
      var ability = $(ev.target).attr("data-ability");
      this.actor.actionRoll({ rollType: 'ability', ability: ability });
    });

    html.find('.roll-pool').mousedown(ev => {
      var pool = $(ev.target).attr("data-pool");
      this.actor.actionRoll({ rollType: 'ability', pool: pool });
    });

    html.find('#buildPower').mousedown(ev => {
      // buildResource(this.actor, 'power');
      this.actor.actionRoll({ rollType: 'buildPower' });
    });

    html.find('#focusWill').mousedown(ev => {
      // buildResource(this.actor, 'will');

      this.actor.actionRoll({ rollType: 'focusWill', 'ability': 'sagacity' });

    });

    html.find('#socialInfluence').mousedown(ev => {
      // socialInfluence(this.actor);
      this.actor.actionRoll({ rollType: 'social', 'ability': 'embassy' });
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
      this.actor.actionRoll({ rollType: rollType, weapon: item.system });

    });

    html.find('.weapon-icon').click(ev => {
      ev.stopPropagation();
      let item = this.actor.items.get($(ev.target.parentElement).attr("data-item-id"));
      let rollType = $(ev.target.parentElement).attr("data-roll-type");

      this.actor.actionRoll({ rollType: rollType, weapon: item.system });

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
      this.actor.actionRoll({ rollId: li.data("item-id") });
    });

    html.find('.delete-saved-roll').click(async ev => {
      let li = $(event.currentTarget).parents(".item");
      var key = li.data("item-id");
      const rollDeleteString = "system.savedRolls.-=" + key;

      const deleteConfirm = await foundry.applications.api.DialogV2.confirm({
        window: { title: game.i18n.localize('ExEss.Delete') },
        content: `<p>Delete Saved Roll?</p>`,
        classes: [this.actor.getSheetBackground()],
        modal: true
      });
      if (deleteConfirm) {
        this.actor.update({ [rollDeleteString]: null });
        ui.notifications.notify(`Saved Roll Deleted`);
      }
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
    const actorData = foundry.utils.duplicate(this.actor);
    actorData.system.settings.charmspendpool = type;
    this.actor.update(actorData);
  }

  _updateAnima(direction) {
    const actorData = foundry.utils.duplicate(this.actor);
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
    const actorData = foundry.utils.duplicate(this.actor);
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

    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("ExEss.CalculateHealth") },
      content: html,
      classes: [this.actor.getSheetBackground()],
      buttons: [{
        action: "choice",
        label: game.i18n.localize("ExEss.Save"),
        default: true,
        callback: (event, button, dialog) => button.form.elements
      }, {
        action: "cancel",
        label: game.i18n.localize("ExEss.Cancel"),
        callback: (event, button, dialog) => false
      }],
      submit: result => {
        if (result) {
          if(actorData.type === 'npc') {
            let health = result.health.value;
            this.actor.update({ [`system.health.levels`]: health });
            this.actor.update({ [`system.health.max`]: health });
          } else {
            let zero = result.zero.value;
            let one = result.one.value;
            let two = result.two.value;
            let healthData = {
              levels: {
                zero: {
                  value: zero,
                },
                one: {
                  value: one,
                },
                two: {
                  value: two,
                },
              },
              lethal: 0,
              aggravated: 0,
            }
            this.actor.update({ [`system.health`]: healthData });
          }

        }
      }
    }).render({ force: true });
  }

  async catchBreath() {
    const actorData = foundry.utils.duplicate(this.actor);
    actorData.system.anima.value = 0;
    actorData.system.motes.max = Math.min(15, actorData.system.essence.value * 2 + Math.floor((actorData.system.essence.value - 1) / 2) + 3);
    actorData.system.motes.value = Math.min(actorData.system.motes.value + Math.ceil(actorData.system.motes.max / 2), actorData.system.motes.max);
    this.actor.update(actorData);
    this._updateAnima("down");
  }

  async recoverHealth() {
    const actorData = foundry.utils.duplicate(this.actor);
    const data = actorData.system;
    data.health.lethal = 0;
    this.actor.update(actorData);
  }

  async showTags(type) {
    const template = type === "weapons" ? "systems/exaltedessence/templates/dialogues/weapon-tags.html" : "systems/exaltedessence/templates/dialogues/armor-tags.html";
    const html = await renderTemplate(template);

    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("ExEss.Tags"), resizable: true },
      content: html,
      buttons: [{ action: 'close', label: game.i18n.localize("ExEss.Close") }],
      classes: ['exaltedessence-dialog', this.actor.getSheetBackground()],
      position: {
        width: 500,
      },
    }).render(true);
  }

  async fullRest() {
    const actorData = foundry.utils.duplicate(this.actor);
    const data = actorData.system;
    data.anima.value = 0;
    data.motes.max = data.essence.value * 2 + Math.floor((data.essence.value - 1) / 2) + 3;
    data.motes.value = data.motes.max;
    this.actor.update(actorData);
  }

  async helpDialogue(type) {
    const template = "systems/exaltedessence/templates/dialogues/help-dialogue.html"
    const html = await renderTemplate(template, { 'type': type });
    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("ExEss.ReadMe"), resizable: true },
      content: html,
      buttons: [{ action: 'close', label: game.i18n.localize("ExEss.Close") }],
      classes: ['exaltedessence-dialog', this.actor.getSheetBackground()],
    }).render(true);
  }

  async pickColor() {
    const actorData = foundry.utils.duplicate(this.actor);
    const data = actorData.system;
    const template = "systems/exaltedessence/templates/dialogues/color-picker.html"
    const html = await renderTemplate(template, { 'color': data.details.color, animaColor: data.details.animacolor, 'initiativeIcon': this.actor.system.details.initiativeicon, 'initiativeIconColor': this.actor.system.details.initiativeiconcolor });

    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("ExEss.PickColor"), resizable: true },
      position: { height: 1000, width: 406 },
      content: html,
      classes: [this.actor.getSheetBackground(), 'overflow-scroll'],
      buttons: [{
        action: "choice",
        label: game.i18n.localize("ExEss.Save"),
        default: true,
        callback: (event, button, dialog) => button.form.elements
      }, {
        action: "cancel",
        label: game.i18n.localize("ExEss.Cancel"),
        callback: (event, button, dialog) => false
      }],
      submit: result => {
        if (result) {
          let color = result.color.value;
          let animaColor = result.animaColor.value;
          let initiativeIconColor = result.initiativeIconColor.value;
          let initiativeIcon = result.initiativeIcon.value;
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
    }).render({ force: true });
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
    // const fulls = Number(data[states['-']]) || 0
    // const halfs = Number(data[states['/']]) || 0

    // if (index < 0 || index > steps.length) {
    //   return
    // }

    // const allStates = ['', ...Object.keys(states)]
    // const currentState = allStates.indexOf(oldState)
    // if (currentState < 0) {
    //   return
    // }

    // const newState = allStates[(currentState + 1) % allStates.length]
    // steps[index].dataset.state = newState

    // if ((oldState !== '' && oldState !== '-') || (oldState !== '')) {
    //   data[states[oldState]] = Number(data[states[oldState]]) - 1
    // }

    // // If the step was removed we also need to subtract from the maximum.
    // if (oldState !== '' && newState === '') {
    //   data[states['-']] = Number(data[states['-']]) - 1
    // }

    // if (newState !== '') {
    //   data[states[newState]] = Number(data[states[newState]]) + Math.max(index + 1 - fulls - halfs, 1)
    // }

    const currentState = steps[index].dataset.state;
    if (steps[index].dataset.type) {
      if (currentState === '') {
        for (const step of steps) {
          if (step.dataset.state === '') {
            step.dataset.state = 'x';
            data['value'] = Number(data['value']) + 1;
            break;
          }
        }
      }
      else {
        for (const step of steps) {
          if (step.dataset.state === 'x') {
            step.dataset.state = '';
            data['value'] = Number(data['value']) - 1;
            break;
          }
        }
      }
    }
    else {
      if (currentState === '') {
        for (const step of steps) {
          if (step.dataset.state === '') {
            step.dataset.state = '/';
            data['lethal'] = Number(data['lethal']) + 1;
            break;
          }
        }
      }
      if (currentState === '/') {
        for (const step of steps) {
          if (step.dataset.state === '/') {
            step.dataset.state = '*';
            data['aggravated'] = Number(data['aggravated']) + 1;
            data['lethal'] = Number(data['lethal']) - 1;
            break;
          }
        }
      }
      if (currentState === 'x') {
        for (const step of steps) {
          if (step.dataset.state === 'x') {
            step.dataset.state = '';
            data['aggravated'] = Number(data['aggravated']) - 1;
            break;
          }
        }
      }
    }

    const newValue = Object.values(states).reduce(function (obj, k) {
      obj[k] = Number(data[k]) || 0
      return obj
    }, {})

    this._assignToActorField(fields, newValue)
  }

  _onDotCounterChange(event) {
    event.preventDefault()
    const actorData = foundry.utils.duplicate(this.actor)
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
    const actorData = foundry.utils.duplicate(this.actor)
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
    const actorData = foundry.utils.duplicate(this.actor)
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
    const actorData = foundry.utils.duplicate(this.actor)
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
    const actorData = foundry.utils.duplicate(this.actor)
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
    const data = foundry.utils.duplicate(header.dataset);
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
      type: CONST.CHAT_MESSAGE_STYLES.OTHER,
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
      type: CONST.CHAT_MESSAGE_STYLES.OTHER,
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

    const actorData = foundry.utils.duplicate(this.actor);

    let li = $(event.currentTarget).parents(".item");
    let item = this.actor.items.get(li.data("item-id"));

    let updateActive = null;

    if (item.system.active) {
      actorData.system.active = false;
      updateActive = false;
      if (item.system.cost?.motes) {
        if (actorData.system.details.exalt === 'getimian') {
          actorData.system[actorData.system.settings.charmspendpool].value += item.system.cost.committed;
        }
        actorData.system.motes.committed -= item.system.cost.committed;
      }
    } else {
      if (item.system.cost?.motes) {
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
        let totalHealth = actorData.type === 'character' ? 0 : actorData.system.health.levels;
        if(actorData.type === 'character') {
          for (let [key, healthLevel] of Object.entries(actorData.system.health.levels)) {
            totalHealth += healthLevel.value;
          }
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
