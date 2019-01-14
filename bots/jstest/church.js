import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const church = {};

church.turn = (self, step) => {
    self.log("Church health: " + self.me.health);
    var direction = nav.randomCoordinateDir();
    var location = {x: self.me.x + direction.x, y: self.me.y + direction.y};
    if (step % 10 === 0) {
        self.log("Building a pilgrim at " + location.x + ", " + location.y);
        return self.buildUnit(SPECS.PILGRIM, location.x, location.y);
    } else if (step % 12 === 0) {
        self.log("Building a crusader at " + location.x + ", " + location.y)
        return self.buildUnit(SPECS.CRUSADER, location.x, location.y);
    } else if (step % 15 === 0) {
        self.log("Building a prophet at " + location.x + ", " + location.y)
        return self.buildUnit(SPECS.PROPHET, location.x, location.y);
    } else if (step % 19 === 0) {
        self.log("Building a preacher at " + location.x + ", " + location.y)
        return self.buildUnit(SPECS.PREACHER, location.x, location.y);
    }
}

export default church;