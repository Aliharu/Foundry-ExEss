import { onManageActiveEffect, prepareActiveEffectCategories } from "../effects.js";
import TraitSelector from "../apps/trait-selector.js";

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class ExaltedessenceItemSheet extends ItemSheet {

  constructor(...args) {
    super(...args);
    this.options.classes = [...this.options.classes, this.getTypeSpecificCSSClasses()];
  }

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["exaltedessence", "sheet", "item"],
      width: 756,
      height: 645,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/exaltedessence/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  getTypeSpecificCSSClasses() {
    return `${game.settings.get("exaltedessence", "sheetStyle")}-background`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const context = super.getData();
    const itemData = this.item.toObject(false);
    context.system = itemData.system;
    context.selects = CONFIG.EXALTEDESSENCE.selects;

    context.descriptionHTML = await TextEditor.enrichHTML(context.system.description, {
      secrets: this.document.isOwner,
      async: true
    });

    if (itemData.type === 'weapon' || itemData.type === 'armor') {
      this._prepareTraits(itemData.type, context.system.traits);
    }

    context.effects = prepareActiveEffectCategories(this.item.effects);
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

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /**
* Handle spawning the TraitSelector application which allows a checkbox of multiple trait options
* @param {Event} event   The click event which originated the selection
* @private
*/
  _onTraitSelector(event) {
    event.preventDefault();
    const a = event.currentTarget;
    const choices = CONFIG.EXALTEDESSENCE[a.dataset.options];
    const options = { name: a.dataset.target, choices };
    return new TraitSelector(this.item, options).render(true)
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    let embedItemshandler = this._onDragEmbeddedItem.bind(this);

    html.find('a.embeded-item-pill').each((i, li) => {
      li.addEventListener("dragstart", embedItemshandler, false);
    });

    html.find('.trait-selector').click(this._onTraitSelector.bind(this));

    html.find(".effect-control").click(ev => {
      onManageActiveEffect(ev, this.item);
    });

    html.on("dragstart", "a.embeded-item-pill", this._onDragEmbeddedItem);

    html.find(".embeded-item-delete").on("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      let formData = {};

      const li = event.currentTarget;
      const parent = $(li).parent()[0];
      const itemIndex = parent.dataset.itemIndex;
      const items = this.object.system.charmprerequisites;
      items.splice(itemIndex, 1);
      foundry.utils.setProperty(formData, `system.charmprerequisites`, items);
      this.object.update(formData);
    });

    // Embeded Item code taken and modified from the Star Wars FFG FoundryVTT module
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    // SOFTWARE.

    html.find(".embeded-item-pill").on("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      const li = event.currentTarget;
      let itemType = li.dataset.itemName;
      let itemIndex = li.dataset.itemIndex;
      let embededItem = this.object.system.charmprerequisites[itemIndex];

      let item;

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
    });

    if (this.object.type === 'charm') {
      const itemToItemAssociation = new DragDrop({
        dragSelector: ".item",
        dropSelector: null,
        permissions: { dragstart: true, drop: true },
        callbacks: { drop: this._onDrop.bind(this), dragstart: this._onDrag.bind(this) },
      });
      itemToItemAssociation.bind(html[0]);
    }
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

  async _onDrop(event) {
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
      if (data.type === "Item") return this._onDropItem(event, data);
      if (data.type === "ActiveEffect") return this._onDropActiveEffect(event, data);
    } catch (err) {
      return false;
    }
  }

  async _onDrag(event) {
    const li = event.currentTarget;
    if ( "link" in event.target.dataset ) return;

    // Create drag data
    let dragData;

    // Active Effect
    if ( li.dataset.effectId ) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if ( !dragData ) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  async _onDropItem(event, data) {
    const obj = this.object;
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
    };

    if (itemObject.type === "charm") {
      let items = obj?.system.charmprerequisites;
      if (!items) {
        items = [];
      }
      if (items.map(item => item.id).includes(newItem.id)) {
        return;
        // items.forEach(item => {
        //   if (item.id === newItem.id) {
        //     if (!item.count) {
        //       item.count = 1;
        //     }
        //     item.count += 1;
        //   }
        // });
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
      foundry.utils.setProperty(formData, `system.charmprerequisites`, items);

      obj.update(formData);
    }
  }

  async _onDropActiveEffect(event, data) {
    const effect = await ActiveEffect.implementation.fromDropData(data);
    if ( !this.item.isOwner || !effect
      || (this.item.uuid === effect.parent?.uuid)
      || (this.item.uuid === effect.origin) ) return false;
    const effectData = effect.toObject();
    const options = { parent: this.item, keepOrigin: false };

    return ActiveEffect.create(effectData, options);
  }
}
