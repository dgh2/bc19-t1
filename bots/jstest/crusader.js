import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const crusader = {};
var dir = null;

crusader.turn = (self) => {
    self.log("Health: " + self.me.health);
    let step = self.step;
    if (dir === null || !nav.isPassable(self, {x: self.me.x + dir.x, y: self.me.y + dir.y})) {
        dir = nav.randomValidDir(self);
    }
    if (dir === null) {
        self.log("No valid dirs");
        return;
    }
    return self.move(dir.x, dir.y);
}

export default crusader;