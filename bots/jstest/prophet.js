import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const prophet = {};

prophet.turn = (self, step, prefix) => {
    self.log(prefix + "Health: " + self.me.health);
    var direction = nav.randomCoordinateDir();
    return self.move(direction.x, direction.y);
}

export default prophet;