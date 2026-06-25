import RollForm from "../apps/dice-roller.js";
import { prepareItemTraits } from "../item/item.js";

export function getNumberFormula(formulaString, actor, item = null) {
    let negativeValue = false;
    if (formulaString.startsWith('-(') && formulaString.endsWith(')')) {
        formulaString = formulaString.slice(2, -1); // Remove `-(...)`
        negativeValue = true;
    }

    // Helper function to evaluate a single operation
    const evaluate = (leftVar, operand, rightVar) => {
        switch (operand) {
            case '+': return leftVar + rightVar;
            case '-': return leftVar - rightVar;
            case '*': return leftVar * rightVar;
            case '/>': return Math.ceil(leftVar / rightVar);
            case '/<': return Math.floor(leftVar / rightVar);
            case '|': return Math.max(leftVar, rightVar);
            case 'cap': return Math.min(leftVar, rightVar);
            default: throw new Error(`Unknown operator: ${operand}`);
        }
    };

    const formulaData = (changeValue, actor, item = null) => {
        let returnValue = 0;
        let negativeValue = false;
        if (parseInt(changeValue)) {
            return parseInt(changeValue);
        }
        if (changeValue.includes('-')) {
            returnValue = changeValue.replace('-', '');
            negativeValue = true;
        }
        // if (changeValue.toLowerCase() === 'activationcount') {
        //     returnValue = item.effect?.parent?.flags?.exaltedessence?.currentIterationsActive ?? 1;
        // }
        if (actor.getRollData()[changeValue]?.value) {
            returnValue = actor.getRollData()[changeValue]?.value;
        }
        if (negativeValue) {
            returnValue *= -1;
        }
        return returnValue;
    };

    // Helper function to parse values (operands)
    const parseValue = (token) => formulaData(token.trim(), actor, item);

    // Recursive function to evaluate expressions with parentheses and operations
    const evaluateExpression = (expression) => {
        // Match parentheses and solve inner expressions first
        while (expression.includes('(')) {
            expression = expression.replace(/\(([^()]+)\)/g, (_, inner) => evaluateExpression(inner));
        }

        // Split expression into tokens by operators, respecting order of operations
        const operators = [['*', '/>', '/<'], ['+', '-'], ['|', 'cap']]; // Order of precedence
        let tokens = expression.split(/(\s+)/).filter(token => token.trim() !== ''); // Split and filter whitespace

        for (const operatorGroup of operators) {
            let i = 0;
            while (i < tokens.length) {
                const token = tokens[i];
                if (operatorGroup.includes(token)) {
                    const leftVar = parseValue(tokens[i - 1]);
                    const rightVar = parseValue(tokens[i + 1]);
                    const result = evaluate(leftVar, token, rightVar);
                    tokens.splice(i - 1, 3, result.toString()); // Replace operation with result
                    i = i - 1; // Adjust index after splice
                } else {
                    i++;
                }
            }
        }

        return parseValue(tokens[0]);
    };

    // Evaluate the expression and apply the negative sign if necessary
    let formulaResult = evaluateExpression(formulaString);
    formulaResult = negativeValue ? -formulaResult : formulaResult;
    return formulaResult;
}

export async function getEnritchedHTML(item) {
    item.enritchedHTML = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { async: true, secrets: true, relativeTo: item });
}

export function sortDice(diceRoll, ignoreSetting = false) {
    return diceRoll.sort((a, b) => b.result - a.result);
}

export function toggleDisplay(target) {
    const li = target.nextElementSibling;
    if ((li.style.display || 'none') == 'none') {
        li.style.display = 'block';
    } else {
        li.style.display = 'none';
    }
}

export function parseCounterStates(states) {
    return states.split(',').reduce((obj, state) => {
        const [k, v] = state.split(':')
        obj[k] = v
        return obj
    }, {})
}

export function isColor(strColor) {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
}

export function noActorBaseRoll() {
    new RollForm(null, { classes: ["exaltedessence exaltedessence-dialog dice-roller", `${game.settings.get("exaltedessence", "sheetStyle")}-background`] }, {}, { rollType: 'base' }).render(true);
}

