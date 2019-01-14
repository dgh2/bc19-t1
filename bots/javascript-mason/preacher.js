import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const preacher = {};

preacher.turn = (self, step, directionz, directions, opposite_directions) => {
  self.log("Preacher health: " + self.me.health);
  var direction = nav.directionz[Math.floor(Math.random()*8)];
  return self.move(...direction);
}

export default preacher;