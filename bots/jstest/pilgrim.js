import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const pilgrim = {};
var dir = null;

pilgrim.turn = (self, step, prefix) => {
    self.log(prefix + "Health: " + self.me.health);
    if (dir === null || !nav.isPassable(self, nav.applyDir(self.me, dir))) {
        dir = nav.randomValidDir(self);
    }
    if (dir === null) {
        self.log(prefix + "No valid dirs");
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