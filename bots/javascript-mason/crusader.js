import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const crusader = {};

crusader.turn = (self, step) => {
  self.log("Crusader health: " + self.me.health);
  var direction = nav.directionz[Math.floor(Math.random()*8)];
  return self.move(...direction);
}

export default crusader;