export function setupActorItemLists(actorData, items, collapseStates = null) {
    // Initialize containers.
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
    for (let i of items) {
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
            if (i.system.listingname) {
                if (!charms[i.system.listingname]) {
                    charms[i.system.listingname] = { name: i.system.listingname, visible: true, list: [], collapse: collapseStates?.charm[i.system.listingname] ?? true };
                }
                charms[i.system.listingname].list.push(i);
            } else {
                if (i.system.ability !== undefined) {
                    charms[i.system.ability].list.push(i);
                    charms[i.system.ability].visible = true;
                }
            }
        }
        else if (i.type === 'spell') {
            if (i.system.listingname) {
                if (!spells[i.system.listingname]) {
                    spells[i.system.listingname] = { name: i.system.listingname, visible: true, list: [], collapse: collapseStates?.spell[i.system.listingname] ?? true };
                }
                spells[i.system.listingname].list.push(i);
            } else {
                if (i.system.circle !== undefined) {
                    spells[i.system.circle].list.push(i);
                    spells[i.system.circle].visible = true;
                }
            }

        }
    }

    for (const spell of Object.values(spells)) {
        spell.list.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    }

    for (const charm of Object.values(charms)) {
        charm.list.sort((a, b) => (a.sort || 0) - (b.sort || 0));
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

export function createListSections(items) {
    const sectionList = {};

    for (const item of items) {
        if (item.system.listingname) {
            if (!sectionList[item.system.listingname]) {
                sectionList[item.system.listingname] = { name: item.system.listingname, visible: true, list: [], collapse: true };
            }
            sectionList[item.system.listingname].list.push(item);
        }
        else {
            switch (item.type) {
                case 'charm':
                    if (!sectionList[item.system.ability]) {
                        sectionList[item.system.ability] = { name: game.i18n.localize(CONFIG.EXALTEDESSENCE.selects.charmAbilities[item.system.ability]) || 'Ex3.Other', visible: true, list: [], collapse: true };
                    }
                    sectionList[item.system.ability].list.push(item);
                    break;
                case 'spell':
                    if (!sectionList[item.system.circle]) {
                        sectionList[item.system.circle] = { name: `${game.i18n.localize(CONFIG.EXALTEDESSENCE.selects.sorceryCircles[item.system.circle])} Spells`, visible: true, list: [], collapse: true };
                    }
                    sectionList[item.system.circle].list.push(item);
                    break;
                case 'merit':
                    if (!sectionList['merits']) {
                        sectionList['merits'] = { name: game.i18n.localize("ExEss.Merits"), list: [], collapse: true };
                    }
                    sectionList['merits'].list.push(item);
                    break;
                case 'armor':
                    if (item.system.traits.armortags.value.includes('artifact')) {
                        sectionList[`armorArtifact${item.system.weighttype}`] = {
                            name: `${game.i18n.localize(CONFIG.EXALTEDESSENCE.weightTypes[item.system.weighttype])} Artifact Armor`,
                            list: [],
                            collapse: true
                        }
                        sectionList[`armorArtifact${item.system.weighttype}`].list.push(item);
                    }
                    else {
                        sectionList[`armor${item.system.weighttype}`] = {
                            name: `${game.i18n.localize(CONFIG.EXALTEDESSENCE.weightTypes[item.system.weighttype])} Mundane Armor`,
                            list: [],
                            collapse: true
                        }
                        sectionList[`armor${item.system.weighttype}`].list.push(item);
                    }
                    break;
                case 'weapon':
                    if (item.system.traits.weapontags.value.includes('artifact')) {
                        if (!sectionList[`weaponArtifact${item.system.weighttype}`]) {
                            sectionList[`weaponArtifact${item.system.weighttype}`] = {
                                name: `${game.i18n.localize(CONFIG.EXALTEDESSENCE.weightTypes[item.system.weighttype])} Artifact Weapons`,
                                list: [],
                                collapse: true
                            }
                        }
                        sectionList[`weaponArtifact${item.system.weighttype}`].list.push(item);
                    }
                    else {
                        if (!sectionList[`weapon${item.system.weighttype}`]) {
                            sectionList[`weapon${item.system.weighttype}`] = {
                                name: `${game.i18n.localize(CONFIG.EXALTEDESSENCE.weightTypes[item.system.weighttype])} Mundane Weapons`,
                                list: [], collapse: true
                            }
                        }
                        sectionList[`weapon${item.system.weighttype}`].list.push(item);
                    }
                    break;
                case 'item':
                    if (!sectionList['items']) {
                        sectionList['items'] = { name: game.i18n.localize("ExEss.Items"), list: [], collapse: true };
                    }
                    sectionList['items'].list.push(item);
                    break;
                case 'ritual':
                    if (!sectionList['shapingRituals']) {
                        sectionList['shapingRituals'] = { name: game.i18n.localize("ExEss.ShapingRituals"), list: [], collapse: true };
                    }
                    sectionList['shapingRituals'].list.push(item);
                    break;
                case 'quality':
                    if (!sectionList['qualities']) {
                        sectionList['qualities'] = { name: game.i18n.localize("ExEss.Qualities"), list: [], collapse: true };
                    }
                    sectionList['qualities'].list.push(item);
                default:
                    if (!sectionList['otherItems']) {
                        sectionList['otherItems'] = { name: game.i18n.localize("ExEss.Other"), list: [], collapse: true };
                    }
                    sectionList['otherItems'].list.push(item);
                    break;
            }
        }
    }
    return sectionList;
}