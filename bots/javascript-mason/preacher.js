import {BCAbstractRobot, SPECS} from 'battlecode';

const preacher = {};

preacher.turn = (self, step, directionz, directions, opposite_directions) => {
  self.log("Preacher health: " + self.me.health);
  var direction = directionz[Math.floor(Math.random()*directions.length)];
  return self.move(...direction);
}

export default preacher;