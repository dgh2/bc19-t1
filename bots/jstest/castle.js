import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const castle = {};
var dir = null;

castle.turn = (self) => {
    let castle_karbonite = SPECS['UNITS'][SPECS.CASTLE].CONSTRUCTION_KARBONITE;
    let castle_fuel = SPECS['UNITS'][SPECS.CASTLE].CONSTRUCTION_FUEL;
    let pilgrim_karbonite = SPECS['UNITS'][SPECS.PILGRIM].CONSTRUCTION_KARBONITE;
    let pilgrim_fuel = SPECS['UNITS'][SPECS.PILGRIM].CONSTRUCTION_FUEL;
    let prophet_karbonite = SPECS['UNITS'][SPECS.PROPHET].CONSTRUCTION_KARBONITE;
    let prophet_fuel = SPECS['UNITS'][SPECS.PROPHET].CONSTRUCTION_FUEL;
    let unitCounts = [];
    let visibleRobots = self.getVisibleRobots();
    for (let i = 0; i < visibleRobots.length; i++) {
        if (!self.isVisible(visibleRobots[i]) || self.team === visibleRobots[i].team) {
            let unit = visibleRobots[i].castle_talk - 1;
            if (nav.exists(unitCounts[unit]) {
                unitCounts[unit] = unitCounts[unit] + 1;
            } else {
                unitCounts[unit] = 1;
            }
            if (self.step == 0) {
                unitCounts[self.me.unit] = unitCounts[self.me.unit] + 1;
            }
        }
    }
    
    dir = nav.randomValidDir(self);
    if (nav.exists(dir)) {
        self.log("No valid directions");
        return;
    }
    
    let prophet_resources = {karbonite: castle_karbonite + prophet_karbonite, fuel: castle_fuel + prophet_fuel};
    let pilgrim_resources = {karbonite: castle_karbonite + pilgrim_karbonite, fuel: castle_fuel + pilgrim_fuel};
    
    let loc = nav.apply(self.me, dir);
    if (unitCounts[SPECS.CHURCH] && nav.checkResources(self, prophet_resources) && nav.canBuild(self, SPECS.PROPHET, dir)) {
        self.log("Building a prophet at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.PROPHET, dir.x, dir.y);
    } else if (nav.checkResources(self, pilgrim_resources) && nav.canBuild(self, SPECS.PILGRIM, dir)) {
        self.log("Building a pilgrim at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.PILGRIM, dir.x, dir.y);
    }
}

export default castle;