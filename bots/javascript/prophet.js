import {BCAbstractRobot, SPECS} from 'battlecode';

const prophet = {};

prophet.turn = (self, step, directionz, directions, opposite_directions) => {
  self.log("Prophet health: " + self.me.health);
  var direction = directionz[Math.floor(Math.random()*directions.length)];
  return self.move(...direction);
}

export default prophet;