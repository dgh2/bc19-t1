import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const crusader = {};

crusader.turn = (self, step) => {
    self.log("Crusader health: " + self.me.health);
    var direction = nav.randomCoordinateDir();
    return self.move(direction.x, direction.y);
}

export default crusader;