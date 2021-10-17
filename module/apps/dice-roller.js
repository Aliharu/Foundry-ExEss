export async function openRollDialogue(actor) {
    let confirmed = false;
    const template = "systems/exaltedessence/templates/dialogues/dice-roll.html";
    const html = await renderTemplate(template, {});
    new Dialog({
        title: `Die 10 Roller`,
        content: html,
        buttons: {
            roll: { label: "Roll it!", callback: () => confirmed = true },
            cancel: { label: "Cancel", callback: () => confirmed = false }
        },
        close: html => {
            if (confirmed) {
                let doubleSuccess = parseInt(html.find('#double-success').val()) || 10;
                let dice = parseInt(html.find('#num').val()) || 0;
                let successModifier = parseInt(html.find('#success-modifier').val()) || 0;
                let targetNumber = parseInt(html.find('#target-number').val()) || 7;
                let rerollFailed = html.find('#reroll-failed').is(':checked');
                let rerollNumber = parseInt(html.find('#reroll-number').val()) || 0;

                let rerollString = '';
                let rerolls = [];

                for (let i = 1; i <= 10; i++) {
                    if (html.find(`#reroll-${i}`).is(':checked')) {
                        rerollString += `x${i}`;
                        rerolls.push(i);
                    }
                }

                let rerolledDice = 0;
                let bonus = 0;
                let total = 0;
                let get_dice = "";

                let roll = new Roll(`${dice}d10${rerollString}${rerollFailed ? "r<7" : ""}cs>=${targetNumber}`).evaluate({ async: false });
                let dice_roll = roll.dice[0].results;

                for (let dice of dice_roll) {
                    if (dice.result >= doubleSuccess) {
                        bonus++;
                        get_dice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
                    }
                    else if (dice.result >= targetNumber) { get_dice += `<li class="roll die d10 success">${dice.result}</li>`; }
                    else if (rerolls.includes(dice.result)) { get_dice += `<li class="roll die d10 discarded">${dice.result}</li>`; }
                    else if (dice.result == 1) { get_dice += `<li class="roll die d10 failure">${dice.result}</li>`; }
                    else { get_dice += `<li class="roll die d10">${dice.result}</li>`; }
                }
                total += roll.total;


                if (bonus) total += bonus;
                if (successModifier) total += successModifier;

                let the_content = `<div class="chat-card">
                                <div class="card-content">Dice Roll</div>
                                <div class="card-buttons">
                                    <div class="flexrow 1">
                                        <div>Dice Roller - Number of Successes<div class="dice-roll">
                                                <div class="dice-result">
                                                    <h4 class="dice-formula">${dice} Dice + ${successModifier} successes</h4>
                                                    <div class="dice-tooltip">
                                                        <div class="dice">
                                                            <ol class="dice-rolls">${get_dice}</ol>
                                                        </div>
                                                    </div>
                                                    <h4 class="dice-total">${total} Succeses</h4>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                ChatMessage.create({ user: game.user.id, speaker: actor != null ? ChatMessage.getSpeaker({ token: actor }) : null, content: the_content, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: roll });
            }
        }
    }).render(true);
}

function _baseAbilityDieRoll(html, actor, characterType = 'character', rollType = 'ability') {
    const data = actor.data.data;
    let dice = 0;
    let augmentAttribute = false;

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

    let stunt = html.find('#stunt').is(':checked');
    let woundPenalty = html.find('#wound-penalty').is(':checked');
    let flurry = html.find('#flurry').is(':checked');
    let armorPenalty = html.find('#armor-penalty').is(':checked');

    let diceModifier = parseInt(html.find('#dice-modifier').val()) || 0;
    let successModifier = parseInt(html.find('#success-modifier').val()) || 0;

    let doubleSuccess = _calculateDoubleDice(html, augmentAttribute);

    let rerollFailed = html.find('#reroll-failed').is(':checked');

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
    if (woundPenalty && data.health.penalty !== 'inc') {
        dice -= data.health.penalty;
    }
    if (flurry) {
        dice -= 3;
    }
    if (diceModifier) {
        dice += diceModifier;
    }

    if(characterType === "actor" || data.creaturetype === 'exalt' ) {
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

    let roll = new Roll(`${dice}d10${rerollFailed ? "r<7" : ""}cs>=7`).evaluate({ async: false });
    let diceRoll = roll.dice[0].results;
    let getDice = "";

    let bonus = "";

    for (let dice of diceRoll) {
        if (dice.result >= doubleSuccess) {
            bonus++;
            getDice += `<li class="roll die d10 success double-success">${dice.result}</li>`;
        }
        else if (dice.result >= 7) { getDice += `<li class="roll die d10 success">${dice.result}</li>`; }
        else if (dice.result == 1) { getDice += `<li class="roll die d10 failure">${dice.result}</li>`; }
        else { getDice += `<li class="roll die d10">${dice.result}</li>`; }
    }

    let total = roll.total;
    if (bonus) total += bonus;
    if (successModifier) total += successModifier;

    return { dice: dice, roll: roll, getDice: getDice, total: total };
}

export async function buildResource(actor, type = 'power') {
    const characterType = actor.data.type;
    let confirmed = false;
    const data = actor.data.data;
    const template = "systems/exaltedessence/templates/dialogues/ability-roll.html";
    const highestAttribute = characterType === "npc" ? null : _getHighestAttribute(data);
    const html = await renderTemplate(template, { 'character-type': characterType, 'attribute': highestAttribute, "ability": type === "will" ? "sagacity" : null });
    new Dialog({
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
                    if (type === 'power') {
                        message = `<h4 class="dice-formula">${rollResults.total} Succeses</h4> <h4 class="dice-total">${total + 1} Power Built!</h4>`;
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
                ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ token: actor }), content: the_content, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });
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
    new Dialog({
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
                ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ token: actor }), content: the_content, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });
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

export async function openAttackDialogue(actor, weaponAccuracy, weaponDamage, overwhelming, weaponType, decisive = true) {
    const characterType = actor.data.type;
    let confirmed = false;
    const data = actor.data.data;
    weaponAccuracy = weaponAccuracy || 0;
    weaponDamage = weaponDamage || 0;
    overwhelming = overwhelming || 0;
    const template = "systems/exaltedessence/templates/dialogues/accuracy-roll.html"
    const highestAttribute = characterType === "npc" ? null : _getHighestAttribute(data);
    const html = await renderTemplate(template, { "weapon-accuracy": weaponAccuracy, "weapon-damage": weaponDamage, "overwhelming": overwhelming, 'character-type': characterType, "attribute": highestAttribute, "ability": weaponType === "melee" ? "close" : "ranged"});
    var rollResults = await new Promise((resolve, reject) => {
        return new Dialog({
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

                    var messageContent = `
              <div class="chat-card">
                  <div class="card-content">${decisive ? 'Decisive Attack' : 'Withering Attack'}</div>
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
                    ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ token: actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: rollResults.roll });
                    return resolve({ 'successess': total });
                }
            }
        }).render(true);
    });

    _rollAttackDamage(actor, rollResults, weaponDamage, overwhelming, decisive);
}

