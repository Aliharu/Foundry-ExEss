const diceDialog = class extends Dialog {
    activateListeners (html) {
      super.activateListeners(html);
      html.find('.collapsable').click(ev => {
        const li = $(ev.currentTarget).next();
        li.toggle("fast");
      });
    }
  }

function _baseAbilityDieRoll(html, actor, characterType = 'character', rollType = 'ability') {
    let dice = 0;
    let augmentAttribute = false;
    let successModifier = parseInt(html.find('#success-modifier').val()) || 0;
    let woundPenalty = html.find('#wound-penalty').is(':checked');


    if(rollType === 'baseRoll') {
        dice = parseInt(html.find('#dice').val()) || 0;
    }
    else{
        const data = actor.data.data;
        let stunt = html.find('#stunt').is(':checked');
        let flurry = html.find('#flurry').is(':checked');
        let armorPenalty = html.find('#armor-penalty').is(':checked');
        if (characterType === 'character') {
            let attribute = html.find('#attribute').val();
            let ability = html.find('#ability').val();
            let attributeExcellency = html.find('#attribute-excellency').is(':checked');
            let abilityExcellency = html.find('#ability-excellency').is(':checked');
            let attributeDice = data.attributes[attribute].value;
            let abilityDice = data.abilities[ability].value;
    
            if (attributeExcellency) {
                attributeDice = attributeDice * 2;
                if (data.details.exalt === "alchemical") {
                    if (data.attributes[attribute].aug) {
                        if (data.attributes[attribute].value < 5) {
                            attributeDice++;
                        }
                        if (data.essence.value > 1) {
                            augmentAttribute = true;
                        }
                    }
                }
            }
            if (abilityExcellency) {
                abilityDice = abilityDice * 2;
            }

            if (data.creaturetype === 'exalt') {
                if (data.details.exalt === "getimian") {
                    if (attribute === "force" && (data.still.total < data.flowing.total)) {
                        successModifier += 1;
                    }
                    if (attribute === "finesse" && (data.still.total > data.flowing.total)) {
                        successModifier += 1;
                    }
                    if (attribute === "fortitude" && (data.still.total >= (data.flowing.total - 1) && data.still.total <= (data.flowing.total + 1))) {
                        successModifier += 1;
                    }
                }
            }
    
            dice = attributeDice + abilityDice;
        }
        else if (characterType === 'npc') {
            let poolExcellency = html.find('#pool-excellency').is(':checked');
            let pool = html.find('#pool').val();
            let poolDice = data.pools[pool].value;
            dice = poolDice;
    
            if (poolExcellency) {
                if (pool === 'primary') {
                    dice += 4;
                }
                else if (pool === 'secondary') {
                    dice += 3;
                }
            }
    
            if (data.battlegroup && rollType == 'attack') {
                dice += data.drill.value;
            }
        }
        if (woundPenalty && data.health.penalty !== 'inc') {
            dice -= data.health.penalty;
        }
        if (armorPenalty) {
            for (let armor of actor.armor) {
                if (armor.data.equiped) {
                    dice = dice - Math.abs(armor.data.penalty);
                }
            }
        }
        if (stunt) {
            dice += 2;
        }
        if (flurry) {
            dice -= 3;
        }
    }

    let rerollNumber = parseInt(html.find('#reroll-number').val()) || 0;
    let targetNumber = parseInt(html.find('#target-number').val()) || 7;

    let diceModifier = parseInt(html.find('#dice-modifier').val()) || 0;

    let doubleSuccess = _calculateDoubleDice(html, augmentAttribute);

    let rerollFailed = html.find('#reroll-failed').is(':checked');

    let rerollString = '';
    let rerolls = [];

    for (let i = 1; i <= 10; i++) {
        if (html.find(`#reroll-${i}`).is(':checked')) {
            rerollString += `x${i}`;
            rerolls.push(i);
        }
    }
    if (diceModifier) {
        dice += diceModifier;
    }

    let roll = new Roll(`${dice}d10${rerollString}${rerollFailed ? "r<7" : ""}cs>=${targetNumber}`).evaluate({ async: false });
    let diceRoll = roll.dice[0].results;
    var failedDice = Math.min(dice - roll.total, rerollNumber);
    let rerolledDice = 0;
    let total = 0;

    while(failedDice != 0 && (rerolledDice < rerollNumber)) {
        rerolledDice += failedDice;
        var failedDiceRoll = new Roll(`${failedDice}d10cs>=7`).evaluate({ async: false });
        failedDice = Math.min(failedDice - failedDiceRoll.total, (rerollNumber - rerolledDice));
        diceRoll = diceRoll.concat(failedDiceRoll.dice[0].results);
        total += failedDiceRoll.total;
    }

    let getDice = "";
    let bonus = 0;

    for (let dice of diceRoll) {
        if (dice.result >= doubleSuccess) {
            bonus++;
            getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
        }
        else if (dice.result >= targetNumber) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
        else if (rerolls.includes(dice.result)) { getDice += `<li class="roll die d10 discarded">${dice.result}</li>`; }
        else if (dice.result == 1) { getDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
        else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
    }

    total += roll.total;
    if (bonus) total += bonus;
    if (successModifier) total += successModifier;

    return { dice: dice, roll: roll, getDice: getDice, total: total };
}

export async function openRollDialogue(actor) {
    let confirmed = false;
    const template = "systems/exaltedessence/templates/dialogues/dice-roll.html";
    const html = await renderTemplate(template, {'baseRoll': true});
    // @ts-ignore
    new diceDialog({
        title: `Die 10 Roller`,
        content: html,
        buttons: {
            roll: { label: "Roll it!", callback: () => confirmed = true },
            cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        close: html => {
            if (confirmed) {
                var rollResults = _baseAbilityDieRoll(html, actor, 'character', 'baseRoll');
                let successModifier = parseInt(html.find('#success-modifier').val()) || 0;

                let messageContent = `<div class="chat-card">
                                <div class="card-content">Dice Roll</div>
                                <div class="card-buttons">
                                    <div class="flexrow 1">
                                        <div>Dice Roller - Number of Successes<div class="dice-roll">
                                                <div class="dice-result">
                                                    <h4 class="dice-formula">${rollResults.dice} Dice + ${successModifier} successes</h4>
                                                    <div class="dice-tooltip">
                                                        <div class="dice">
                                                            <ol class="dice-rolls">${rollResults.getDice}</ol>
                                                        </div>
                                                    </div>
                                                    <h4 class="dice-total">${rollResults.total} Succeses</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                ChatMessage.create({ user: game.user.id, speaker: actor != null ? ChatMessage.getSpeaker({ actor: actor }) : null, content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });
            }
        }
    }).render(true);
}

export async function buildResource(actor, type = 'power') {
    const characterType = actor.data.type;
    let confirmed = false;
    const data = actor.data.data;
    const template = "systems/exaltedessence/templates/dialogues/ability-roll.html";
    const highestAttribute = characterType === "npc" ? null : _getHighestAttribute(data);
    const html = await renderTemplate(template, { 'character-type': characterType, 'attribute': highestAttribute, "ability": type === "will" ? "sagacity" : null, "buildPower": type === 'power' });
    // @ts-ignore
    new diceDialog({
        title: `Die Roller`,
        content: html,
        buttons: {
            roll: { label: "Roll it!", callback: () => confirmed = true },
            cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        close: html => {
            if (confirmed) {
                var rollResults = _baseAbilityDieRoll(html, actor, characterType, type);
                let successModifier = parseInt(html.find('#success-modifier').val()) || 0;
                var total = rollResults.total - 3;
                let self = (html.find('#buildPowerTarget').val() || 'self') === 'self';
                if (actor.data.type === 'npc' && type === 'power') {
                    if (data.battlegroup) {
                        successModifier += data.drill.value;
                    }
                }
                var message = '';
                if (total < 0) {
                    if (type === 'power') {
                        message = `<h4 class="dice-total">Build Power Failed</h4>`;
                    }
                    else if (type === 'will') {
                        message = `<h4 class="dice-total">Focus Will Failed</h4>`;
                    }
                }
                else {
                    let extraPower = ``;
                    if (self) {
                        const actorData = duplicate(actor);
                        if (type === 'power') {
                            if (total + actorData.data.power.value > 10) {
                                const extraPowerValue = Math.floor((total + 1 + actorData.data.power.value - 10));
                                extraPower = `<h4 class="dice-total">${extraPowerValue} Extra Power!</h4>`;
                            }
                            actorData.data.power.value = Math.min(10, total + actorData.data.power.value + 1);
                        }
                        else {
                            actorData.data.will.value = Math.min(10, total + actorData.data.will.value + 1);
                        }
                        actor.update(actorData);
                    }
                    if (type === 'power') {
                        message = `<h4 class="dice-formula">${rollResults.total} Succeses</h4> <h4 class="dice-total">${total + 1} Power Built!</h4> ${extraPower}`;
                    }
                    else if (type === 'will') {
                        message = `<h4 class="dice-formula">${rollResults.total} Succeses</h4> <h4 class="dice-total">${total + 1} Will Focused!</h4>`;
                    }
                }
                let the_content = `
          <div class="chat-card">
              <div class="card-content">Dice Roll</div>
              <div class="card-buttons">
                  <div class="flexrow 1">
                      <div>Dice Roller - Number of Successes<div class="dice-roll">
                              <div class="dice-result">
                                  <h4 class="dice-formula">${rollResults.dice} Dice + ${successModifier} successes</h4>
                                  <div class="dice-tooltip">
                                      <div class="dice">
                                          <ol class="dice-rolls">${rollResults.getDice}</ol>
                                      </div>
                                  </div>
                                  ${message}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          `
                ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: actor }), content: the_content, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });
            }
        }
    }).render(true);
}

export async function socialInfluence(actor) {
    const characterType = actor.data.type;
    let confirmed = false;
    const data = actor.data.data;
    let resolve = 0;
    let target = Array.from(game.user.targets)[0] || null;
    if (target) {
        resolve = target.actor.data.data.resolve.value;
    }
    const template = "systems/exaltedessence/templates/dialogues/ability-roll.html";
    const highestAttribute = characterType === "npc" ? null : _getHighestAttribute(data);
    const html = await renderTemplate(template, { 'character-type': characterType, 'attribute': highestAttribute, "ability": 'embassy', "social": true, "resolve": resolve });
    // @ts-ignore
    new diceDialog({
        title: `Die Roller`,
        content: html,
        buttons: {
            roll: { label: "Roll it!", callback: () => confirmed = true },
            cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        close: html => {
            if (confirmed) {
                var rollResults = _baseAbilityDieRoll(html, actor, characterType, 'socialInfluence');
                let successModifier = parseInt(html.find('#success-modifier').val()) || 0;
                resolve = parseInt(html.find('#resolve').val()) || 0;
                let self = (html.find('#buildPowerTarget').val() || 'self') === 'self';
                if (actor.data.type === 'npc' && type === 'power') {
                    if (data.battlegroup) {
                        successModifier += data.drill.value;
                    }
                }
                var message = '';
                if (rollResults.total < resolve) {
                    message = `<h4 class="dice-total">Influence Failed</h4>`;
                }
                else {
                    var total = rollResults.total - resolve;
                    message = `<h4 class="dice-formula">${rollResults.total} Succeses</h4> <h4 class="dice-total">${total} Extra Successes!</h4>`;
                }
                let the_content = `
          <div class="chat-card">
              <div class="card-content">Dice Roll</div>
              <div class="card-buttons">
                  <div class="flexrow 1">
                      <div>Dice Roller - Number of Successes<div class="dice-roll">
                              <div class="dice-result">
                                  <h4 class="dice-formula">${rollResults.dice} Dice + ${successModifier} successes</h4>
                                  <h4 class="dice-formula">${resolve} Resolve</h4>
                                  <div class="dice-tooltip">
                                      <div class="dice">
                                          <ol class="dice-rolls">${rollResults.getDice}</ol>
                                      </div>
                                  </div>
                                  ${message}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          `
                ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: actor }), content: the_content, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });
            }
        }
    }).render(true);
}

export async function openAbilityRollDialogue(actor, ability = "athletics") {
    const data = actor.data.data;
    const characterType = actor.data.type;
    let confirmed = false;
    if (characterType === "npc" && ability === "athletics") {
        ability = "primary";
    }
    const template = "systems/exaltedessence/templates/dialogues/ability-roll.html"
    const highestAttribute = characterType === "npc" ? null : _getHighestAttribute(data);
    const html = await renderTemplate(template, { 'character-type': characterType, 'attribute': highestAttribute, ability: ability });
    // @ts-ignore
    new diceDialog({
        title: `Die Roller`,
        content: html,
        buttons: {
            roll: { label: "Roll it!", callback: () => confirmed = true },
            cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        close: html => {
            if (confirmed) {
                var rollResults = _baseAbilityDieRoll(html, actor, characterType, 'ability');
                let bonusSuccesses = parseInt(html.find('#success-modifier').val()) || 0;
                let the_content = `
          <div class="chat-card">
              <div class="card-content">Dice Roll</div>
              <div class="card-buttons">
                  <div class="flexrow 1">
                      <div>Dice Roller - Number of Successes<div class="dice-roll">
                              <div class="dice-result">
                                  <h4 class="dice-formula">${rollResults.dice} Dice + ${bonusSuccesses} successes</h4>
                                  <div class="dice-tooltip">
                                      <div class="dice">
                                          <ol class="dice-rolls">${rollResults.getDice}</ol>
                                      </div>
                                  </div>
                                  <h4 class="dice-total">${rollResults.total} Succeses</h4>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
          `
                ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: actor }), content: the_content, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });
            }
        }
    }).render(true);
}

function _getHighestAttribute(data) {
    var highestAttributeNumber = 0;
    var highestAttribute = "force";
    for (let [name, attribute] of Object.entries(data.attributes)) {
        if (attribute.value > highestAttributeNumber) {
            highestAttributeNumber = attribute.value;
            highestAttribute = name;
        }
    }
    return highestAttribute;
}

export async function openAttackDialogue(actor, weaponAccuracy, weaponDamage, overwhelming, weaponType, attackType = 'decisive') {
    const characterType = actor.data.type;
    let confirmed = false;
    const data = actor.data.data;
    weaponAccuracy = weaponAccuracy || 0;
    weaponDamage = weaponDamage || 0;
    overwhelming = overwhelming || 0;
    const template = "systems/exaltedessence/templates/dialogues/accuracy-roll.html"
    const highestAttribute = characterType === "npc" ? null : _getHighestAttribute(data);
    const html = await renderTemplate(template, { "weapon-accuracy": weaponAccuracy, "weapon-damage": weaponDamage, "overwhelming": overwhelming, 'character-type': characterType, "attribute": highestAttribute, "ability": weaponType === "melee" ? "close" : "ranged", "power": data.power.value, "attackType": attackType });
    var rollResults = await new Promise((resolve, reject) => {
        // @ts-ignore
        return new diceDialog({
            title: `Accuracy`,
            content: html,
            buttons: {
                roll: { label: "Attack!", callback: () => confirmed = true },
                cancel: { label: "Cancel", callback: () => confirmed = false }
            },
            close: html => {
                if (confirmed) {
                    // Accuracy
                    let bonusSuccesses = parseInt(html.find('#success-modifier').val()) || 0;
                    weaponAccuracy = parseInt(weaponAccuracy);
                    var rollResults = _baseAbilityDieRoll(html, actor, characterType, 'attack');
                    let total = rollResults.total + weaponAccuracy + bonusSuccesses;
                    let title = "Decisive Attack";
                    if(attackType === 'withering') {
                        title = "Withering Attack";
                    }
                    if(attackType === 'gambit') {
                        title = "Gambit";
                    }
                    var messageContent = `
              <div class="chat-card">
                  <div class="card-content">${title}</div>
                  <div class="card-buttons">
                      <div class="flexrow 1">
                          <div>
                              <div class="dice-roll">
                                  <div class="dice-result">
                                      <h4 class="dice-formula">${rollResults.dice} Dice + ${bonusSuccesses + weaponAccuracy} successes</h4>
                                      <div class="dice-tooltip">
                                          <div class="dice">
                                              <ol class="dice-rolls">${rollResults.getDice}</ol>
                                          </div>
                                      </div>
                                      <h4 class="dice-formula">${total} Succeses</h4>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            `;
                    ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });
                    return resolve({ 'successess': total, 'baseSuccesses': rollResults.total });
                }
            }
        }).render(true);
    });

    _rollAttackDamage(actor, rollResults, weaponDamage, overwhelming, attackType);
}

async function _rollAttackDamage(actor, accuracyResult, weaponDamage, overwhelming, attackType) {
    let confirmed = false;
    const actorData = duplicate(actor);
    const template = "systems/exaltedessence/templates/dialogues/damage-roll.html"
    let soak = 0;
    let defense = 0;
    let target = Array.from(game.user.targets)[0] || null;
    if (target) {
        defense = target.actor.data.data.defence.value;
        soak = target.actor.data.data.soak.value;
    }
    let title = "Decisive Attack";
    if(attackType === 'withering') {
        title = "Withering Attack";
    }
    if(attackType === 'gambit') {
        title = "Gambit";
    }
    const html = await renderTemplate(template, { "successes": accuracyResult.successess, "power": actorData.data.power.value, "weapon-damage": weaponDamage, "overwhelming": overwhelming, "attackType": attackType, "defense": defense, "soak": soak });
    // @ts-ignore
    new diceDialog({
        title: `Damage`,
        content: html,
        buttons: {
            roll: { label: "Damage!", callback: () => confirmed = true },
            cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        close: html => {
            if (confirmed) {
                let defence = parseInt(html.find('#defence').val()) || 0;
                let soak = parseInt(html.find('#soak').val()) || 0;
                let power = parseInt(html.find('#power').val()) || 0;
                let accuracySuccesses = parseInt(html.find('#successes').val()) || 0;
                let doubleExtraSuccess = html.find('#double-extra-success').is(':checked');
                var postDefenceTotal = accuracySuccesses - defence;
                if(doubleExtraSuccess) {
                    var basePostDefenseTotal = accuracyResult.baseSuccesses - defense;
                    if(basePostDefenseTotal > 0) {
                        postDefenceTotal +=  basePostDefenseTotal * 2;
                    }
                }
                var messageContent = '';

                weaponDamage = parseInt(weaponDamage);
                overwhelming = parseInt(overwhelming);

                if (actor.data.type === 'npc') {
                    if (actorData.data.battlegroup) {
                        overwhelming = Math.min(actorData.data.size.value + 1, 5);
                    }
                }

                if (postDefenceTotal < 0) {
                    var overwhlemingMessage = '';
                    let extraPowerMessage = ``;
                    if (attackType === 'withering') {
                        overwhlemingMessage = `<h4 class="dice-total">${overwhelming} Power Built!</h4>`;
                        actorData.data.power.value = Math.min(10, overwhelming + actorData.data.power.value);
                        if (overwhelming + actorData.data.power.value > 10) {
                            const extraPowerValue = Math.floor((overwhelming + actorData.data.power.value - 10));
                            extraPowerMessage = `<h4 class="dice-total">${extraPowerValue} Extra Power!</h4>`;
                        }
                    }
                    else {
                        actorData.data.power.value = Math.max(0, actorData.data.power.value - 1);
                    }
                    actor.update(actorData);
                    messageContent = `
              <div class="chat-card">
                  <div class="card-content">${title}</div>
                  <div class="card-buttons">
                      <div class="flexrow 1">
                          <div>
                              <div class="dice-roll">
                                  <div class="dice-result">
                                      <h4 class="dice-formula">${accuracySuccesses} Succeses</h4>
                                      <h4 class="dice-formula">${defence} defence</h4>
                                      ${attackType === 'withering' ? '<h4 class="dice-formula">${overwhelming} Overwhelming</h4>' : ``}
                                      <h4 class="dice-total">Attack Missed!</h4>
                                      ${overwhlemingMessage}
                                      ${extraPowerMessage}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            `;
                    ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
                }
                else {
                    if (attackType === 'decisive') {
                        let bonusDamageDice = parseInt(html.find('#damage-dice').val()) || 0;
                        let damageSuccesses = parseInt(html.find('#damage-successes').val()) || 0;
                        //Fix to damage later
                        let doubleSevens = html.find('#double-damage-sevens').is(':checked');
                        let doubleEights = html.find('#double-damage-eights').is(':checked');
                        let doubleNines = html.find('#double-damage-nines').is(':checked');
                        let doubleTens = html.find('#double-damage-tens').is(':checked');
                        let rerollFailed = html.find('#reroll-damage-failed').is(':checked');

                        let doubleDamageSuccess = 11;

                        if (doubleSevens) {
                            doubleDamageSuccess = 7;
                        }
                        else if (doubleEights) {
                            doubleDamageSuccess = 8;
                        }
                        else if (doubleNines) {
                            doubleDamageSuccess = 9;
                        }
                        else if (doubleTens) {
                            doubleDamageSuccess = 10;
                        }
                        // Deal Damage
                        let damage = postDefenceTotal + power + bonusDamageDice;
                        if (actor.data.type === 'npc') {
                            if (actorData.data.battlegroup) {
                                damage += actorData.data.drill.value;
                            }
                        }
                        let damageRoll = new Roll(`${damage}d10${rerollFailed ? "r<7" : ""}cs>=7`).evaluate({ async: false });
                        let damageDiceRoll = damageRoll.dice[0].results;
                        let damageBonus = "";
                        let getDamageDice = "";
                        for (let dice of damageDiceRoll) {
                            // comment out if no double successes
                            if (dice.result >= doubleDamageSuccess) {
                                damageBonus++;
                                getDamageDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
                            }
                            else if (dice.result >= 7) { getDamageDice += `<li class="roll die d10 success">${dice.result}</li>`; }
                            else if (dice.result == 1) { getDamageDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
                            else { getDamageDice += `<li class="roll die d10">${dice.result}</li>`; }
                        }

                        let damageSuccess = damageRoll.total + weaponDamage;
                        if (damageBonus) damageSuccess += damageBonus;
                        if (damageSuccesses) damageSuccess += damageSuccesses;
                        let damageTotal = damageSuccess - soak;

                        actorData.data.power.value = Math.max(0, actorData.data.power.value - power);
                        actor.update(actorData);

                        messageContent = `
                <div class="chat-card">
                    <div class="card-content">Decisive Damage</div>
                    <div class="card-buttons">
                        <div class="flexrow 1">
                            <div>
                                <div class="dice-roll">
                                    <div class="dice-result">
                                        <h4 class="dice-formula">${accuracySuccesses} Succeses vs ${defence} defence</h4>
                                        <h4 class="dice-formula">${postDefenceTotal} Extra Succeses + ${power} power</h4>
                                        <h4 class="dice-formula">${damage} Damage dice + ${damageSuccesses + weaponDamage} successes </h4>
                                        <div class="dice-tooltip">
                                          <div class="dice">
                                              <ol class="dice-rolls">${getDamageDice}</ol>
                                          </div>
                                        </div>
                                        <h4 class="dice-formula">${damageSuccess} Damage - ${soak} soak</h4>
                                        <h4 class="dice-total">${damageTotal} Total Damage</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              `
                        ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: damageRoll });
                    }
                    else if(attackType === 'withering') {
                        var powerGained = postDefenceTotal + 1;
                        if (postDefenceTotal < overwhelming) {
                            powerGained = overwhelming + 1;
                        }
                        let extraPowerMessage = ``;
                        if (powerGained + actorData.data.power.value > 10) {
                            const extraPowerValue = Math.floor((powerGained + actorData.data.power.value - 10));
                            extraPowerMessage = `<h4 class="dice-total">${extraPowerValue} Extra Power!</h4>`;
                        }
                        actorData.data.power.value = Math.min(10, powerGained + actorData.data.power.value);
                        actor.update(actorData);
                        messageContent = `
                  <div class="chat-card">
                      <div class="card-content">Withering Power</div>
                      <div class="card-buttons">
                          <div class="flexrow 1">
                              <div>
                                  <div class="dice-roll">
                                      <div class="dice-result">
                                          <h4 class="dice-formula">${accuracySuccesses} Succeses vs ${defence} defence</h4>
                                          <h4 class="dice-formula">1 Base + ${postDefenceTotal} Extra Succeses</h4>
                                          <h4 class="dice-formula">${overwhelming} Overwhelming</h4>
                                          <h4 class="dice-total">${powerGained} Power Built!</h4>
                                          ${extraPowerMessage}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                `
                        ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
                    }
                    else if(attackType === 'gambit') {
                        let powerSpent = parseInt(html.find('#power-spent').val()) || 0;
                        actorData.data.power.value = Math.max(0, actorData.data.power.value - powerSpent);
                        actor.update(actorData);
                        messageContent = `
                  <div class="chat-card">
                      <div class="card-content">Withering Power</div>
                      <div class="card-buttons">
                          <div class="flexrow 1">
                              <div>
                                  <div class="dice-roll">
                                      <div class="dice-result">
                                        <h4 class="dice-formula">${accuracySuccesses} Succeses vs ${defence} defence</h4>
                                          <h4 class="dice-formula">${powerSpent} Power Spent</h4>
                                          <h4 class="dice-total">Gambit Successful!</h4>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                `
                        ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ actor: actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
                    }
                }
                if (target && game.settings.get("exaltedessence", "calculateOnslaught")) {
                    const onslaught = target.actor.effects.find(i => i.data.label == "Onslaught");
                    if(attackType === 'decisive') {
                        if(onslaught) {
                            onslaught.delete();
                        }
                    }
                    else if(attackType === 'withering') {
                        if (onslaught) {
                            let changes = duplicate(onslaught.data.changes);
                            if (target.actor.data.data.hardness.value > 0) {
                                changes[0].value = changes[0].value - 1;
                                onslaught.update({ changes });
                            }
                        }
                        else {
                            target.actor.createEmbeddedDocuments('ActiveEffect', [{
                                label: 'Onslaught',
                                icon: 'icons/svg/aura.svg',
                                origin: target.actor.uuid,
                                disabled: false,
                                "changes": [
                                    {
                                        "key": "data.hardness.value",
                                        "value": -1,
                                        "mode": 2
                                    }
                                ]
                            }]);
                        }
                    }
                }
            }
        }
    }).render(true);
}

function _calculateDoubleDice(html, augmentAttribute = false) {
    let doubleSevens = html.find('#double-sevens').is(':checked');
    let doubleEights = html.find('#double-eights').is(':checked');
    let doubleNines = html.find('#double-nines').is(':checked');
    let doubleTens = html.find('#double-tens').is(':checked');

    let doubleSuccess = 11;

    if (doubleSevens) {
        doubleSuccess = 7;
    }
    else if (doubleEights) {
        doubleSuccess = 8;
    }
    else if (doubleNines || augmentAttribute) {
        doubleSuccess = 9;
    }
    else if (doubleTens) {
        doubleSuccess = 10;
    }
    return doubleSuccess;
}