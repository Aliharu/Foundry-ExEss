import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";
import TraitSelector from "../apps/trait-selector.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ExaltedEssenceItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {

  constructor(...args) {
    super(...args);
    this.#dragDrop = this.#createDragDropHandlers();
  }

  static DEFAULT_OPTIONS = {
    window: {
      title: "Item Sheet",
      resizable: true,
    },
    position: { width: 756, height: 645 },
    classes: ["tree-background", "exaltedessence", "sheet", "item"],
    actions: {
      onEditImage: this._onEditImage,
      showEmbeddedItem: this.showEmbeddedItem,
      deleteEmbeddedItem: this.deleteEmbeddedItem,
      editTraits: this.editTraits,
    },
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    form: {
      submitOnChange: true,
    },
  };

  static PARTS = {
    header: {
      template: "systems/exaltedessence/templates/item/item-header.html",
    },
    tabs: { template: 'systems/exaltedessence/templates/dialogues/tabs.html' },
    description: { template: 'systems/exaltedessence/templates/item/description-tab.html' },
    cost: { template: 'systems/exaltedessence/templates/item/costs-tab.html' },
    bonuses: { template: 'systems/exaltedessence/templates/item/bonuses-tab.html' },
    effects: { template: 'systems/exaltedessence/templates/item/effects-tab.html' },
  };

  get title() {
    return `${game.i18n.localize(this.item.name)}`
  }

  _initializeApplicationOptions(options) {
    options.classes = [options.document.getSheetBackground(), "exaltedessence", "sheet", "item"];
    return super._initializeApplicationOptions(options);
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);

    options.parts = ['header', 'tabs', 'description'];
    // // Control which parts show based on document subtype
    switch (this.document.type) {
      case 'charm':
        options.parts.push('cost', 'bonuses');
        break;
    }
    options.parts.push('effects');
  }

  async _prepareContext(options) {
    const itemData = this.item.toObject(false);

    const context = {
      // Validates both permissions and compendium status
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      // Add the item document.
      item: this.item,
      // Adding system and flags for easier access
      system: this.item.system,
      flags: this.item.flags,
      type: this.item.type,
      // Adding a pointer to CONFIG.BOILERPLATE
      config: CONFIG.EXALTEDESSENCE,
      // You can factor out context construction to helper functions
      tabs: this._getTabs(options.parts),
      selects: CONFIG.EXALTEDESSENCE.selects,
      traitHeader: itemData.type === 'armor' || itemData.type === 'weapon',
      isActivatable: ['spell', 'ritual', 'item', 'quality', 'weapon', 'charm'].includes(itemData.type),
    };

    context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.item.system.description,
      {
        secrets: this.document.isOwner,
        relativeTo: this.item,
      }
    );

    if (itemData.type === 'weapon' || itemData.type === 'armor') {
      this._prepareTraits(itemData.type, context.system.traits);
    }

    context.effects = prepareActiveEffectCategories(this.item.effects);

    return context;
  }

  async _preparePartContext(partId, context) {
    context.tab = context.tabs.find(item => item.partId === partId);
    return context;
  }

  /**
* Prepare the data structure for traits data like tags
* @param {object} traits   The raw traits data object from the item data
* @private
*/
  _prepareTraits(type, traits) {
    const map = {
    };
    if (type === 'weapon') {
      map['weapontags'] = CONFIG.EXALTEDESSENCE.weapontags
    }
    if (type === 'armor') {
      map['armortags'] = CONFIG.EXALTEDESSENCE.armortags
    }
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

  static editTraits(event, target) {
    event.preventDefault();
    const a = target;
    const choices = CONFIG.EXALTEDESSENCE[a.dataset.options];
    const options = { name: a.dataset.target, choices };
    return new TraitSelector(this.item, options).render(true);
  }

  /** @override */
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
  }

  _getTabs(parts) {
    // If you have sub-tabs this is necessary to change
    const tabs = [];
    const tabGroup = 'primary';
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'description';
    for (const part of parts) {
      const tab = {
        cssClass: this.tabGroups['primary'] === 'description' ? 'active' : '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: '',
      };
      switch (part) {
        case 'description':
          tab.id = 'description';
          tab.partId = 'description';
          tab.label += 'Description';
          tab.cssClass = this.tabGroups['primary'] === 'description' ? 'active' : '';
          break;
        case 'cost':
          tab.id = 'cost';
          tab.partId = 'cost';
          tab.label += 'Cost';
          tab.cssClass = this.tabGroups['primary'] === 'cost' ? 'active' : '';
          break;
        case 'bonuses':
          tab.id = 'bonuses';
          tab.label += 'Bonuses';
          tab.cssClass = this.tabGroups['primary'] === 'bonuses' ? 'active' : '';
          break;
        case 'effects':
          tab.id = 'effects';
          tab.partId = 'effects';
          tab.label += 'Effects';
          tab.cssClass = this.tabGroups['primary'] === 'effects' ? 'active' : '';
          break;
      }
      if (tab.id) {
        tabs.push(tab);
      }
    }

    return tabs;
  }


  static async showEmbeddedItem(event, target) {
    event.preventDefault();
    event.stopPropagation();
    const li = target;
    let itemType = li.dataset.itemName;
    let itemIndex = li.dataset.itemIndex;
    let embededItem;

    if (li.dataset.type === 'archetype') {
      embededItem = this.item.system.archetype.charmprerequisites[itemIndex];
    }
    else {
      embededItem = this.item.system.charmprerequisites[itemIndex];
    }

    var item;

    if (embededItem.pack) {
      // Case 1 - Import from a Compendium pack
      item = await this.importItemFromCollection(embededItem.pack, embededItem.id);
    }
    else {
      // Case 2 - Import from World entity
      if (this.item.pack) {
        item = await this.importItemFromCollection(this.item.pack, embededItem.id);
      }
      if (!item) {
        item = await game.items.get(embededItem.id);
      }
    }
    if (!item) return ui.notifications.error(`Error: Could not find item, it may have been deleted.`);

    item.sheet.render(true);
  }

  static deleteEmbeddedItem(event, target) {
    event.preventDefault();
    event.stopPropagation();
    let formData = {};

    const li = target;
    const parent = li.parentElement;
    const itemIndex = parent.dataset.itemIndex;

    if (target.dataset?.type === 'archetype') {
      const items = this.item.system.archetype.charmprerequisites;
      items.splice(itemIndex, 1);
      foundry.utils.setProperty(formData, `system.archetype.charmprerequisites`, items);
      this.item.update(formData);
    }
    else {
      const items = this.item.system.charmprerequisites;
      items.splice(itemIndex, 1);
      foundry.utils.setProperty(formData, `system.charmprerequisites`, items);
      this.item.update(formData);
    }
  }

  importItemFromCollection(collection, entryId) {
    const pack = game.packs.get(collection);
    if (pack.documentName !== "Item") return;
    return pack.getDocument(entryId).then((ent) => {
      return ent;
    });
  }

  _onDragEmbeddedItem(event) {
    event.stopPropagation();
    const a = event.currentTarget;
    let dragData = null;

    // Case 1 - Compendium Link
    if (a.dataset.pack || this.item?.pack) {
      const pack = game.packs.get(a.dataset.pack || this.item.pack);
      let id = a.dataset.id;
      if (!a.dataset.uuid && !id) return false;
      const uuid = a.dataset.uuid || pack.getUuid(id);
      dragData = { type: pack.documentName, uuid };
    }
    if (!dragData) {
      const doc = fromUuidSync(`Item.${a.dataset.id}`);
      dragData = doc.toDragData();
    }

    if (!dragData) return;

    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  async _onDrag(event) {
    const li = event.currentTarget;
    if ("link" in event.target.dataset) return;

    // Create drag data
    let dragData;

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  async _onDropItem(event, data) {
    const obj = this.item;
    const li = event.currentTarget;

    data.id = data.uuid.split('.')[1];
    if (data.uuid.includes('Compendium')) {
      return ui.notifications.error(`Error: You cannot drop compendium items into box.`);
      // let tmp = data.uuid.split('.');
      // data.pack = tmp[1] + '.' + tmp[2];
      // data.id = tmp[4];
    }

    let itemObject;
    if (data.pack) {
      // Case 1 - Import from a Compendium pack
      itemObject = await this.importItemFromCollection(data.pack, data.id);
      if (!itemObject) {
        return ui.notifications.error(`Error: Could not find item, you cannot drop embeded items into box.`);
      };
    }
    else {
      // Case 2 - Import from World entity
      itemObject = await game.items.get(data.id);
      if (!itemObject) {
        return ui.notifications.error(`Error: Could not find item, you cannot drop embeded items into box.`);
      };
    }

    let newItem = {
      id: itemObject.id,
      name: itemObject.name,
      pack: data.pack,
      count: 1,
    };

    if (itemObject.type === "charm") {
      const detailsTabactive = this.tabGroups.primary === 'details';
      let items = obj?.system.charmprerequisites;
      if (detailsTabactive) {
        items = obj?.system.archetype.charmprerequisites;
      }
      if (!items) {
        items = [];
      }
      if (items.map(item => item.id).includes(newItem.id)) {
        items.forEach(item => {
          if (item.id === newItem.id) {
            if (!item.count) {
              item.count = 1;
            }
            item.count += 1;
          }
        });
      } else {
        switch (itemObject.type) {
          case "charm": {
            items.push(newItem);
            break;
          }
          default: {
            return;
          }
        }
      }



      let formData = {};
      foundry.utils.setProperty(formData, `system${detailsTabactive ? '.archetype' : ''}.charmprerequisites`, items);

      obj.update(formData);
    }
  }

  async _onDropActiveEffect(event, data) {
    const effect = await ActiveEffect.implementation.fromDropData(data);
    if (!this.item.isOwner || !effect
      || (this.item.uuid === effect.parent?.uuid)
      || (this.item.uuid === effect.origin)) return false;
    const effectData = effect.toObject();
    const options = { parent: this.item, keepOrigin: false };

    return ActiveEffect.create(effectData, options);
  }

  /**
 *
 * DragDrop
 *
 */

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
    const li = event.currentTarget;
    if ('link' in event.target.dataset) return;

    let dragData = null;

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

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
    const data = foundry.applications.ux.TextEditor.getDragEventData(event);
    const item = this.item;
    const allowed = Hooks.call('dropItemSheetData', item, this, data);
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
   * Sorts an Active Effect based on its surrounding attributes
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  _onEffectSort(event, effect) {
    const effects = this.item.effects;
    const dropTarget = event.target.closest('[data-effect-id]');
    if (!dropTarget) return;
    const target = effects.get(dropTarget.dataset.effectId);

    // Don't sort on yourself
    if (effect.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      if (siblingId && siblingId !== effect.id)
        siblings.push(effects.get(el.dataset.effectId));
    }

    // Perform the sort
    const sortUpdates = foundry.utils.SortingHelpers.performIntegerSort(effect, {
      target,
      siblings,
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    return this.item.updateEmbeddedDocuments('ActiveEffect', updateData);
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.item.isOwner) return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.item.isOwner) return [];
  }


  /* -------------------------------------------- */

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.item.isOwner) return false;
  }

  /* -------------------------------------------- */

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.item.isOwner) return [];
  }

  /** The following pieces set up drag handling and are unlikely to need modification  */

  /**
   * Returns an array of DragDrop instances
   */
  get dragDrop() {
    return this.#dragDrop;
  }

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop;

  /**
   * Create drag-and-drop workflow handlers for this Application
   */
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
}
