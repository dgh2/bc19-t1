import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const prophet = {};
var dir = null;

prophet.turn = (self) => {
    let prophetWall = 1;
    
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
        //self.log("closestEnemyAttacker: " + closest.x + "," + closest.y + " is " + distance + " to the " + compassDir);
        if (distance >= self.specs.ATTACK_RADIUS[0] && distance <= self.specs.ATTACK_RADIUS[1]) {
            //self.log("Attacking closestEnemyAttacker: " + closest.x + "," + closest.y);
            let attack_offset = {x: closest.x - self.me.x, y: closest.y - self.me.y};
            return self.attack(attack_offset.x, attack_offset.y);
        }
    }
    
    if (self.step < prophetWall - 1) { //step away from bases for wall-1 turns (wall=1 => 0 steps, wall=2 => 1 step)
        let closestBases = nav.getVisibleRobots(self, self.team, [SPECS.CASTLE]);
        if (self.step === 0 && nav.exists(closestBases) && closestBases.length) {
            dir = nav.getDir(self.me, closestBases[0]); //get direction toward from closest base
            if (nav.exists(dir)) {
                dir = nav.rotate(dir, 4); //get opposite direction
            }
        }
        if (nav.exists(dir)) {
            return self.move(dir.x, dir.y); //step in direction
        }
    }
}

export default prophet;