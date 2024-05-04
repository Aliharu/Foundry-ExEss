/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class ExaltedessenceItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();
  }

  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);
    if (!data.img || data.img == "icons/svg/item-bag.svg") {
      this.updateSource({ img: this.getImageUrl(data.type) });
    }
  }

  getImageUrl(type) {
    if (type === 'intimacy') {
      return "systems/exaltedessence/assets/icons/hearts.svg";
    }
    if (type === 'spell') {
      return "systems/exaltedessence/assets/icons/magic-swirl.svg";
    }
    if (type === 'ritual') {
      return "icons/svg/book.svg";
    }
    if (type === 'merit') {
      return "icons/svg/coins.svg";
    }
    if (type === 'quality') {
      return "icons/svg/aura.svg";
    }
    if (type === 'weapon') {
      return "icons/svg/sword.svg";
    }
    if (type === 'armor') {
      return "systems/exaltedessence/assets/icons/breastplate.svg";
    }
    if (type === 'charm') {
      return "icons/svg/explosion.svg";
    }
    return "icons/svg/item-bag.svg";
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    // Basic template rendering data
    const token = this.actor.token;
    const item = this;
    const actorData = this.actor ? this.actor.system : {};
    const itemData = item.system;

    // let roll = new Roll('d20+@abilities.str.mod', actorData);
    // let label = `Rolling ${item.name}`;
    // roll.roll().toMessage({
    //   speaker: ChatMessage.getSpeaker({ actor: this.actor }),
    //   flavor: label
    // });
  }
}

export function prepareItemTraits(type, i) {
  const map = {
  };
  if (type === 'weapon') {
    map['weapontags'] = CONFIG.EXALTEDESSENCE.weapontags
  }
  if (type === 'armor') {
    map['armortags'] = CONFIG.EXALTEDESSENCE.armortags
  }
  for (let [t, choices] of Object.entries(map)) {
    const trait = i.system.traits[t];
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
