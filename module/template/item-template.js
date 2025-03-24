import { activatableData, costData, traitField } from "./common-template.js";

const fields = foundry.data.fields;

class CommonItemData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        // Note that the return is just a simple object
        return {
            description: new fields.HTMLField({ initial: "" }),
            pagenum: new fields.StringField({ initial: "" }),
        }
    }
}

export class ItemData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            quantity: new fields.NumberField({ initial: 1 }),
        }
    }
}


export class ItemWeaponData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            accuracy: new fields.NumberField({ initial: 0 }),
            damage: new fields.NumberField({ initial: 0 }),
            defence: new fields.NumberField({ initial: 0 }),
            defense: new fields.NumberField({ initial: 0 }),
            overwhelming: new fields.NumberField({ initial: 0 }),
            equipped: new fields.BooleanField({ initial: true }),
            weapontype: new fields.StringField({ initial: "melee" }),
            attackeffectpreset: new fields.StringField({ initial: "none" }),
            attackeffect: new fields.StringField({ initial: "" }),
            weight: new fields.StringField({ initial: "" }),
            traits: new fields.SchemaField({
                weapontags: traitField(),
            }),
        }
    }
}

export class ItemArmorData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            soak: new fields.NumberField({ initial: 0 }),
            penalty: new fields.NumberField({ initial: 0 }),
            hardness: new fields.NumberField({ initial: 0 }),
            tags: new fields.StringField({ initial: "" }),
            equipped: new fields.BooleanField({ initial: true }),
            weight: new fields.StringField({ initial: "" }),
            traits: new fields.SchemaField({
                armortags: traitField(),
            }),
        }
    }
}

export class ItemMeritData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            merittype: new fields.StringField({ initial: "story" }),
            rating: new fields.StringField({ initial: "" }),
        }
    }
}

export class ItemRitualData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            will: new fields.NumberField({ initial: 0 }),
        }
    }
}

export class ItemIntimacyData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            visible: new fields.BooleanField({ initial: false }),
            strength: new fields.StringField({ initial: "minor" }),
            intimacytype: new fields.StringField({ initial: "tie" }),
            virtue: new fields.StringField({ initial: "" }),
        }
    }
}

export class ItemQualityData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            ...costData(),
        }
    }
}

export class ItemSpellData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            circle: new fields.StringField({ initial: "first" }),
            cost: new fields.NumberField({ initial: 0 }),
            spelltype: new fields.StringField({ initial: "universal" }),
        }
    }
}

export class ItemCharmData extends CommonItemData {
    static defineSchema() {
        const commonData = super.defineSchema();

        return {
            ...commonData,
            ...activatableData(),
            ...costData(),
            charmtype: new fields.StringField({ initial: "other" }),
            ability: new fields.StringField({ initial: "athletics" }),
            requirement: new fields.NumberField({ initial: 0 }),
            essence: new fields.NumberField({ initial: 0 }),
            diceroller: new fields.SchemaField({
                bonusdice: new fields.NumberField({ initial: 0 }),
                bonussuccesses: new fields.NumberField({ initial: 0 }),
                doublesuccess: new fields.NumberField({ initial: 11 }),
                decreasetargetnumber: new fields.NumberField({ initial: 0 }),
                rerolldice: new fields.NumberField({ initial: 0 }),
                dicetosuccesses: new fields.NumberField({ initial: 0 }),
                rerollfailed: new fields.BooleanField({ initial: false }),
                rolltwice: new fields.BooleanField({ initial: false }),
                activateaura: new fields.StringField({ initial: "none" }),
                damage: new fields.SchemaField({
                    bonusdice: new fields.NumberField({ initial: 0 }),
                    bonussuccesses: new fields.NumberField({ initial: 0 }),
                    doublesuccess: new fields.NumberField({ initial: 11 }),
                    targetnumber: new fields.NumberField({ initial: 7 }),
                    overwhelming: new fields.NumberField({ initial: 0 }),
                    ignoresoak: new fields.NumberField({ initial: 0 }),
                    doubleextrasuccess: new fields.BooleanField({ initial: false }),
                }),
                opposedbonuses: new fields.SchemaField({
                    enabled: new fields.BooleanField({ initial: false }),
                    defense: new fields.NumberField({ initial: 0 }),
                    soak: new fields.NumberField({ initial: 0 }),
                    resolve: new fields.NumberField({ initial: 0 }),
                }),
            }),
        }
    }
}