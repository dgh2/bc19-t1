import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const church = {};
var dir = null;

church.turn = (self) => {
    //self.log("Health: " + self.me.health);
    let step = self.step;
    dir = nav.randomValidDir(self);
    if (dir === null) {
        self.log("No valid directions");
        return;
    }
    let oldDir = dir;
    let loc = {x: self.me.x + dir.x, y: self.me.y + dir.y};
    if (step % 10 === 0) {
        dir = nav.randomValidDir(self);
        self.log("Building a pilgrim at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.PILGRIM, oldDir.x, oldDir.y);
    } else if (step % 12 === 0) {
        dir = nav.randomValidDir(self);
        self.log("Building a crusader at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.CRUSADER, oldDir.x, oldDir.y);
    } else if (step % 15 === 0) {
        dir = nav.randomValidDir(self);
        self.log("Building a prophet at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.PROPHET, dir.x, dir.y);
    } else if (step % 19 === 0) {
        dir = nav.randomValidDir(self);
        self.log("Building a preacher at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.PREACHER, dir.x, dir.y);
    }
}

export default church;