import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

var dir = null;

class Castle {
    turn(self) {
        let church_karbonite = SPECS['UNITS'][SPECS.CHURCH].CONSTRUCTION_KARBONITE;
        let church_fuel = SPECS['UNITS'][SPECS.CHURCH].CONSTRUCTION_FUEL;
        let pilgrim_karbonite = SPECS['UNITS'][SPECS.PILGRIM].CONSTRUCTION_KARBONITE;
        let pilgrim_fuel = SPECS['UNITS'][SPECS.PILGRIM].CONSTRUCTION_FUEL;
        let prophet_karbonite = SPECS['UNITS'][SPECS.PROPHET].CONSTRUCTION_KARBONITE;
        let prophet_fuel = SPECS['UNITS'][SPECS.PROPHET].CONSTRUCTION_FUEL;
        let unitCounts = [];
        let visibleRobots = self.getVisibleRobots();
        if (nav.exists(unitCounts[self.me.unit])) {
            unitCounts[self.me.unit] = unitCounts[self.me.unit] + 1;
        } else {
            unitCounts[self.me.unit] = 1;
        }
        for (let i = 0; i < visibleRobots.length; i++) {
            if (!self.isVisible(visibleRobots[i]) || self.team === visibleRobots[i].team) {
                let unit = visibleRobots[i].castle_talk - 1;
                if (unit === -1) {
                    continue; //ignore new units that have not had a turn yet
                }
                if (nav.exists(unitCounts[unit])) {
                    unitCounts[unit] = unitCounts[unit] + 1;
                } else {
                    unitCounts[unit] = 1;
                }
            }
        }
        if (self.step === 1) {
            self.log("Castle count: " + unitCounts[SPECS.CASTLE]);
        }
        
        dir = nav.randomValidDir(self);
        if (!nav.exists(dir)) {
            //self.log("No valid directions");
            return;
        }
        
        let prophet_resources = {karbonite: 2*church_karbonite + prophet_karbonite, fuel: 2*church_fuel + prophet_fuel};
        let pilgrim_resources = {karbonite: church_karbonite + pilgrim_karbonite, fuel: church_fuel + pilgrim_fuel};
        
        let loc = nav.applyDir(self.me, dir);
        if (unitCounts[SPECS.CHURCH] && nav.checkResources(self, prophet_resources) && nav.canBuild(self, SPECS.PROPHET, dir)) {
            self.log("Building a prophet at " + loc.x + "," + loc.y);
            return self.buildUnit(SPECS.PROPHET, dir.x, dir.y);
        } else if (nav.checkResources(self, pilgrim_resources) && nav.canBuild(self, SPECS.PILGRIM, dir)) {
            self.log("Building a pilgrim at " + loc.x + "," + loc.y);
            return self.buildUnit(SPECS.PILGRIM, dir.x, dir.y);
        }
    }
};

const castle = new Castle();
export default castle;