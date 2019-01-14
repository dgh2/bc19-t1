import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const prophet = {};

prophet.turn = (self, step) => {
  self.log("Prophet health: " + self.me.health);
  var direction = nav.directionz[Math.floor(Math.random()*8)];
  return self.move(...direction);
}

export default prophet;