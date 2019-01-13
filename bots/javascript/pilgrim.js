import {BCAbstractRobot, SPECS} from 'battlecode';

const pilgrim = {};

pilgrim.turn = (self, step, directionz, directions, opposite_directions) => {
  self.log("Pilgrim health: " + self.me.health);
  var direction = directionz[Math.floor(Math.random()*directions.length)];
  return self.move(...direction);
}

export default pilgrim;