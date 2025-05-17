export class ExaltedCombatant extends Combatant {
    testUserPermission(...[user, permission, options]) {
        return (this.actor?.testUserPermission(user, permission, options) ?? user.isGM);
    }

    async toggleCombatantTurnOver() {
        await this.update({
            [`system.acted`]: !this.system.acted,
        });
    }
}