import {BCAbstractRobot, SPECS} from 'battlecode';

const prophet = {};


prophet.turn = (self, step) => {
  self.log("Prophet health: " + self.me.health);
  var direction = directions[Math.floor(Math.random()*directions.length)];
  return self.move(...direction);
}

export default prophet;