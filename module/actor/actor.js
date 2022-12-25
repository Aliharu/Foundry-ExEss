import { prepareItemTraits } from "../item/item.js";

/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class ExaltedessenceActor extends Actor {

  /**
   * Augment the basic actor data with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    const actorData = this;
    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (this.type === 'character') this._prepareCharacterData(actorData);
    if (this.type === 'npc') this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    // Make modifications to data here. For example:
    const data = actorData.system;
    this._prepareBaseActorData(data);
    let totalHealth = 0;
    let currentPenalty = 0;
    data.motes.max = data.essence.value * 2 + Math.floor((data.essence.value - 1) / 2) + 3;
    for (let [key, health_level] of Object.entries(data.health.levels)) {
      if ((data.health.lethal + data.health.aggravated) > totalHealth) {
        currentPenalty = health_level.penalty;
      }
      totalHealth += health_level.value;
    }
    data.health.max = totalHealth;
    if (data.health.aggravated + data.health.lethal > data.health.max) {
      data.health.aggravated = data.health.max - data.health.lethal
      if (data.health.aggravated <= 0) {
        data.health.aggravated = 0
        data.health.lethal = data.health.max
      }
    }
    data.health.value = data.health.max - data.health.aggravated - data.health.lethal;
    data.health.penalty = currentPenalty;

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
    for (let i of actorData.items) {
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

  _prepareNpcData(actorData) {
    const data = actorData.system;
    this._prepareBaseActorData(data);
    let currentPenalty = 0;
    if (data.health.levels > 1 && ((data.health.lethal + data.health.aggravated) >= Math.floor(data.health.levels / 2))) {
      currentPenalty = 2;
    }
    data.health.value = data.health.max - data.health.aggravated - data.health.lethal;
    data.health.penalty = currentPenalty;
  }

  async _preUpdate(updateData, options, user) {
    await super._preUpdate(updateData, options, user);
    if (updateData?.system?.anima) {
      this.system.anima.value = updateData?.system?.anima?.value;
    }
    if (updateData?.system?.motes) {
      if (updateData?.system?.motes.commited !== undefined && this.system.details.exalt !== 'getimian') {
        const commitChange = Math.max(0, updateData.system.motes.commited - this.system.motes.commited);
        const newMotes = Math.max(0, this.system.motes.value - commitChange);
        updateData.system.motes.value = newMotes;
      }
      if (updateData?.system?.motes.value !== undefined) {
        const animaChange = Math.max(0, this.system.motes.value - updateData.system.motes.value);
        const newAnima = Math.min(10, this.system.anima.value + animaChange);
        updateData.system.anima = { 'value': newAnima };
      }
    }
    if (updateData?.system?.flowing?.value !== undefined) {
      const animaChange = Math.max(0, this.system.flowing.value - updateData.system.flowing.value);
      const newAnima = Math.min(10, this.system.anima.value + animaChange);
      updateData.system.anima = { 'value': newAnima };
    }
    if (updateData?.system?.still?.value !== undefined) {
      const animaChange = Math.max(0, this.system.still.value - updateData.system.still.value);
      const newAnima = Math.min(10, this.system.anima.value + animaChange);
      updateData.system.anima = { 'value': newAnima };
    }
    if (updateData.system.anima && this.system.anima.value !== updateData.system.anima) {
      // animaTokenMagic(this.actor, newValue);
    }
  }

  _prepareBaseActorData(data) {
    data.motes.max = data.essence.value * 2 + Math.floor((data.essence.value - 1) / 2) + 3;
    let animaLevel = "";
    if (data.anima.value >= 1) {
      animaLevel = "dim";
    }
    if (data.anima.value >= 3) {
      animaLevel = "glowing";
    }
    if (data.anima.value >= 5) {
      animaLevel = "burning";
    }
    if (data.anima.value >= 7) {
      animaLevel = "bonfire";
    }
    if (data.anima.value === 10) {
      animaLevel = "iconic";
    }
    data.anima.level = animaLevel;
  }
}

export async function addDefensePenalty(actor, label = "Defense Penalty") {
  const existingPenalty = actor.effects.find(i => i.label == label);
  if (existingPenalty) {
    let changes = duplicate(existingPenalty.changes);
    if (actor.type === 'character') {
      changes[0].value = changes[0].value - 1;
      changes[1].value = changes[1].value - 1;
    }
    else {
      changes[0].value = changes[0].value - 1;
    }
    existingPenalty.update({ changes });
  }
  else {
    var changes = [
      {
        "key": "data.evasion.value",
        "value": -1,
        "mode": 2
      },
      {
        "key": "data.parry.value",
        "value": -1,
        "mode": 2
      }
    ];
    if (actor.type === 'npc') {
      changes = [
        {
          "key": "data.defense.value",
          "value": -1,
          "mode": 2
        },
      ];
    }
    actor.createEmbeddedDocuments('ActiveEffect', [{
      label: label,
      icon: 'systems/exaltedessence/assets/icons/slashed-shield.svg',
      origin: actor.uuid,
      disabled: false,
      duration: {
        rounds: 10,
      },
      "changes": changes
    }]);

  }
}