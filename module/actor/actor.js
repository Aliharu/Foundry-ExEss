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

    const actorData = this.data;
    const data = actorData.data;
    const flags = actorData.flags;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    if (actorData.type === 'character') this._prepareCharacterData(actorData);
    if (actorData.type === 'npc') this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    // Make modifications to data here. For example:
    const data = actorData.data;
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
    const data = actorData.data;
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
    if(updateData?.data?.motes) {
      if(updateData?.data?.motes.commited !== undefined && this.data.data.details.exalt !== 'getimian') {
        const commitChange = Math.max(0, updateData.data.motes.commited - this.data.data.motes.commited);
        const newMotes = Math.max(0, this.data.data.motes.value - commitChange);
        updateData.data.motes.value = newMotes;
      }
      if(updateData?.data?.motes.value !== undefined) {
        const animaChange = Math.max(0, this.data.data.motes.value - updateData.data.motes.value);
        const newAnima = Math.min(10, this.data.data.anima.value + animaChange);
        updateData.data.anima = { 'value': newAnima };
      }
    }
    if(updateData?.data?.flowing?.value  !== undefined) {
      const animaChange = Math.max(0, this.data.data.flowing.value - updateData.data.flowing.value);
      const newAnima = Math.min(10, this.data.data.anima.value + animaChange);
      updateData.data.anima = { 'value': newAnima };
    }
    if(updateData?.data?.still?.value  !== undefined) {
      const animaChange = Math.max(0, this.data.data.still.value - updateData.data.still.value);
      const newAnima = Math.min(10, this.data.data.anima.value + animaChange);
      updateData.data.anima = { 'value': newAnima };
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