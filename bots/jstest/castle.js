import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const CHURCH_KARBONITE = SPECS['UNITS'][SPECS.CHURCH].CONSTRUCTION_KARBONITE;
const CHURCH_FUEL = SPECS['UNITS'][SPECS.CHURCH].CONSTRUCTION_FUEL;
const PILGRIM_KARBONITE = SPECS['UNITS'][SPECS.PILGRIM].CONSTRUCTION_KARBONITE;
const PILGRIM_FUEL = SPECS['UNITS'][SPECS.PILGRIM].CONSTRUCTION_FUEL;
const PROPHET_KARBONITE = SPECS['UNITS'][SPECS.PROPHET].CONSTRUCTION_KARBONITE;
const PROPHET_FUEL = SPECS['UNITS'][SPECS.PROPHET].CONSTRUCTION_FUEL;
const CRUSADER_KARBONITE = SPECS['UNITS'][SPECS.CRUSADER].CONSTRUCTION_KARBONITE;
const CRUSADER_FUEL = SPECS['UNITS'][SPECS.CRUSADER].CONSTRUCTION_FUEL;
const CHURCH_COSTS = {karbonite: CHURCH_KARBONITE, fuel: CHURCH_FUEL};
const PILGRIM_COSTS = {karbonite: PILGRIM_KARBONITE, fuel: PILGRIM_FUEL};
const PROPHET_COSTS = {karbonite: PROPHET_KARBONITE, fuel: PROPHET_FUEL};
const CRUSADER_COSTS = {karbonite: CRUSADER_KARBONITE, fuel: CRUSADER_FUEL};

var dir;
var self;
var unit_counts = [];

class Castle {
    shortTurn(self) {
        this.self = self;
        self.log('Turn: ' + self.step);
        let action;
        action = this.attackClosestEnemy();
        if (nav.exists(action)) {return action;} //return if attacking any enemy
        
        dir = nav.getRandomValidDir(self, true, self.karbonite >= self.fuel, self.fuel > self.karbonite);
        if (!nav.exists(dir)) {
            self.log('No valid directions');
            return; //stop early if there are no directions to build in
        }
        
        //If a visible resource is unoccupied and we have enough resources to build a pilgrim and a church, build a pilgrim
        let myVisiblePilgrims = nav.getVisibleRobots(self, self.team, SPECS.PILGRIM);
        let unoccupiedVisibleResources = nav.getResourceLocations(self, self.getKarboniteMap(), myVisiblePilgrims, self.specs.VISION_RADIUS);
        unoccupiedVisibleResources = unoccupiedVisibleResources.concat(nav.getResourceLocations(self, self.getFuelMap(), myVisiblePilgrims, self.specs.VISION_RADIUS));
        
        let pilgrim_buffer = {karbonite: CHURCH_KARBONITE + PILGRIM_KARBONITE, fuel: CHURCH_FUEL + PILGRIM_FUEL};
        if (unoccupiedVisibleResources.length && nav.checkResources(self, pilgrim_buffer) && nav.canBuild(self, SPECS.PILGRIM, dir)) {
            self.log('Building a pilgrim at ' + loc.x + ',' + loc.y);
            return self.buildUnit(SPECS.PILGRIM, dir.x, dir.y);
        }
    }
    
