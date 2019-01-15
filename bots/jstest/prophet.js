import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const prophet = {};

prophet.turn = (self) => {
    let enemyTeam = (self.team == 0 ? 1 : 0);
    let closestEnemies = nav.getVisibleRobots(self, enemyTeam);
    let closestEnemyAttacker = nav.getVisibleRobots(self, enemyTeam, [SPECS.CRUSADER, SPECS.PROPHET, SPECS.PREACHER]);
    let closestEnemyPilgrims = nav.getVisibleRobots(self, enemyTeam, SPECS.PILGRIM);
    let closestEnemyBuilding = nav.getVisibleRobots(self, enemyTeam, [SPECS.CASTLE, SPECS.CHURCH]);
    let closestEnemyCastle = nav.getVisibleRobots(self, enemyTeam, SPECS.CASTLE);
    
    if (nav.exists(closestEnemyAttacker) && closestEnemyAttacker.length) {
        let closest = closestEnemyAttacker[0];
        let distance = nav.sqDist(self.me, closest);
        let compassDir = nav.toCompassDir(nav.getDir(self.me, closest));
        self.log("closestEnemyAttacker: " + closest.x + "," + closest.y + " is " + distance + " to the " + compassDir);
        if (distance <= self.specs.ATTACK_RADIUS) {
            self.log("Attacking closestEnemyAttacker: " + closest.x + "," + closest.y);
            let attack_offset = {x: closest.x - self.me.x, y: closest.y - self.me.y};
            return self.attack(attack_offset.x, attack_offset.y);
        }
    }
}

export default prophet;