import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const crusader = {};
var dir = null;

crusader.turn = (self) => {
    //self.log("Health: " + self.me.health);
    let step = self.step;

    let closestEnemies = nav.getVisibleRobots(self, enemyTeam);
    let closestEnemyAttacker = nav.getVisibleRobots(self, enemyTeam, [SPECS.CRUSADER, SPECS.PROPHET, SPECS.PREACHER]);
    let closestEnemyPilgrims = nav.getVisibleRobots(self, enemyTeam, SPECS.PILGRIM);
    let closestEnemyBuilding = nav.getVisibleRobots(self, enemyTeam, [SPECS.CASTLE, SPECS.CHURCH]);
    let closestEnemyCastle = nav.getVisibleRobots(self, enemyTeam, SPECS.CASTLE);

    if (dir === null || !nav.isPassable(self, {x: self.me.x + dir.x, y: self.me.y + dir.y})) {
        dir = nav.randomValidDir(self);
    }
    if (dir === null) {
        self.log("No valid dirs");
        return;
    }
    return self.move(dir.x, dir.y);
}

export default crusader;