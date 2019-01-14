import {BCAbstractRobot, SPECS} from 'battlecode';

const church = {};

church.turn = (self, step, directionz, directions, opposite_directions) => {
  self.log("Church health: " + self.me.health);
  if (step % 10 === 0) {
    self.log("Building a pilgrim at " + (self.me.x+1) + ", " + (self.me.y+1));
    return self.buildUnit(SPECS.PILGRIM, 1, 1);
  } else if (step % 12 === 0) {
    self.log("Building a crusader at " + (self.me.x+1) + ", " + (self.me.y+1));
    return self.buildUnit(SPECS.CRUSADER, 1, 1);
  } else if (step % 15 === 0) {
    self.log("Building a prophet at " + (self.me.x+1) + ", " + (self.me.y+1));
    return self.buildUnit(SPECS.PROPHET, 1, 1);
  } else if (step % 19 === 0) {
    self.log("Building a preacher at " + (self.me.x+1) + ", " + (self.me.y+1));
    return self.buildUnit(SPECS.PREACHER, 1, 1);
  }
}

export default church;