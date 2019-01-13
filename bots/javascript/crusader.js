import {BCAbstractRobot, SPECS} from 'battlecode';

const crusader = {};

crusader.turn = (self, step, directionz, directions, opposite_directions) => {
  self.log("Crusader health: " + self.me.health);
  var direction = directionz[Math.floor(Math.random()*directions.length)];
  return self.move(...direction);
}

export default crusader;