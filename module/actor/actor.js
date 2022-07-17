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

    const actorData = this.system;
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
    const data = actorData;
    this._prepareBaseActorData(data);
    let totalHealth = 0;
    let currentPenalty = 0;
    data.motes.total = data.essence.value * 2 + Math.floor((data.essence.value - 1) / 2) + 3;
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
  }

  _prepareNpcData(actorData) {
    const data = actorData;
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
    if(updateData?.system?.motes) {
      if(updateData?.system?.motes.commited !== undefined && this.system.details.exalt !== 'getimian') {
        const commitChange = Math.max(0, system.motes.commited - this.system.motes.commited);
        const newMotes = Math.max(0, this.system.motes.value - commitChange);
        updateData.data.motes.value = newMotes;
      }
      if(updateData?.system?.motes.value !== undefined) {
        const animaChange = Math.max(0, this.system.motes.value - updateData.system.motes.value);
        const newAnima = Math.min(10, this.system.anima.value + animaChange);
        updateData.system.anima = { 'value': newAnima };
      }
    }
    if(updateData?.system?.flowing?.value  !== undefined) {
      const animaChange = Math.max(0, this.system.flowing.value - updateData.system.flowing.value);
      const newAnima = Math.min(10, this.system.anima.value + animaChange);
      updateData.system.anima = { 'value': newAnima };
    }
    if(updateData?.system?.still?.value  !== undefined) {
      const animaChange = Math.max(0, this.system.still.value - updateData.system.still.value);
      const newAnima = Math.min(10, this.system.anima.value + animaChange);
      updateData.system.anima = { 'value': newAnima };
    }
  }

  _prepareBaseActorData(data) {
    data.motes.total = data.essence.value * 2 + Math.floor((data.essence.value - 1) / 2) + 3;
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