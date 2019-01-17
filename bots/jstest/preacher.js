import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

var dir = null;

class Preacher {
    turn(self) {
        let church_karbonite = SPECS['UNITS'][SPECS.CHURCH].CONSTRUCTION_KARBONITE;
        let church_fuel = SPECS['UNITS'][SPECS.CHURCH].CONSTRUCTION_FUEL;
        let church_resources = {karbonite: church_karbonite, fuel: church_fuel};
        
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
            if (distance >= self.specs.ATTACK_RADIUS[0] && distance <= self.specs.ATTACK_RADIUS[1]) {
                self.log("Attacking closestEnemyAttacker: " + closest.x + "," + closest.y);
                let attack_offset = {x: closest.x - self.me.x, y: closest.y - self.me.y};
                return self.attack(attack_offset.x, attack_offset.y);
            //} else if () { //TODO: kite, if enemy can attack and we can leave their attack range in one move, do so
            } else {
                self.log("Moving toward closestEnemyAttacker: " + closest.x + "," + closest.y + " to the " + compassDir);
                let attack_offset = {x: closest.x - self.me.x, y: closest.y - self.me.y};
                dir = nav.getDir(self.me, closest);
            }
        }
        
        if (nav.exists(dir) && !nav.isPassable(self, nav.applyDir(self.me, dir))) {
            dir = null;
        }
        //anything else that might set dir
        if (!nav.exists(dir)) {
            dir = nav.randomValidDir(self);
        }
        if (nav.exists(dir)) {
            return self.move(dir.x, dir.y);
        }
        self.log("No valid dirs");
    }
}

const preacher = new Preacher();
export default preacher;