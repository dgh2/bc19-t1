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
        
        let pilgrim_resources = {karbonite: 3*church_karbonite + pilgrim_karbonite, fuel: 3*church_fuel + pilgrim_fuel};
        let crusader_resources = {karbonite: 3*church_karbonite + crusader_karbonite, fuel: 3*church_fuel + crusader_fuel};
        let prophet_resources = {karbonite: 3*church_karbonite + prophet_karbonite, fuel: 3*church_fuel + prophet_fuel};
        let preacher_resources = {karbonite: 3*church_karbonite + preacher_karbonite, fuel: 3*church_fuel + preacher_fuel};
        
        let need_pilgrim = !nav.checkResources(self, {karbonite: 0, fuel: 3*church_fuel}) || !nav.checkResources(self, {karbonite: 3*church_karbonite, fuel: 0});
        
        if (need_pilgrim && nav.checkResources(self, pilgrim_resources)) {
            dir = nav.getRandomValidDir(self, self.karbonite >= self.fuel, self.fuel > self.karbonite);
        } else {
            dir = nav.getRandomValidDir(self, true);
        }
        if (!nav.exists(dir)) {
            self.log("No valid directions");
            return;
        }
        
        let loc = nav.applyDir(self.me, dir);
        if (need_pilgrim && nav.checkResources(self, pilgrim_resources) && nav.canBuild(self, SPECS.PILGRIM, dir)) {
            self.log("Building a pilgrim at " + loc.x + "," + loc.y);
            return self.buildUnit(SPECS.PILGRIM, dir.x, dir.y);
        } else if (self.step % 3 === 0 && nav.checkResources(self, crusader_resources) && nav.canBuild(self, SPECS.CRUSADER, dir)) {
            self.log("Building a crusader at " + loc.x + "," + loc.y);
            return self.buildUnit(SPECS.CRUSADER, dir.x, dir.y);
        } else if (self.step % 5 === 0 && nav.checkResources(self, preacher_resources) && nav.canBuild(self, SPECS.PREACHER, dir)) {
            self.log("Building a preacher at " + loc.x + "," + loc.y);
            return self.buildUnit(SPECS.PREACHER, dir.x, dir.y);
        }
        /*else if (self.step % 2 === 0 && nav.checkResources(self, prophet_resources) && nav.canBuild(self, SPECS.PROPHET, dir)) {
            self.log("Building a prophet at " + loc.x + "," + loc.y);
            return self.buildUnit(SPECS.PROPHET, dir.x, dir.y);
        }*/
    }
}

const church = new Church();
export default church;