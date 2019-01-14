import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const castle = {};

castle.turn = (self, step, prefix) => {
    self.log(prefix + "Health: " + self.me.health);
    self.log(prefix + "step: " + step);
    var direction = nav.randomCoordinateDir(self);
    var location = {x: self.me.x + direction.x, y: self.me.y + direction.y};
    if (step % 10 === 0) {
        self.log(prefix + "Building a pilgrim at " + location.x + ", " + location.y);
        return self.buildUnit(SPECS.PILGRIM, direction.x, direction.y);
    } else if (step % 12 === 0) {
        self.log(prefix + "Building a crusader at " + location.x + ", " + location.y)
        return self.buildUnit(SPECS.CRUSADER, direction.x, direction.y);
    } else if (step % 15 === 0) {
        self.log(prefix + "Building a prophet at " + location.x + ", " + location.y)
        return self.buildUnit(SPECS.PROPHET, direction.x, direction.y);
    } else if (step % 19 === 0) {
        self.log(prefix + "Building a preacher at " + location.x + ", " + location.y)
        return self.buildUnit(SPECS.PREACHER, direction.x, direction.y);
    }
}

export default castle;