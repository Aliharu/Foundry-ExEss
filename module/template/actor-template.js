import { abilityField, attributeField, resourceField, statField, traitField } from "./common-template.js";

const fields = foundry.data.fields;

class CommonActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    // Note that the return is just a simple object
    return {
      biography: new fields.HTMLField({ initial: "" }),
      details: new fields.SchemaField({
        exalt: new fields.StringField({ initial: "other" }),
        caste: new fields.StringField({ initial: "" }),
        color: new fields.StringField({ initial: "#000000" }),
        animacolor: new fields.StringField({ initial: "#FFFFFF" }),
        initiativeiconcolor: new fields.StringField({ initial: "#F9B516" }),
        initiativeicon: new fields.StringField({ initial: "sun" }),
        majorvirtue: new fields.StringField({ initial: "" }),
        minorvirtue: new fields.StringField({ initial: "" }),
        hunt: new fields.StringField({ initial: "" }),
        aura: new fields.StringField({ initial: "none" }),
        devilbody: new fields.StringField({ initial: "" }),
        nature: new fields.StringField({ initial: "" }),
      }),
      motes: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0 }),
        min: new fields.NumberField({ initial: 0 }),
        max: new fields.NumberField({ initial: 5 }),
        committed: new fields.NumberField({ initial: 0 }),
      }),
      flowing: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0 }),
        min: new fields.NumberField({ initial: 0 }),
        total: new fields.NumberField({ initial: 0 }),
      }),
      still: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0 }),
        min: new fields.NumberField({ initial: 0 }),
        total: new fields.NumberField({ initial: 0 }),
      }),
      anima: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0 }),
        min: new fields.NumberField({ initial: 0 }),
        max: new fields.NumberField({ initial: 10 }),
        passive: new fields.StringField({ initial: "" }),
        active: new fields.StringField({ initial: "" }),
        iconic: new fields.StringField({ initial: "" }),
        level: new fields.StringField({ initial: "" }),
      }),
      essence: resourceField(1, 10),
      power: resourceField(0, 10),
      will: statField(0),
      defense: statField(0),
      shieldinitiative: statField(0),
      soak: statField(0),
      armoredsoak: statField(0),
      naturalsoak: statField(1),
      hardness: statField(3),
      stunt: statField(0),
      resolve: statField(2),
      savedRolls: new fields.ObjectField({ initial: {} }),
      traits: new fields.SchemaField({
        languages: traitField(),
      }),
      settings: new fields.SchemaField({
        charmspendpool: new fields.StringField({ initial: "flowing" }),
      }),
      collapse: new fields.SchemaField({
        passive: new fields.BooleanField({ initial: true }),
        active: new fields.BooleanField({ initial: true }),
        iconic: new fields.BooleanField({ initial: true }),
      }),
    }
  }
}

export class CharacterData extends CommonActorData {
  static defineSchema() {
    // CharacterData inherits those resource fields
    const commonData = super.defineSchema();
    return {
      // Using destructuring to effectively append our additional data here
      ...commonData,

      attributes: new fields.SchemaField({
        force: attributeField("ExEss.Force"),
        finesse: attributeField("ExEss.Finesse"),
        fortitude: attributeField("ExEss.Fortitude"),
      }),
      abilities: new fields.SchemaField({
        athletics: abilityField("ExEss.Athletics"),
        awareness: abilityField("ExEss.Awareness"),
        close: abilityField("ExEss.CloseCombat"),
        craft: abilityField("ExEss.Craft"),
        embassy: abilityField("ExEss.Embassy"),
        integrity: abilityField("ExEss.Integrity"),
        navigate: abilityField("ExEss.Navigate"),
        performance: abilityField("ExEss.Performance"),
        physique: abilityField("ExEss.Physique"),
        presence: abilityField("ExEss.Presence"),
        ranged: abilityField("ExEss.RangedCombat"),
        sagacity: abilityField("ExEss.Sagacity"),
        stealth: abilityField("ExEss.Stealth"),
        war: abilityField("ExEss.War"),
      }),
      health: new fields.SchemaField({
        levels: new fields.SchemaField({
          zero: new fields.SchemaField({
            value: new fields.NumberField({ initial: 1 }),
            penalty: new fields.NumberField({ initial: 0 }),
          }),
          one: new fields.SchemaField({
            value: new fields.NumberField({ initial: 2 }),
            penalty: new fields.NumberField({ initial: 1 }),
          }),
          two: new fields.SchemaField({
            value: new fields.NumberField({ initial: 2 }),
            penalty: new fields.NumberField({ initial: 2 }),
          }),
          inc: new fields.SchemaField({
            value: new fields.NumberField({ initial: 1 }),
            penalty: new fields.StringField({ initial: "inc" }),
          }),
        }),
        value: new fields.NumberField({ initial: 0 }),
        min: new fields.NumberField({ initial: 0 }),
        max: new fields.NumberField({ initial: 0 }),
        lethal: new fields.NumberField({ initial: 0 }),
        aggravated: new fields.NumberField({ initial: 0 }),
        penalty: new fields.NumberField({ initial: 0 }),
      }),
      evasion: statField(0),
      parry: statField(0),
      advantages: new fields.SchemaField({
        one: new fields.StringField({ initial: "" }),
        two: new fields.StringField({ initial: "" }),
        resonance: new fields.StringField({ initial: "" }),
      }),
      milestones: new fields.SchemaField({
        personal: new fields.StringField({ initial: "0" }),
        minor: new fields.StringField({ initial: "0" }),
        exalt: new fields.StringField({ initial: "0" }),
        major: new fields.StringField({ initial: "0" }),
        triggers: new fields.StringField({ initial: "" }),
      }),
    }
  }

  static migrateData(source) {
    if(source.attributes?.force?.name === '') {
      source.attributes.force.name = 'ExEss.Force';
    }
    if(source.attributes?.finesse?.name === '') {
      source.attributes.finesse.name = 'ExEss.Finesse';
    }
    if(source.attributes?.fortitude?.name === '') {
      source.attributes.fortitude.name = 'ExEss.Fortitude';
    }
    return super.migrateData(source);
  }
}

export class NpcData extends CommonActorData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      creaturetype: new fields.StringField({ initial: "mortal" }),
      health: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0 }),
        min: new fields.NumberField({ initial: 0 }),
        max: new fields.NumberField({ initial: 0 }),
        levels: new fields.NumberField({ initial: 0 }),
        lethal: new fields.NumberField({ initial: 0 }),
        aggravated: new fields.NumberField({ initial: 0 }),
        penalty: new fields.NumberField({ initial: 0 }),
      }),
      pools: new fields.SchemaField({
        primary: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
          actions: new fields.StringField({ initial: "" }),
        }),
        secondary: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
          actions: new fields.StringField({ initial: "" }),
        }),
        tertiary: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0 }),
          actions: new fields.StringField({ initial: "" }),
        }),
      }),
      battlegroup: new fields.BooleanField({ initial: false }),
      commandbonus: statField(0),
      size: statField(0),
      drill: statField(0),
      qualities: new fields.StringField({ initial: "" }),
    }
  }
}