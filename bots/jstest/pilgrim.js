import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const pilgrim = {};
var dir = null;

pilgrim.turn = (self) => {
    self.log("Health: " + self.me.health);
    let enemyTeam = (self.team == 0 ? 1 : 0);
    let closestBases = nav.getVisibleRobots(self, self.team, [SPECS.CASTLE]);
    if (nav.exists(closestBases) && closestBases.length) {
        let closestBase = closestBases[0];
        let distance = nav.sqDist(self.me, closestBase);
        let compassDir = nav.toCompassDir(nav.getDir(self.me, closestBase));
        self.log("Closest base: " + closestBase.x + "," + closestBase.y + " is " + distance + " to the " + compassDir);
    }
    let step = self.step;
    if (dir === null || !nav.isPassable(self, nav.applyDir(self.me, dir))) {
        dir = nav.randomValidDir(self);
    }
    if (dir === null) {
        self.log("No valid dirs");
        return;
    }
    return self.move(dir.x, dir.y);
}

export default pilgrim;

/*
church_cost = (SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_FUEL)
            pilgrim_cost = (SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_FUEL)
            crusader_cost = (SPECS['UNITS'][SPECS['CRUSADER']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CRUSADER']].CONSTRUCTION_FUEL)
            prophet_cost = (SPECS['UNITS'][SPECS['PROPHET']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PROPHET']].CONSTRUCTION_FUEL)
            preacher_cost = (SPECS['UNITS'][SPECS['PREACHER']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PREACHER']].CONSTRUCTION_FUEL)
*/