    turn(self) {
        this.self = self;
        self.log('Turn: ' + self.step);
        
        this.updateUnitCounts();
        if (self.step == 1) {
            self.log('Castle count: ' + unit_counts[SPECS.CASTLE]);
        }
        
        let prophet_buffer = {karbonite: CHURCH_KARBONITE + PROPHET_KARBONITE, fuel: CHURCH_FUEL + PROPHET_FUEL};
        let pilgrim_buffer = {karbonite: CHURCH_KARBONITE + PILGRIM_KARBONITE, fuel: CHURCH_FUEL + PILGRIM_FUEL};
        
        let closestEnemyAttackers = nav.getVisibleRobots(self, self.enemy_team, [SPECS.CASTLE, SPECS.CRUSADER, SPECS.PROPHET, SPECS.PREACHER]);
        let closestPassiveEnemies = nav.getVisibleRobots(self, self.enemy_team, [SPECS.PILGRIM, SPECS.CHURCH]);
        let myVisiblePilgrims = nav.getVisibleRobots(self, self.team, SPECS.PILGRIM);
        let myVisiblePreachers = nav.getVisibleRobots(self, self.team, SPECS.PREACHER);
        let myVisibleProphets = nav.getVisibleRobots(self, self.team, SPECS.PROPHET);
        let visibleResources = nav.getResourceLocations(self, self.getKarboniteMap(), null, self.specs.VISION_RADIUS);
        visibleResources = visibleResources.concat(nav.getResourceLocations(self, self.getFuelMap(), null, self.specs.VISION_RADIUS));
        
        let action;
        //let closestEnemyAttackers = nav.getVisibleRobots(self, enemy_team, [SPECS.CRUSADER, SPECS.PROPHET, SPECS.PREACHER]);
        action = this.attackClosestEnemy(SPECS.CASTLE);
        if (nav.exists(action)) {return action;} //return if attacking an enemy castle
        action = this.attackClosestEnemy(SPECS.CHURCH);
        if (nav.exists(action)) {return action;} //return if attacking an enemy church
        action = this.attackClosestEnemy([SPECS.CRUSADER, SPECS.PROPHET, SPECS.PREACHER]);
        if (nav.exists(action)) {return action;} //return if attacking an offensive enemy
        action = this.attackClosestEnemy();
        if (nav.exists(action)) {return action;} //return if attacking any enemy
        
        let excess_pilgrims = myVisiblePilgrims.length - visibleResources.length;
        let low_prophets = unit_counts[SPECS.CHURCH] > 4 
                              || (unit_counts[SPECS.CHURCH] > 0 && myVisibleProphets.length < 2) 
                              || closestPassiveEnemies.length > 2*myVisibleProphets.length
                              || closestEnemyAttackers.length > 2*myVisibleProphets.length;
        let need_prophet = nav.checkResources(self, prophet_buffer) && low_prophets;
        let need_pilgrim = nav.checkResources(self, pilgrim_buffer) && (excess_pilgrims < myVisiblePreachers.length);
        let need_crusader = nav.checkResources(self, CRUSADER_COSTS) && self.step >= 950;
        /*
        self.log('excess_pilgrims: ' + excess_pilgrims);
        self.log('need_prophet: ' + need_prophet);
        self.log('need_pilgrim: ' + need_pilgrim);
        self.log('nav.checkResources(self, pilgrim_buffer): ' + nav.checkResources(self, pilgrim_buffer));
        self.log('excess_pilgrims: ' + excess_pilgrims);
        self.log('myVisiblePreachers.length: ' + myVisiblePreachers.length);
        */
        
        if (need_prophet) {
            dir = nav.getRandomValidDir(self, true);
        } else if (need_pilgrim) {
            dir = nav.getRandomValidDir(self, false, self.karbonite >= self.fuel, self.fuel > self.karbonite);
        } else {
            dir = nav.getRandomValidDir(self, true);
        }
        if (!nav.exists(dir)) {
            //self.log('No valid directions');
            return; //stop early if there are no directions to build in
        }
        
        let loc = nav.applyDir(self.me, dir);
        if (need_prophet && nav.canBuild(self, SPECS.PROPHET, dir)) {
            self.log('Building a prophet at ' + loc.x + ',' + loc.y);
            return self.buildUnit(SPECS.PROPHET, dir.x, dir.y);
        } else if (need_pilgrim && nav.canBuild(self, SPECS.PILGRIM, dir)) {
            self.log('Building a pilgrim at ' + loc.x + ',' + loc.y);
            return self.buildUnit(SPECS.PILGRIM, dir.x, dir.y);
        } else if (need_crusader && nav.canBuild(self, SPECS.CRUSADER, dir)) {
            self.log('Building a crusader at ' + loc.x + ',' + loc.y);
            return self.buildUnit(SPECS.CRUSADER, dir.x, dir.y);
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
    
    updateUnitCounts() {
        unit_counts = [];
        let visibleRobots = this.self.getVisibleRobots();
        if (nav.exists(unit_counts[this.self.me.unit])) {
            unit_counts[this.self.me.unit] = unit_counts[this.self.me.unit] + 1;
        } else {
            unit_counts[this.self.me.unit] = 1;
        }
        for (let i = 0; i < visibleRobots.length; i++) {
            if (!this.self.isVisible(visibleRobots[i]) || this.self.team === visibleRobots[i].team) {
                let unit = visibleRobots[i].castle_talk - 1;
                if (unit === -1) {
                    continue; //ignore new units that have not had a turn yet
                }
                if (nav.exists(unit_counts[unit])) {
                    unit_counts[unit] = unit_counts[unit] + 1;
                } else {
                    unit_counts[unit] = 1;
                }
            }
        }
    }
};

const castle = new Castle();
export default castle;