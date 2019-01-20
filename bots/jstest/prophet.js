import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

var dir = null;

class Prophet {
    turn(self) {
        this.self = self;
        
        let prophet_wall = 1;
        
        let action;
        action = this.attackClosestEnemy(SPECS.CASTLE);
        if (nav.exists(action)) {return action;} //return if attacking an enemy castle
        action = this.attackClosestEnemy(SPECS.CHURCH);
        if (nav.exists(action)) {return action;} //return if attacking an enemy church
        action = this.attackClosestEnemy(SPECS.PREACHER);
        if (nav.exists(action)) {return action;} //return if attacking a preacher
        action = this.attackClosestEnemy(SPECS.PROPHET);
        if (nav.exists(action)) {return action;} //return if attacking a prophet
        action = this.attackClosestEnemy(SPECS.CRUSADER);
        if (nav.exists(action)) {return action;} //return if attacking a crusader
        action = this.attackClosestEnemy();
        if (nav.exists(action)) {return action;} //return if attacking any enemy
        
        let closest_bases = nav.getVisibleRobots(self, self.team, SPECS.CASTLE);
        if (nav.exists(closest_bases) && closest_bases.length) {
            if (self.step === 0) {
                dir = nav.getDir(self.me, closest_bases[0]); //get direction toward from closest base
                if (nav.exists(dir)) {
                    dir = nav.rotate(dir, 4); //get opposite direction
                }
            }
            let dist = nav.sqDist(self.me, closest_bases[0]);
            if (dist < prophet_wall) {
                return self.move(dir.x, dir.y); //step in direction
            }
        }
    }
    
    attackClosestEnemy(units) { //attack the closest enemy with a type included the units array
        let closestEnemies = nav.getVisibleRobots(this.self, this.self.enemy_team, units);
        if (nav.exists(closestEnemies) && closestEnemies.length) {
            let closest = closestEnemies[0];
            let distance = nav.sqDist(this.self.me, closest);
            if (distance >= this.self.specs.ATTACK_RADIUS[0] && distance <= this.self.specs.ATTACK_RADIUS[1]) {
                let attack_offset = {x: closest.x - this.self.me.x, y: closest.y - this.self.me.y};
                return this.self.attack(attack_offset.x, attack_offset.y);
            }
        }
    }
}

const prophet = new Prophet();
export default prophet;