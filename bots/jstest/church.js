import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

var dir = null;

class Church {
    turn(self) {
        this.self = self;
        
        let church_karbonite = SPECS['UNITS'][SPECS.CHURCH].CONSTRUCTION_KARBONITE;
        let church_fuel = SPECS['UNITS'][SPECS.CHURCH].CONSTRUCTION_FUEL;
        let pilgrim_karbonite = SPECS['UNITS'][SPECS.PILGRIM].CONSTRUCTION_KARBONITE;
        let pilgrim_fuel = SPECS['UNITS'][SPECS.PILGRIM].CONSTRUCTION_FUEL;
        let crusader_karbonite = SPECS['UNITS'][SPECS.CRUSADER].CONSTRUCTION_KARBONITE;
        let crusader_fuel = SPECS['UNITS'][SPECS.CRUSADER].CONSTRUCTION_FUEL;
        let prophet_karbonite = SPECS['UNITS'][SPECS.PROPHET].CONSTRUCTION_KARBONITE;
        let prophet_fuel = SPECS['UNITS'][SPECS.PROPHET].CONSTRUCTION_FUEL;
        let preacher_karbonite = SPECS['UNITS'][SPECS.PREACHER].CONSTRUCTION_KARBONITE;
        let preacher_fuel = SPECS['UNITS'][SPECS.PREACHER].CONSTRUCTION_FUEL;
        
        let pilgrim_buffer = {karbonite: 3*church_karbonite + pilgrim_karbonite, fuel: 3*church_fuel + pilgrim_fuel};
        let crusader_buffer = {karbonite: 3*church_karbonite + crusader_karbonite, fuel: 3*church_fuel + crusader_fuel};
        let prophet_buffer = {karbonite: 3*church_karbonite + prophet_karbonite, fuel: 3*church_fuel + prophet_fuel};
        let preacher_buffer = {karbonite: 3*church_karbonite + preacher_karbonite, fuel: 3*church_fuel + preacher_fuel};
        
        let closestEnemyAttackers = nav.getVisibleRobots(self, self.enemy_team, [SPECS.CASTLE, SPECS.CRUSADER, SPECS.PROPHET, SPECS.PREACHER]);
        let myVisiblePilgrims = nav.getVisibleRobots(self, self.team, SPECS.PILGRIM);
        let myVisiblePreachers = nav.getVisibleRobots(self, self.team, SPECS.PREACHER);
        let myVisibleProphets = nav.getVisibleRobots(self, self.team, SPECS.PROPHET);
        let myVisibleCrusaders = nav.getVisibleRobots(self, self.team, SPECS.CRUSADER);
        let visibleResources = nav.getResourceLocations(self, self.getKarboniteMap(), null, self.specs.VISION_RADIUS);
        visibleResources = visibleResources.concat(nav.getResourceLocations(self, self.getFuelMap(), null, self.specs.VISION_RADIUS));
        
        let excess_pilgrims = myVisiblePilgrims.length - visibleResources.length;
        let need_prophet = nav.checkResources(self, prophet_buffer) && (closestEnemyAttackers.length || myVisibleProphets.length < myVisiblePreachers.length);
        let need_pilgrim = nav.checkResources(self, pilgrim_buffer) && (excess_pilgrims < myVisiblePreachers.length);
        let need_crusader = nav.checkResources(self, crusader_buffer) && (self.step >= 900 || myVisibleCrusaders.length < myVisiblePreachers.length);
        let need_preacher = !need_prophet && !need_pilgrim && !need_crusader && nav.checkResources(self, preacher_buffer);
        
        if (need_prophet) {
            dir = nav.getRandomValidDir(self, true);
        } else if (need_pilgrim) {
            dir = nav.getRandomValidDir(self, false, self.karbonite >= self.fuel, self.fuel > self.karbonite);
        } else {
            dir = nav.getRandomValidDir(self, true);
        }
        if (!nav.exists(dir)) {
            self.log('No valid directions');
            return;
        }
        
        let loc = nav.applyDir(self.me, dir);
        if (need_prophet && nav.canBuild(self, SPECS.PROPHET, dir)) {
            self.log('Building a prophet at ' + loc.x + ',' + loc.y);
            return self.buildUnit(SPECS.PROPHET, dir.x, dir.y);
        } else if (need_pilgrim && nav.canBuild(self, SPECS.PILGRIM, dir)) {
            self.log('Building a pilgrim at ' + loc.x + ',' + loc.y);
            return self.buildUnit(SPECS.PILGRIM, dir.x, dir.y);
        } else if (need_preacher && nav.canBuild(self, SPECS.PREACHER, dir)) {
            self.log('Building a preacher at ' + loc.x + ',' + loc.y);
            return self.buildUnit(SPECS.PREACHER, dir.x, dir.y);
        } else if (need_crusader && nav.canBuild(self, SPECS.CRUSADER, dir)) {
            self.log('Building a crusader at ' + loc.x + ',' + loc.y);
            return self.buildUnit(SPECS.CRUSADER, dir.x, dir.y);
        }
    }
}

const church = new Church();
export default church;