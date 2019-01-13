import {BCAbstractRobot, SPECS} from 'battlecode';

const preacher = {};


preacher.turn = (self, step) => {
  self.log("Preacher health: " + self.me.health);
  var direction = directions[Math.floor(Math.random()*directions.length)];
  return self.move(...direction);
}

export default preacher;