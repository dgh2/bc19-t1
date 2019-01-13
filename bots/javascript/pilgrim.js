import {BCAbstractRobot, SPECS} from 'battlecode';

const pilgrim = {};


pilgrim.turn = (self, step) => {
  self.log("Pilgrim health: " + self.me.health);
  var direction = directions[Math.floor(Math.random()*directions.length)];
  return self.move(...direction);
}

export default pilgrim;