import {BCAbstractRobot, SPECS} from 'battlecode';

const crusader = {};


crusader.turn = (self, step) => {
  self.log("Crusader health: " + self.me.health);
  var direction = directions[Math.floor(Math.random()*directions.length)];
  return self.move(...direction);
}

export default crusader;