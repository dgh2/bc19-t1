import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const crusader = {};
var dir = null;

crusader.turn = (self) => {
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
        if (distance > self.specs.ATTACK_RADIUS) {
            self.log("Moving toward closestEnemyAttacker: " + compassDir);
            dir = nav.getDir(self.me, closest);
        } else {
            self.log("Attacking closestEnemyAttacker: " + closest.x + "," + closest.y);
            return self.attack(closest.x, closest.y);
        }
    }
    
    if (nav.exists(dir) && !nav.isPassable(self.applyDir())) {
        dir = null;
    }
    //anything else that might set dir
    if (!nav.exists(dir)) {
        dir = nav.getRandomValidDir(self);
    }
    if (nav.exists(dir)) {
        return self.move(dir.x, dir.y);
    }
    self.log("No valid dirs");
}

export default crusader;