import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

var dir = null;

class Crusader {
    turn(self) {
        this.self = self;
        
        let closestEnemyAttackers = nav.getVisibleRobots(self, self.enemy_team, [SPECS.CASTLE, SPECS.CRUSADER, SPECS.PROPHET, SPECS.PREACHER]);
        let closestEnemyPilgrims = nav.getVisibleRobots(self, self.enemy_team, SPECS.PILGRIM);
        let closestEnemyChurches = nav.getVisibleRobots(self, self.enemy_team, SPECS.CHURCH);
        
        let action;
        action = this.attackClosestEnemy(SPECS.CASTLE);
        if (nav.exists(action)) {return action;} //return if attacking a castle
        action = this.attackClosestEnemy(SPECS.PREACHER);
        if (nav.exists(action)) {return action;} //return if attacking a preacher
        action = this.attackClosestEnemy(SPECS.PROPHET);
        if (nav.exists(action)) {return action;} //return if attacking a prophet
        action = this.attackClosestEnemy(SPECS.CRUSADER);
        if (nav.exists(action)) {return action;} //return if attacking a crusader
        action = this.attackClosestEnemy(SPECS.PILGRIM);
        if (nav.exists(action)) {return action;} //return if attacking a pilgrim
        action = this.attackClosestEnemy(SPECS.CHURCH);
        if (nav.exists(action)) {return action;} //return if attacking a church
        action = this.attackClosestEnemy();
        if (nav.exists(action)) {return action;} //return if attacking any enemy
        
        if (nav.exists(closestEnemyAttackers) && closestEnemyAttackers.length) {
            let closest = closestEnemyAttackers[0];
            let dist = nav.sqDist(self.me, closest);
            let compassDir = nav.toCompassDir(nav.getDir(self.me, closest));
            //self.log('closestEnemyAttacker: ' + closest.x + ',' + closest.y + ' is ' + dist + ' to the ' + compassDir);
            //if () {
                //TODO: kite, if enemy can attack us and we can leave their attack range in one move, do so
                //TODO: for prophets, try to move inside their attack radius
            //} else {
            if (dist + 2**2 > SPECS.UNITS[closest.unit].ATTACK_RADIUS[1]) {
                self.log('Moving toward closest enemy attacker: ' + closest.x + ',' + closest.y + ' to the ' + compassDir);
                let attack_offset = {x: closest.x - self.me.x, y: closest.y - self.me.y};
                dir = nav.getDir(self.me, closest);
            } else {
                self.log('Waiting for enemy at ' + closest.x + ',' + closest.y + ' to the ' + compassDir + ' to come closer');
                return;
            }
        }
        
        if (nav.exists(closestEnemyPilgrims) && closestEnemyPilgrims.length) {
            let closest = closestEnemyPilgrims[0];
            let dist = nav.sqDist(self.me, closest);
            let compassDir = nav.toCompassDir(nav.getDir(self.me, closest));
            //self.log('closestEnemyPilgrim: ' + closest.x + ',' + closest.y + ' is ' + dist + ' to the ' + compassDir);
            //if () {
                //TODO: kite, if enemy can attack us and we can leave their attack range in one move, do so
                //TODO: for prophets, try to move inside their attack radius
            //} else {
                self.log('Moving toward closest enemy pilgrim: ' + closest.x + ',' + closest.y + ' to the ' + compassDir);
                let attack_offset = {x: closest.x - self.me.x, y: closest.y - self.me.y};
                dir = nav.getDir(self.me, closest);
            //}
        }
        
        if (nav.exists(closestEnemyChurches) && closestEnemyChurches.length) {
            let closest = closestEnemyChurches[0];
            let dist = nav.sqDist(self.me, closest);
            let compassDir = nav.toCompassDir(nav.getDir(self.me, closest));
            //self.log('closestEnemyChurch: ' + closest.x + ',' + closest.y + ' is ' + dist + ' to the ' + compassDir);
            //if () {
                //TODO: kite, if enemy can attack us and we can leave their attack range in one move, do so
                //TODO: for prophets, try to move inside their attack radius
            //} else {
                self.log('Moving toward closest enemy church: ' + closest.x + ',' + closest.y + ' to the ' + compassDir);
                let attack_offset = {x: closest.x - self.me.x, y: closest.y - self.me.y};
                dir = nav.getDir(self.me, closest);
            //}
        }
        
        //TODO: follow closest friendly pilgrim ! on a resource and not near a church or castle
        //TODO: follow closest friendly prophet
        //TODO: follow closest friendly preacher
        //TODO: delete the code below and move away from castles and churches to prevent blocking units
        
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
        self.log('No valid dirs');
    }
    
    attackClosestEnemy(units) { //attack the closest enemy with a type included the units array
        let closestEnemies = nav.getVisibleRobots(this.self, this.self.enemy_team, units);
        if (nav.exists(closestEnemies) && closestEnemies.length) {
            let closest = closestEnemies[0];
            let dist = nav.sqDist(this.self.me, closest);
            if (dist >= this.self.specs.ATTACK_RADIUS[0] && dist <= this.self.specs.ATTACK_RADIUS[1]) {
                let attack_offset = {x: closest.x - this.self.me.x, y: closest.y - this.self.me.y};
                return this.self.attack(attack_offset.x, attack_offset.y);
            }
        }
    }
}

const crusader = new Crusader();
export default crusader;