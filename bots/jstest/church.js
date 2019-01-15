import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const church = {};
var dir = null;

church.turn = (self) => {
    let castle_karbonite = SPECS['UNITS'][SPECS.CASTLE].CONSTRUCTION_KARBONITE;
    let castle_fuel = SPECS['UNITS'][SPECS.CASTLE].CONSTRUCTION_FUEL;
    let pilgrim_karbonite = SPECS['UNITS'][SPECS.PILGRIM].CONSTRUCTION_KARBONITE;
    let pilgrim_fuel = SPECS['UNITS'][SPECS.PILGRIM].CONSTRUCTION_FUEL;
    let crusader_karbonite = SPECS['UNITS'][SPECS.CRUSADER].CONSTRUCTION_KARBONITE;
    let crusader_fuel = SPECS['UNITS'][SPECS.CRUSADER].CONSTRUCTION_FUEL;
    
    let pilgrim_resources = {karbonite: castle_karbonite + pilgrim_karbonite, fuel: castle_fuel + pilgrim_fuel};
    let crusader_resources = {karbonite: castle_karbonite + crusader_karbonite, fuel: castle_fuel + crusader_fuel};
    
    dir = nav.randomValidDir(self);
    if (nav.exists(dir)) {
        self.log("No valid directions");
        return;
    }
    let loc = nav.apply(self.me, dir);
    if (self.step % 3 === 0 && nav.checkResources(self, crusader_resources) && nav.canBuild(self, SPECS.CRUSADER, dir)) {
        self.log("Building a crusader at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.CRUSADER, dir.x, dir.y);
    } else if (nav.checkResources(self, pilgrim_resources) && nav.canBuild(self, SPECS.PILGRIM, dir)) {
        self.log("Building a pilgrim at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.PILGRIM, dir.x, dir.y);
    }
}

export default church;