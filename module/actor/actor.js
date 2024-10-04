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

  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    this._prepareBaseActorData(systemData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    // Make modifications to data here. For example:
    const data = actorData.system;
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
    let currentPenalty = 0;
    if (data.health.levels > 1 && ((data.health.lethal + data.health.aggravated) >= Math.floor(data.health.levels / 2))) {
      currentPenalty = 2;
    }
    data.health.value = data.health.max - data.health.aggravated - data.health.lethal;
    data.health.penalty = currentPenalty;
  }

  async _preUpdate(updateData, options, user) {
    await super._preUpdate(updateData, options, user);
    if (updateData?.system?.motes?.committed !== undefined && updateData?.system?.motes?.committed !== this.system.motes.committed && this.system.details.exalt !== 'getimian') {
      const commitChange = updateData.system.motes.committed - this.system.motes.committed;
      const newMotes = Math.max(0, this.system.motes.value - commitChange);
      updateData.system.motes.value = newMotes;
    }
    if (updateData?.system?.motes?.value !== undefined && updateData?.system?.motes?.value !== this.system.motes.value) {
      const animaChange = Math.max(0, this.system.motes.value - updateData?.system?.motes?.value);
      const newAnima = Math.min(10, this.system.anima.value + animaChange);
      updateData.system.anima = { 'value': newAnima };
    }
    if (updateData?.system?.flowing?.value !== undefined && updateData?.system?.flowing?.value !== this.system.flowing.value) {
      const animaChange = Math.max(0, this.system.flowing.value - updateData?.system?.flowing?.value);
      const newAnima = Math.min(10, this.system.anima.value + animaChange);
      updateData.system.anima = { 'value': newAnima };
    }
    if (updateData?.system?.still?.value !== undefined && updateData?.system?.still?.value !== this.system.still.value) {
      const animaChange = Math.max(0, this.system.still.value - updateData?.system?.still?.value);
      const newAnima = Math.min(10, this.system.anima.value + animaChange);
      updateData.system.anima = { 'value': newAnima };
    }
    if (updateData?.system?.motes?.committed !== undefined && updateData?.system?.anima?.value !== this.system.anima.value) {
      animaTokenMagic(this, updateData.system.anima.value);
    }
  }

  _prepareBaseActorData(system) {
    system.motes.max = system.essence.value * 2 + Math.floor((system.essence.value - 1) / 2) + 3;
    let animaLevel = "";
    if (system.anima.value >= 1) {
      animaLevel = "dim";
    }
    if (system.anima.value >= 3) {
      animaLevel = "glowing";
    }
    if (system.anima.value >= 5) {
      animaLevel = "burning";
    }
    if (system.anima.value >= 7) {
      animaLevel = "bonfire";
    }
    if (system.anima.value === 10) {
      animaLevel = "iconic";
    }
    system.anima.level = animaLevel;
  }

  getSheetBackground() {
    return `${game.settings.get("exaltedessence", "sheetStyle")}-background`;
    // if (this.system.settings.sheetbackground === 'default') {
    //   return `${game.settings.get("exaltedessence", "sheetStyle")}-background`;
    // }
    // return `${this.system.settings.sheetbackground}-background`;
  }
}

export async function addDefensePenalty(actor, label = "Defense Penalty") {
  const existingPenalty = actor.effects.find(i => i.name === label);
  if (existingPenalty) {
    let changes = foundry.utils.duplicate(existingPenalty.changes);
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
        "key": "system.evasion.value",
        "value": -1,
        "mode": 2
      },
      {
        "key": "system.parry.value",
        "value": -1,
        "mode": 2
      }
    ];
    if (actor.type === 'npc') {
      changes = [
        {
          "key": "system.defense.value",
          "value": -1,
          "mode": 2
        },
      ];
    }
    actor.createEmbeddedDocuments('ActiveEffect', [{
      name: label,
      img: 'systems/exaltedessence/assets/icons/slashed-shield.svg',
      origin: actor.uuid,
      disabled: false,
      duration: {
        rounds: 10,
      },
      "changes": changes
    }]);
  }
}

