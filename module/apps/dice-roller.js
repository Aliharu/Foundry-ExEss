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
                let bonusSuccesses = parseInt(html.find('#bonus-success').val()) || 0;
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
                if (bonusSuccesses) total += bonusSuccesses;

                let the_content = `<div class="chat-card item-card">
                                <div class="card-content">Dice Roll</div>
                                <div class="card-buttons">
                                    <div class="flexrow 1">
                                        <div>Dice Roller - Number of Successes<div class="dice-roll">
                                                <div class="dice-result">
                                                    <h4 class="dice-formula">${dice} Dice + ${bonusSuccesses} successes</h4>
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