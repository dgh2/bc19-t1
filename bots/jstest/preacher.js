import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const preacher = {};

preacher.turn = (self, step) => {
    self.log("Preacher health: " + self.me.health);
    var direction = nav.randomCoordinateDir();
    return self.move(direction.x, direction.y);
}

export default preacher;