async function _rollAttackDamage(actor, accuracyResult, weaponDamage, overwhelming, decisive) {
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
    const html = await renderTemplate(template, { "successes": accuracyResult.successess, "power": actorData.data.power.value, "weapon-damage": weaponDamage, "overwhelming": overwhelming, "decisive": decisive, "defense": defense, "soak": soak });
    new Dialog({
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
                var postDefenceTotal = accuracySuccesses - defence;
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
                    if (!decisive) {
                        overwhlemingMessage = `<h4 class="dice-total">${overwhelming} Power Built!</h4>`;
                    }
                    messageContent = `
              <div class="chat-card">
                  <div class="card-content">Withering Attack</div>
                  <div class="card-buttons">
                      <div class="flexrow 1">
                          <div>
                              <div class="dice-roll">
                                  <div class="dice-result">
                                      <h4 class="dice-formula">${accuracySuccesses} Succeses</h4>
                                      <h4 class="dice-formula">${defence} defence</h4>
                                      <h4 class="dice-formula">${overwhelming} Overwhelming</h4>
                                      <h4 class="dice-total">Attack Missed!</h4>
                                      ${overwhlemingMessage}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
            `;
                    ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ token: actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
                }
                else {
                    if (decisive) {
                        let bonusDamageDice = parseInt(html.find('#damage-dice').val()) || 0;
                        let damageSuccesses = parseInt(html.find('#damage-success').val()) || 0;
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
                        ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ token: actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.ROLL, roll: damageRoll });
                    }
                    else {
                        var powerGained = postDefenceTotal + 1;
                        if (postDefenceTotal < overwhelming) {
                            powerGained = overwhelming + 1;
                        }
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
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                `
                        ChatMessage.create({ user: game.user.id, speaker: ChatMessage.getSpeaker({ token: actor }), content: messageContent, type: CONST.CHAT_MESSAGE_TYPES.OTHER });
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