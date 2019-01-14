import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const crusader = {};
var dir = null;

crusader.turn = (self, step, prefix) => {
    self.log(prefix + "Health: " + self.me.health);
    if (dir === null || !nav.isPassable(self, {x: self.me.x + dir.x, y: self.me.y + dir.y})) {
        dir = nav.randomValidDir(self);
    }
    if (dir === null) {
        self.log(prefix + "No valid dirs");
        return;
    }
    return self.move(dir.x, dir.y);
}

export default crusader;