async function animaTokenMagic(actor, newAnimaValue) {
  const tokenId = actor.token?.id || actor.getActiveTokens()[0]?.id;
  const actorToken = canvas.tokens.placeables.filter(x => x.id === tokenId)[0];
  if (game.settings.get("exaltedessence", "animaTokenMagic") && actorToken && (actor.type === 'character' || actor.system.creaturetype === 'exalt')) {
      let effectColor = Number(`0x${actor.system.details.animacolor.replace('#', '')}`);
      let sovereign =
          [{
              filterType: "xfire",
              filterId: "myChromaticXFire",
              time: 0,
              blend: 2,
              amplitude: 1.1,
              dispersion: 0,
              chromatic: true,
              scaleX: 1,
              scaleY: 1,
              inlay: false,
              animated:
              {
                  time:
                  {
                      active: true,
                      speed: -0.0015,
                      animType: "move"
                  }
              }
          }];

      let glowing =
          [{
              filterType: "glow",
              filterId: "superSpookyGlow",
              outerStrength: 4,
              innerStrength: 0,
              color: effectColor,
              quality: 0.5,
              padding: 10,
              animated:
              {
                  color:
                  {
                      active: true,
                      loopDuration: 3000,
                      animType: "colorOscillation",
                      val1: 0xFFFFFF,
                      val2: effectColor
                  }
              }
          }];
      let burning =
          [
              {
                  filterType: "zapshadow",
                  filterId: "myPureFireShadow",
                  alphaTolerance: 0.50
              },
              {
                  filterType: "xglow",
                  filterId: "myPureFireAura",
                  auraType: 2,
                  color: effectColor,
                  thickness: 9.8,
                  scale: 4.,
                  time: 0,
                  auraIntensity: 2,
                  subAuraIntensity: 1.5,
                  threshold: 0.40,
                  discard: true,
                  animated:
                  {
                      time:
                      {
                          active: true,
                          speed: 0.0027,
                          animType: "move"
                      },
                      thickness:
                      {
                          active: true,
                          loopDuration: 3000,
                          animType: "cosOscillation",
                          val1: 2,
                          val2: 5
                      }
                  }
              }];

      let bonfire =
          [{
              filterType: "zapshadow",
              filterId: "myZap",
              alphaTolerance: 0.45
          }, {
              filterType: "field",
              filterId: "myLavaRing",
              shieldType: 6,
              gridPadding: 1.25,
              color: effectColor,
              time: 0,
              blend: 14,
              intensity: 1,
              lightAlpha: 0,
              lightSize: 0.7,
              scale: 1,
              radius: 1,
              chromatic: false,
              discardThreshold: 0.30,
              hideRadius: 0.95,
              alphaDiscard: true,
              animated:
              {
                  time:
                  {
                      active: true,
                      speed: 0.0015,
                      animType: "move"
                  },
                  radius:
                  {
                      active: true,
                      loopDuration: 6000,
                      animType: "cosOscillation",
                      val1: 1,
                      val2: 0.8
                  },
                  hideRadius:
                  {
                      active: true,
                      loopDuration: 3000,
                      animType: "cosOscillation",
                      val1: 0.75,
                      val2: 0.4
                  }
              }
          }, {
              filterType: "xglow",
              filterId: "myBurningAura",
              auraType: 2,
              color: effectColor,
              thickness: 9.8,
              scale: 1.,
              time: 0,
              auraIntensity: 2,
              subAuraIntensity: 1,
              threshold: 0.30,
              discard: true,
              zOrder: 3000,
              animated:
              {
                  time:
                  {
                      active: true,
                      speed: 0.0027,
                      animType: "move"
                  },
                  thickness:
                  {
                      active: true,
                      loopDuration: 600,
                      animType: "cosOscillation",
                      val1: 4,
                      val2: 8
                  }
              }
          }];

      if (actorToken) {
          await TokenMagic.deleteFilters(actorToken);
          if (newAnimaValue > 2) {
              if (newAnimaValue >= 7) {
                  await TokenMagic.addUpdateFilters(actorToken, bonfire);
                  if (actorToken.actor.system.details.caste.toLowerCase() === "sovereign") {
                      await TokenMagic.addUpdateFilters(actorToken, sovereign);
                  }
              }
              else if (newAnimaValue >= 5) {
                  await TokenMagic.addUpdateFilters(actorToken, burning);
                  if (actorToken.actor.system.details.caste.toLowerCase() === "sovereign") {
                      await TokenMagic.addUpdateFilters(actorToken, sovereign);
                  }
              }
              else {
                await TokenMagic.addUpdateFilters(actorToken, glowing);
              }
          }
      }
  }
}