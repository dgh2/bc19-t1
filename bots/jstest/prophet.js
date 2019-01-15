import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const prophet = {};

prophet.turn = (self) => {
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
            return self.attack(closest.x, closest.y);
        }
    }
}

export default prophet;