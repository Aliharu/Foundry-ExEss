import RollForm from "../apps/dice-roller.js";

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
