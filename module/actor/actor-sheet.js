// import {
//   DiceRollerDialogue
// } from "./dialogue-diceRoller.js";
import TraitSelector from "../apps/trait-selector.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";
import { prepareItemTraits } from "../item/item.js";
import { isColor, parseCounterStates, toggleDisplay } from "../utils/utils.js";
import { addDefensePenalty } from "./actor.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class ExaltedEssenceActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  constructor(options = {}) {
    super(options);
    this.#dragDrop = this.#createDragDropHandlers();
    this.collapseStates = {
      charm: {},
      spell: {},
    }
  }

  static DEFAULT_OPTIONS = {
    window: {
      title: "Actor Sheet",
      resizable: true,
      controls: [
        {
          icon: 'fa-solid fa-question',
          label: "Help",
          action: "helpDialogue",
        },
        {
          icon: 'fa-solid fa-palette',
          label: "ExEss.Stylings",
          action: "pickColor",
        },
        {
          icon: 'fa-solid fa-dice-d10',
          label: "ExEss.Roll",
          action: "baseRoll",
        },
      ]
    },
    position: { width: 800, height: 1026 },
    classes: ["exaltedessence", "sheet", "actor"],
    actions: {
      onEditImage: this._onEditImage,
      helpDialogue: this.helpDialogue,
      pickColor: this.pickColor,
      baseRoll: this.baseRoll,
      createItem: this.createItem,
      itemAction: this.itemAction,
      savedRollAction: this.savedRollAction,
      makeActionRoll: this.makeActionRoll,
      rollAction: this.rollAction,
      displayDataChat: this._displayDataChat,
      showDialog: this.showDialog,
      calculateHealth: this.calculateHealth,
      recoverHealth: this.recoverHealth,
      dotCounterChange: this._onDotCounterChange,
      squareCounterChange: this._onSquareCounterChange,
      effectControl: this.effectControl,
      toggleCollapse: this.toggleCollapse,
      toggleAugment: this._toggleAugment,
      updateDefensePenalty: this.updateDefensePenalty,
      setSpendPool: this.setSpendPool,
      updateAnima: this.updateAnima,
      editTraits: this.editTraits,
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    form: {
      submitOnChange: true,
    },
  };

  get title() {
    return `${game.i18n.localize(this.actor.name)}`
  }

  static PARTS = {
    header: {
      template: "systems/exaltedessence/templates/actor/actor-header.html",
    },
    tabs: { template: 'systems/exaltedessence/templates/dialogues/tabs.html' },
    stats: {
      template: "systems/exaltedessence/templates/actor/stats-tab.html",
    },
    advancement: {
      template: "systems/exaltedessence/templates/actor/advancement-tab.html",
    },
    charms: {
      template: "systems/exaltedessence/templates/actor/charms-tab.html",
    },
    intimacies: {
      template: "systems/exaltedessence/templates/actor/intimacies-tab.html",
    },
    advantages: {
      template: "systems/exaltedessence/templates/actor/advantages-tab.html",
    },
    effects: {
      template: "systems/exaltedessence/templates/actor/actor-effects-tab.html",
    },
    biography: {
      template: "systems/exaltedessence/templates/actor/biography-tab.html",
    },
    limited: {
      template: "systems/exaltedessence/templates/actor/limited-tab.html",
    }
  };

  _initializeApplicationOptions(options) {
    options.classes = [options.document.getSheetBackground(), "exaltedessence", "sheet", "actor"];
    return super._initializeApplicationOptions(options);
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    if (this.document.limited) {
      options.parts = ['header', 'limited'];
    } else {
      options.parts = ['header', 'tabs', 'stats', 'charms', 'effects', 'intimacies'];
      // // Control which parts show based on document subtype
      switch (this.document.type) {
        case 'character':
          options.parts.push('advantages', 'advancement', 'biography');
          break;
        case 'npc':
          options.parts.push('biography');
          break;
      }
    }

  }

  async _prepareContext(_options) {
    const context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      dtypes: ["String", "Number", "Boolean"],
      // Add the actor document.
      actor: this.actor,
      // Add the actor's data to context.data for easier access, as well as flags.
      system: this.actor.system,
      flags: this.actor.flags,
      config: CONFIG.EXALTEDESSENCE,
      isNPC: this.actor.type === 'npc',
      collapseStates: this.collapseStates,
      selects: CONFIG.EXALTEDESSENCE.selects,
      isExalt: this.actor.type === 'character' || this.actor.system.creaturetype === 'exalt'
    };

    if (this.document.limited) {
      this.tabGroups['primary'] = 'limited';
    }

    if (!this.tabGroups['primary']) this.tabGroups['primary'] = 'stats';
    const tabs = [{
      id: 'stats',
      group: 'primary',
      label: 'ExEss.Stats',
      cssClass: this.tabGroups['primary'] === 'stats' ? 'active' : '',
    },
    {
      id: 'charms',
      group: 'primary',
      label: 'ExEss.Charms',
      cssClass: this.tabGroups['primary'] === 'charms' ? 'active' : '',
    },
    {
      id: 'effects',
      group: 'primary',
      label: 'ExEss.Effects',
      cssClass: this.tabGroups['primary'] === 'effects' ? 'active' : '',
    },
    {
      id: 'intimacies',
      group: 'primary',
      label: 'ExEss.Intimacies',
      cssClass: this.tabGroups['primary'] === 'intimacies' ? 'active' : '',
    },
    ];
    if (this.actor.type === 'character') {
      tabs.push({
        id: "advantages",
        group: "primary",
        label: "ExEss.Advantages",
        cssClass: this.tabGroups['primary'] === 'advantages' ? 'active' : '',
      },
        {
          id: "advancement",
          group: "primary",
          label: "ExEss.Advancement",
          cssClass: this.tabGroups['primary'] === 'advancement' ? 'active' : '',
        });
    }
    tabs.push({
      id: "biography",
      group: "primary",
      label: "ExEss.Description",
      cssClass: this.tabGroups['primary'] === 'biography' ? 'active' : '',
    });
    if (this.document.limited) {
      tabs.push({
        id: "limited",
        group: "primary",
        label: "ExEss.Description",
        cssClass: this.tabGroups['primary'] === 'limited' ? 'active' : '',
      });
    }
    context.tabs = tabs;

    context.enrichedBiography = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.biography,
      {
        // Whether to show secret blocks in the finished html
        secrets: this.document.isOwner,
        // Data to fill in for inline rolls
        rollData: this.actor.getRollData(),
        // Relative UUID resolution
        relativeTo: this.actor,
      }
    );

    // Update traits
    this._prepareTraits(context.system.traits);

    // Prepare items.
    if (this.actor.type === 'character') {
      context.enrichedMilestoneTriggers = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
        this.actor.system.milestones.triggers,
        {
          // Whether to show secret blocks in the finished html
          secrets: this.document.isOwner,
          // Data to fill in for inline rolls
          rollData: this.actor.getRollData(),
          // Relative UUID resolution
          relativeTo: this.actor,
        }
      );
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
      context.itemDescriptions[item.id] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true, secrets: this.actor.isOwner, relativeTo: item });
    }

    context.effects = prepareActiveEffectCategories(this.document.effects);
    context.tab = this.tabGroups['primary'];

    return context;
  }

  async _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
    this._setupDotCounters(this.element);
    this._setupSquareCounters(this.element);
    this._setupButtons(this.element);
    await super._onRender(context, options);
    this.#disableOverrides();
    if (!this.isEditable) return;
  }

  /**
* Disables inputs subject to active effects.
*/
  #disableOverrides() {
    const flatOverrides = foundry.utils.flattenObject(this.actor.overrides);
    for (const override of Object.keys(flatOverrides)) {
      const input = this.element.querySelector(`[name="${override}"]`);
      if (input) {
        input.disabled = true;
      }
    }
  }


  async _preparePartContext(partId, context) {
    context.tab = context.tabs.find(item => item.id === partId);
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
    const actorData = this.actor;

    // Initialize containers.
    const gear = [];
    const weapons = [];
    const armor = [];
    const merits = [];
    const qualities = [];
    let intimacies = [];
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
    for (let i of this.document.items) {
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

    if (this.document.limited) {
      intimacies = intimacies.filter(intimacy => intimacy.system.visible);
    }

    for (const s of Object.values(spells)) {
      s.list.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    }

    for (const c of Object.values(charms)) {
      c.list.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    }

    // Assign and return
    actorData.gear = gear.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    actorData.weapons = weapons.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    actorData.armor = armor.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    actorData.merits = merits.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    actorData.qualities = qualities.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    actorData.rituals = rituals.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    actorData.intimacies = intimacies.sort((a, b) => (a.sort || 0) - (b.sort || 0));
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

  static updateDefensePenalty() {
    addDefensePenalty(this.actor);
  }

  static async setSpendPool(event, target) {
    this.actor.update({ [`system.settings.charmspendpool`]: target.dataset.pooltype });
  }

  static updateAnima(event, target) {
    this.actor.updateAnima(target.dataset.direction);
  }

  _updateAnima(direction) {
    this.actor.update({ [`system.anima.value`]: direction === 'up' ? Math.min(10, this.actor.system.anima.value + 1) : Math.max(0, this.actor.system.anima.value - 1) });
  }

  /**
* Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
* @param {Event} event   The click event which originated the selection
* @private
*/
  static editTraits(event, target) {
    event.preventDefault();
    const label = target.parentElement.querySelector("label");
    const choices = CONFIG.EXALTEDESSENCE[target.dataset.options];
    const options = { name: target.dataset.target, title: label.innerText, choices };
    return new TraitSelector(this.actor, options).render(true);
  }

  static async calculateHealth() {
    let confirmed = false;
    const actorData = foundry.utils.duplicate(this.actor);
    const data = actorData.system;
    let template;
    let html;

    if (actorData.type === 'npc') {
      template = "systems/exaltedessence/templates/dialogues/calculate-npc-health.html";
      html = await foundry.applications.handlebars.renderTemplate(template, { 'health': data.health.levels });
    }
    else {
      template = "systems/exaltedessence/templates/dialogues/calculate-health.html";
      html = await foundry.applications.handlebars.renderTemplate(template, { 'zero': data.health.levels.zero.value, 'one': data.health.levels.one.value, 'two': data.health.levels.two.value });
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
          if (actorData.type === 'npc') {
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

  static async recoverHealth(event, target) {
    const recoveryType = target.dataset.recoverytype;
    const actorData = foundry.utils.duplicate(this.actor);
    if (recoveryType === 'catchBreath') {
      this.actor.catchBreath();
    }
    if (recoveryType === 'fullRest') {
      this.actor.fullRest();
    }
    if (recoveryType === 'recoveryScene') {
      const data = actorData.system;
      data.health.lethal = 0;
      this.actor.update(actorData);
    }
  }

  async showTags(type) {
    const template = type === "weapons" ? "systems/exaltedessence/templates/dialogues/weapon-tags.html" : "systems/exaltedessence/templates/dialogues/armor-tags.html";
    const html = await foundry.applications.handlebars.renderTemplate(template);

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

  /**
 * Handle changing a Document's image.
 *
 * @param {PointerEvent} event   The originating click event
 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
 * @returns {Promise}
 * @protected
 */
  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } =
      this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
      {};
    const fp = new foundry.applications.apps.FilePicker.implementation({
      current,
      type: 'image',
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 40,
      left: this.position.left + 10,
    });
    return fp.browse();
  }

  static async helpDialogue(type) {
    const template = "systems/exaltedessence/templates/dialogues/help-dialogue.html"
    const html = await foundry.applications.handlebars.renderTemplate(template, { 'type': type });
    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("ExEss.ReadMe"), resizable: true },
      content: html,
      buttons: [{ action: 'close', label: game.i18n.localize("ExEss.Close") }],
      classes: ['exaltedessence-dialog', this.actor.getSheetBackground()],
    }).render(true);
  }

  static async pickColor() {
    const actorData = foundry.utils.duplicate(this.actor);
    const data = actorData.system;
    const template = "systems/exaltedessence/templates/dialogues/color-picker.html"
    const html = await foundry.applications.handlebars.renderTemplate(template, { 'color': data.details.color, animaColor: data.details.animacolor, 'initiativeIcon': this.actor.system.details.initiativeicon, 'initiativeIconColor': this.actor.system.details.initiativeiconcolor });

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


  static async baseRoll() {
    this.actor.actionRoll({ rollType: 'base' })
  }

  static _onSquareCounterChange(event, target) {
    event.preventDefault()
    const index = Number(target.dataset.index);
    const parent = target.parentNode;
    const data = parent.dataset;
    const states = parseCounterStates(data.states);
    const fields = data.name.split('.');
    const steps = parent.querySelectorAll('.resource-counter-step');

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

  static effectControl(event, target) {
    onManageActiveEffect(target, this.actor);
  }

  static toggleCollapse(event, target) {
    const collapseType = target.dataset.collapsetype;
    const itemType = target.dataset.itemtype;
    if (collapseType === 'itemSection') {
      const li = target.nextElementSibling;
      if (itemType && li.getAttribute('id')) {
        this.collapseStates[itemType][li.getAttribute('id')] = (li.offsetWidth || li.offsetHeight || li.getClientRects().length);
      }
    }
    if (collapseType === 'anima') {
      const animaType = target.dataset.type;
      const li = target.nextElementSibling;
      this.actor.update({ [`system.collapse.${animaType}`]: (li.offsetWidth || li.offsetHeight || li.getClientRects().length) });
    }

    toggleDisplay(target);
  }

  static _onDotCounterChange(event, target) {
    const color = this.actor.system.details.color;
    const index = Number(target.dataset.index);
    const itemID = target.dataset.id;

    const parent = target.parentNode;
    const fieldStrings = parent.dataset.name;
    const fields = fieldStrings.split('.');

    const steps = parent.querySelectorAll('.resource-value-step');

    if (index < 0 || index > steps.length) {
      return;
    }

    steps.forEach(step => {
      step.classList.remove('active');
      step.style.backgroundColor = ''; // Clear previous color
    });

    steps.forEach((step, i) => {
      if (i <= index) {
        step.classList.add('active');
        step.style.backgroundColor = color;
      }
    });
    if (target.dataset.id) {
      const item = this.actor.items.get(target.dataset.id);
      let newVal = index + 1;
      if (index === 0 && item.system.points === 1) {
        newVal = 0;
      }
      if (item) {
        this.actor.updateEmbeddedDocuments('Item', [
          {
            _id: target.dataset.id,
            system: {
              points: newVal,
            },
          }
        ]);
      }
    }
    else {
      this._assignToActorField(fields, index + 1);
    }
  }

  _assignToActorField(fields, value) {
    const actorData = foundry.utils.duplicate(this.actor)
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

  _setupDotCounters(element) {
    const actorData = foundry.utils.duplicate(this.actor)
    // Handle .resource-value
    element.querySelectorAll('.resource-value').forEach(resourceEl => {
      const value = Number(resourceEl.dataset.value);
      const steps = resourceEl.querySelectorAll('.resource-value-step');
      steps.forEach((stepEl, i) => {
        if (i + 1 <= value) {
          stepEl.classList.add('active');
          stepEl.style.backgroundColor = actorData.system.details.color;
        }
      });
    });

    // Handle .resource-value-static
    element.querySelectorAll('.resource-value-static').forEach(resourceEl => {
      const value = Number(resourceEl.dataset.value);
      const steps = resourceEl.querySelectorAll('.resource-value-static-step');
      steps.forEach((stepEl, i) => {
        if (i + 1 <= value) {
          stepEl.classList.add('active');
          stepEl.style.backgroundColor = actorData.system.details.color;
        }
      });
    });
  }

  _setupSquareCounters(element) {
    element.querySelectorAll('.resource-counter').forEach(counterEl => {
      const data = counterEl.dataset
      const states = parseCounterStates(data.states)

      const fulls = Number(data[states['-']]) || 0
      const halfs = Number(data[states['/']]) || 0
      const crossed = Number(data[states.x]) || 0

      const values = new Array(halfs + crossed)

      values.fill('/', 0, halfs)
      values.fill('x', halfs, halfs + crossed)

      const steps = counterEl.querySelectorAll('.resource-counter-step');
      steps.forEach(step => {
        const index = Number(step.dataset.index);
        step.dataset.state = index < values.length ? values[index] : '';
      });
    })
  }

  _setupButtons(element) {
    element.querySelectorAll('.flowing-pool').forEach(el => {
      if (this.actor.system.settings.charmspendpool === 'flowing') {
        el.style.color = '#F9B516';
      }
    });

    element.querySelectorAll('.still-pool').forEach(el => {
      if (this.actor.system.settings.charmspendpool === 'still') {
        el.style.color = '#F9B516';
      }
    });
  }

  static _toggleAugment(event, target) {
    event.preventDefault();
    const attribute = target.dataset.name;
    this.actor.update({
      [`system.attributes.${attribute}.aug`]: !this.actor.system.attributes[attribute].aug,
    });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  static createItem(event, target) {
    event.preventDefault();
    event.stopPropagation();
    // Get the type of item to create.
    const type = target.dataset.type;
    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(target.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // if (type === 'charm') {
    //   if (Object.keys(CONFIG.EXALTEDESSENCE.exaltcharmtypes).includes(this.actor.system.details.exalt)) {
    //     itemData.system.charmtype = this.actor.system.details.exalt;
    //   }
    // }
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  static async itemAction(event, target) {
    event.preventDefault();
    event.stopPropagation();
    const doc = this._getEmbeddedDocument(target);
    const actionType = target.dataset.actiontype;
    if (!doc) {
      if (actionType === 'craftSimpleProject') {
        this.actor.actionRoll(
          { rollType: 'simpleCraft', ability: "craft" }
        );
      }
      return;
    }
    switch (actionType) {
      case 'editItem':
        doc.sheet.render(true);
        break;
      case 'deleteItem':
        const applyChanges = await foundry.applications.api.DialogV2.confirm({
          window: { title: game.i18n.localize("ExEss.Delete") },
          content: "<p>Are you sure you want to delete this item?</p>",
          classes: [this.actor.getSheetBackground()],
          modal: true
        });
        if (applyChanges) {
          await doc.delete();
        }
        break;
      case 'chatItem':
        this._displayCard(doc);
        break;
      case 'switchMode':
        await doc.switchMode();
        break;
      case 'addOpposingCharm':
        await this._addOpposingCharm(doc);
        break;
      case 'spendItem':
        this._spendItem(doc);
        break;
      case 'increaseItemActivations':
        doc.increaseActivations();
        break;
      case 'decreaseItemActivations':
        doc.decreaseActiations();
        break;
      case 'togglePoison':
        await doc.update({
          [`system.poison.apply`]: !doc.system.poison.apply,
        });
        break;
      case 'toggleItemValue':
        const key = target.dataset.key;
        await doc.update({
          [`system.${key}`]: !doc.system[key],
        });
        break;
      case 'shapeSpell':
        this.actor.actionRoll(
          {
            rollType: 'sorcery',
            pool: 'sorcery',
            spell: doc.id
          }
        );
        break;
      case 'stopSpellShape':
        await doc.update({ [`system.shaping`]: false });
        await this.actor.update({
          [`system.sorcery.motes.value`]: 0,
          [`system.sorcery.motes.max`]: 0
        });
        break;
      case 'completeCraft':
        this._completeCraft(doc);
        break;
      case 'craftSimpleProject':
        this.actor.actionRoll(
          { rollType: 'simpleCraft', ability: "craft", craftProjectId: doc?.id, difficulty: doc?.system?.difficulty }
        );
        break;
      case 'editShape':
        const formActor = game.actors.get(doc.system.actorid);
        if (formActor) {
          formActor.sheet.render(true);
        }
        break;
    }
  }

  static async savedRollAction(event, target) {
    const savedRollId = this._getEmbeddedDocument(target);
    const actionType = target.dataset.actiontype;

    switch (actionType) {
      case 'savedRoll':
        this.actor.actionRoll(
          {
            rollType: this.actor.system.savedRolls[savedRollId].rollType,
            rollId: savedRollId
          }
        );
        break;
      case 'deleteSavedRoll':
        const rollDeleteString = "system.savedRolls.-=" + savedRollId;
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
        break;
    }
  }

  static makeActionRoll(event, target) {
    const rollType = target.dataset.rolltype;

    const abilityMap = {
      focusWill: 'sagacity',
      social: 'embassy',
    }

    const data = {
      rollType: rollType,
    }

    if (abilityMap[rollType]) {
      data.ability = abilityMap[rollType];
    }

    if (rollType === 'ability') {
      const ability = target.dataset.ability;
      data.ability = ability;
    }

    if (rollType === 'ability') {
      data.pool = target.dataset.pool;
    }
    if (rollType === 'withering' || rollType === 'decisive' || rollType === 'gambit') {
      const doc = this._getEmbeddedDocument(target);
      data.weapon = doc?.system;
    }

    this.actor.actionRoll(data);
  }

  static rollAction(event, target) {
    const doc = this._getEmbeddedDocument(target);
    this.actor.actionRoll(
      {
        rollType: 'ability',
        pool: doc.id
      }
    );
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

  static async _displayDataChat(event, target) {
    event.preventDefault();
    event.stopPropagation();
    let type = target.dataset.type;
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
    const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedessence/templates/chat/exalt-ability-card.html", templateData);

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

  static async showDialog(event, target) {
    const dialogType = target.dataset.dialogtype;

    if (dialogType === 'charmCheatSheet') {
      const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedessence/templates/dialogues/charms-dialogue.html");
      new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("ExEss.Keywords"), resizable: true },
        content: html,
        position: {
          width: 1000,
          height: 1000
        },
        buttons: [{ action: 'close', label: game.i18n.localize("ExEss.Close") }],
        classes: ['exaltedessence-dialog', this.actor.getSheetBackground()],
      }).render(true);
    } else {
      let template = "systems/exaltedessence/templates/dialogues/armor-tags.html";

      switch (dialogType) {
        case 'experience':
          template = "systems/exaltedessence/templates/dialogues/experience-points-dialogue.html";
          break;
        case 'weapons':
          template = "systems/exaltedessence/templates/dialogues/weapon-tags.html";
          break;
        case 'craft':
          template = "systems/exaltedessence/templates/dialogues/craft-cheatsheet.html";
          break;
        case 'advancement':
          template = "systems/exaltedessence/templates/dialogues/advancement-dialogue.html";
          break;
        case 'combat':
          template = "systems/exaltedessence/templates/dialogues/combat-dialogue.html";
          break;
        case 'social':
          template = "systems/exaltedessence/templates/dialogues/social-dialogue.html";
          break;
        case 'rout':
          template = "systems/exaltedessence/templates/dialogues/rout-modifiers.html";
          break;
        case 'exalt-xp':
          template = "systems/exaltedessence/templates/dialogues/exalt-xp-dialogue.html";
          break;
        case 'featsOfStrength':
          template = "systems/exaltedessence/templates/dialogues/feats-of-strength-dialogue.html";
          break;
        case 'bonusPoints':
          template = "systems/exaltedessence/templates/dialogues/bonus-points-dialogue.html";
          break;
        case 'health':
          template = "systems/exaltedessence/templates/dialogues/health-dialogue.html";
          break;
        case 'workings':
          template = "systems/exaltedessence/templates/dialogues/workings-dialogue.html";
          break;
        default:
          break;
      }
      const html = await foundry.applications.handlebars.renderTemplate(template);
      new foundry.applications.api.DialogV2({
        window: { title: game.i18n.localize("ExEss.InfoDialog"), resizable: true },
        content: html,
        buttons: [{ action: 'close', label: game.i18n.localize("ExEss.Close") }],
        classes: ['exaltedessence-dialog', this.actor.getSheetBackground()],
        position: {
          width: 500,
        },
      }).render(true);
    }
  }

  /**
* Display the chat card for an Item as a Chat Message
* @param {object} options          Options which configure the display of the item chat card
* @param {string} rollMode         The message visibility mode to apply to the created card
* @param {boolean} createMessage   Whether to automatically create a ChatMessage entity (if true), or only return
*                                  the prepared message data (if false)
*/
  async _displayCard(item) {
    const token = this.actor.token;
    const templateData = {
      actor: this.actor,
      tokenId: token?.uuid || null,
      item: item,
      labels: this.labels,
    };
    const html = await foundry.applications.handlebars.renderTemplate("systems/exaltedessence/templates/chat/item-card.html", templateData);

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

  _addOpposingCharm(item) {
    if (game.rollForm) {
      game.rollForm.addOpposingCharm(item);
    }

    game.socket.emit('system.exaltedessence', {
      type: 'addOpposingCharm',
      data: item,
    });
  }

  _spendItem(item) {
    this.actor.spendItem(item);
  }

  get dragDrop() {
    return this.#dragDrop;
  }

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop;

  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new foundry.applications.ux.DragDrop.implementation(d);
    });
  }

  /**
* Define whether a user is able to begin a dragstart workflow for a given drag selector
* @param {string} selector       The candidate HTML selector for dragging
* @returns {boolean}             Can the current user drag this selector?
* @protected
*/
  _canDragStart(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
 * Callback actions which occur at the beginning of a drag start workflow.
 * @param {DragEvent} event       The originating DragEvent
 * @protected
 */
  _onDragStart(event) {
    const docRow = event.currentTarget.closest('li');
    if ('link' in event.target.dataset) return;

    // Chained operation
    let dragData = this._getEmbeddedDocument(docRow)?.toDragData();

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) { }

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call('dropActorSheetData', actor, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case 'ActiveEffect':
        return this._onDropActiveEffect(event, data);
      case 'Actor':
        return this._onDropActor(event, data);
      case 'Item':
        return this._onDropItem(event, data);
      case 'Folder':
        return this._onDropFolder(event, data);
    }
  }

  /**
 * Handle the dropping of ActiveEffect data onto an Actor Sheet
 * @param {DragEvent} event                  The concluding DragEvent which contains drop data
 * @param {object} data                      The data transfer extracted from the event
 * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
 * @protected
 */
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass('ActiveEffect');
    const effect = await aeCls.fromDropData(data);
    if (!this.actor.isOwner || !effect) return false;
    if (effect.target === this.actor)
      return this._onSortActiveEffect(event, effect);
    return aeCls.create(effect, { parent: this.actor });
  }

  /**
   * Handle a drop event for an existing embedded Active Effect to sort that Active Effect relative to its siblings
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  async _onSortActiveEffect(event, effect) {
    /** @type {HTMLElement} */
    const dropTarget = event.target.closest('[data-effect-id]');
    if (!dropTarget) return;
    const target = this._getEmbeddedDocument(dropTarget);

    // Don't sort on yourself
    if (effect.uuid === target.uuid) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (const el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      const parentId = el.dataset.parentId;
      if (
        siblingId &&
        parentId &&
        (siblingId !== effect.id || parentId !== effect.parent.id)
      )
        siblings.push(this._getEmbeddedDocument(el));
    }

    // Perform the sort
    const sortUpdates = foundry.utils.SortingHelpers.performIntegerSort(effect, {
      target,
      siblings,
    });

    // Split the updates up by parent document
    const directUpdates = [];

    const grandchildUpdateData = sortUpdates.reduce((items, u) => {
      const parentId = u.target.parent.id;
      const update = { _id: u.target.id, ...u.update };
      if (parentId === this.actor.id) {
        directUpdates.push(update);
        return items;
      }
      if (items[parentId]) items[parentId].push(update);
      else items[parentId] = [update];
      return items;
    }, {});

    // Effects-on-items updates
    for (const [itemId, updates] of Object.entries(grandchildUpdateData)) {
      await this.actor.items
        .get(itemId)
        .updateEmbeddedDocuments('ActiveEffect', updates);
    }

    // Update on the main actor
    return this.actor.updateEmbeddedDocuments('ActiveEffect', directUpdates);
  }

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.actor.isOwner) return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid)
      return this._onSortItem(event, item);

    // Create the owned item
    return this._onDropItemCreate(item, event);
  }

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @returns {Promise<Item[]>}
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.actor.isOwner) return [];
    const folder = await Folder.implementation.fromDropData(data);
    if (folder.type !== 'Item') return [];
    const droppedItemData = await Promise.all(
      folder.contents.map(async (item) => {
        if (!(document instanceof Item)) item = await fromUuid(item.uuid);
        return item;
      })
    );
    return this._onDropItemCreate(droppedItemData, event);
  }

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
   * @param {object[]|object} itemData      The item data requested for creation
   * @param {DragEvent} event               The concluding DragEvent which provided the drop data
   * @returns {Promise<Item[]>}
   * @private
   */
  async _onDropItemCreate(itemData, event) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    return this.actor.createEmbeddedDocuments('Item', itemData);
  }

  /**
   * Handle a drop event for an existing embedded Item to sort that Item relative to its siblings
   * @param {Event} event
   * @param {Item} item
   * @private
   */
  _onSortItem(event, item) {
    // Get the drag source and drop target
    const items = this.actor.items;
    const dropTarget = event.target.closest('[data-item-id]');
    if (!dropTarget) return;
    const target = items.get(dropTarget.dataset.itemId);

    // Don't sort on yourself
    if (item.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.itemId;
      if (siblingId && siblingId !== item.id)
        siblings.push(items.get(el.dataset.itemId));
    }

    // Perform the sort
    const sortUpdates = foundry.utils.SortingHelpers.performIntegerSort(item, {
      target,
      siblings,
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    return this.actor.updateEmbeddedDocuments('Item', updateData);
  }

  /**
* Fetches the embedded document representing the containing HTML element
*
* @param {HTMLElement} target    The element subject to search
* @returns {Item | ActiveEffect} The embedded Item or ActiveEffect
*/
  _getEmbeddedDocument(target) {
    const docRow = target.closest('li[data-document-class]');
    if (!docRow?.dataset) {
      return null;
    }
    if (docRow.dataset.documentClass === 'savedRoll') {
      return docRow.dataset.itemId;
    }
    else if (docRow.dataset.documentClass === 'Item') {
      return this.actor.items.get(docRow.dataset.itemId);
    } else if (docRow.dataset.documentClass === 'ActiveEffect') {
      const parent =
        docRow.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(docRow?.dataset.parentId);
      return parent.effects.get(docRow?.dataset.effectId);
    } else return console.warn('Could not find document class');
  }


  async _onDragSavedRoll(ev) {
    const li = ev.currentTarget;
    if (ev.target.classList.contains("content-link")) return;
    const savedRoll = this.actor.system.savedRolls[li.dataset.itemId];
    ev.dataTransfer.setData("text/plain", JSON.stringify({ actorId: this.actor.uuid, type: 'savedRoll', id: li.dataset.itemId, name: savedRoll.name }));
  }
}