import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

var dir = null;

class Preacher {
    turn(self) {
        this.self = self;
        
        let closestEnemyAttackers = nav.getVisibleRobots(self, self.enemy_team, [SPECS.CASTLE, SPECS.CRUSADER, SPECS.PROPHET, SPECS.PREACHER]);
        let closestEnemyPilgrims = nav.getVisibleRobots(self, self.enemy_team, SPECS.PILGRIM);
        let closestEnemyChurchs = nav.getVisibleRobots(self, self.enemy_team, SPECS.CHURCH);
        
        let action;
        action = this.attackClosestEnemy(SPECS.CASTLE);
        if (nav.exists(action)) {return action;} //return if attacking an enemy castle
        action = this.attackClosestEnemy(SPECS.CHURCH);
        if (nav.exists(action)) {return action;} //return if attacking an enemy church
        action = this.attackClosestEnemy(SPECS.CRUSADER);
        if (nav.exists(action)) {return action;} //return if attacking a crusader
        action = this.attackClosestEnemy(SPECS.PREACHER);
        if (nav.exists(action)) {return action;} //return if attacking a preacher
        action = this.attackClosestEnemy(SPECS.PROPHET);
        if (nav.exists(action)) {return action;} //return if attacking a prophet
        action = this.attackClosestEnemy();
        if (nav.exists(action)) {return action;} //return if attacking any enemy
        
        if (nav.exists(closestEnemyAttackers) && closestEnemyAttackers.length) {
            let closest = closestEnemyAttackers[0];
            let distance = nav.sqDist(self.me, closest);
            let compassDir = nav.toCompassDir(nav.getDir(self.me, closest));
            //self.log("closestEnemyAttacker: " + closest.x + "," + closest.y + " is " + distance + " to the " + compassDir);
            //if () {
                //TODO: kite, if enemy can attack us and we can leave their attack range in one move, do so
                //TODO: for prophets, try to move inside their attack radius
            //} else {
                self.log("Moving toward closest enemy attacker: " + closest.x + "," + closest.y + " to the " + compassDir);
                let attack_offset = {x: closest.x - self.me.x, y: closest.y - self.me.y};
                dir = nav.getDir(self.me, closest);
            //}
        }
        
        if (nav.exists(closestEnemyPilgrims) && closestEnemyPilgrims.length) {
            let closest = closestEnemyPilgrims[0];
            let distance = nav.sqDist(self.me, closest);
            let compassDir = nav.toCompassDir(nav.getDir(self.me, closest));
            //self.log("closestEnemyPilgrim: " + closest.x + "," + closest.y + " is " + distance + " to the " + compassDir);
            //if () {
                //TODO: kite, if enemy can attack us and we can leave their attack range in one move, do so
                //TODO: for prophets, try to move inside their attack radius
            //} else {
                self.log("Moving toward closest enemy pilgrim: " + closest.x + "," + closest.y + " to the " + compassDir);
                let attack_offset = {x: closest.x - self.me.x, y: closest.y - self.me.y};
                dir = nav.getDir(self.me, closest);
            //}
        }
        
        if (nav.exists(closestEnemyChurchs) && closestEnemyChurchs.length) {
            let closest = closestEnemyChurchs[0];
            let distance = nav.sqDist(self.me, closest);
            let compassDir = nav.toCompassDir(nav.getDir(self.me, closest));
            //self.log("closestEnemyChurch: " + closest.x + "," + closest.y + " is " + distance + " to the " + compassDir);
            //if () {
                //TODO: kite, if enemy can attack us and we can leave their attack range in one move, do so
                //TODO: for prophets, try to move inside their attack radius
            //} else {
                self.log("Moving toward closest enemy church: " + closest.x + "," + closest.y + " to the " + compassDir);
                let attack_offset = {x: closest.x - self.me.x, y: closest.y - self.me.y};
                dir = nav.getDir(self.me, closest);
            //}
        }
        
        if (nav.exists(dir) && !nav.isPassable(self, nav.applyDir(self.me, dir))) {
            dir = null;
        }
        //anything else that might set dir
        if (!nav.exists(dir)) {
            dir = nav.getRandomValidDir(self);
        }
        if (nav.exists(dir) && self.fuel >= self.specs.FUEL_PER_MOVE) {
            return self.move(dir.x, dir.y);
        }
        self.log("No valid dirs");
    }
    
    attackClosestEnemy(units) { //attack the closest enemy with a type included the units array
        let closestEnemies = nav.getVisibleRobots(this.self, this.self.enemy_team, units);
        if (nav.exists(closestEnemies) && closestEnemies.length) {
            let closest = closestEnemies[0];
            let dir = nav.getDir(closest, this.self.me);
            let distance = nav.sqDist(this.self.me, closest);
            if (distance > this.self.specs.ATTACK_RADIUS[1]) {
                closet = nav.applyDir(closest, dir);
                distance = nav.sqDist(this.self.me, closest);
            }
            if (distance >= this.self.specs.ATTACK_RADIUS[0] && distance <= this.self.specs.ATTACK_RADIUS[1]) {
                let attack_offset = {x: closest.x - this.self.me.x, y: closest.y - this.self.me.y};
                return this.self.attack(attack_offset.x, attack_offset.y);
            }
        }
    }
}

const preacher = new Preacher();
export default preacher;