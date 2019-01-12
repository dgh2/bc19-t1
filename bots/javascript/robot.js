import {BCAbstractRobot, SPECS} from 'battlecode';

const directions = [[0,-1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

var step = -1;
var slave = null;

class Castle {
  turn(self) {
    self.log("Castle health: " + self.me.health);
    /*
    if (step % 10 === 0) {
      this.log("Building a pilgrim at " + (this.me.x+1) + ", " + (this.me.y+1));
      return this.buildUnit(SPECS.PILGRIM, 1, 1);
    } else if (step % 12 === 0) {
      this.log("Building a crusader at " + (this.me.x+1) + ", " + (this.me.y+1));
      return this.buildUnit(SPECS.CRUSADER, 1, 1);
    } else if (step % 15 === 0) {
      this.log("Building a prophet at " + (this.me.x+1) + ", " + (this.me.y+1));
      return this.buildUnit(SPECS.PROPHET, 1, 1);
    } else if (step % 19 === 0) {
      this.log("Building a preacher at " + (this.me.x+1) + ", " + (this.me.y+1));
      return this.buildUnit(SPECS.PREACHER, 1, 1);
    }
    */
  }
}

class Church {
  turn(self) {
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
}

class Pilgrim {
  turn() {
    self.log("Pilgrim health: " + self.me.health);
    var direction = directions[Math.floor(Math.random()*directions.length)];
    return self.move(...direction);
  }
}

class Crusader {
  turn() {
    self.log("Crusader health: " + self.me.health);
    var direction = directions[Math.floor(Math.random()*directions.length)];
    return self.move(...direction);
  }
}

class Prophet {
  turn() {
    self.log("Prophet health: " + self.me.health);
    var direction = directions[Math.floor(Math.random()*directions.length)];
    return self.move(...direction);
  }
}

class Preacher {
  turn() {
    self.log("Preacher health: " + self.me.health);
    var direction = directions[Math.floor(Math.random()*directions.length)];
    return self.move(...direction);
  }
}

class MyRobot extends BCAbstractRobot {
  turn() {
    if (step == -1) {
      //first turn initialization
      switch (this.me.unit) {
        case SPECS.CASTLE:
          slave = new Castle();
          break;
        case SPECS.CHURCH:
          slave = new Church();
          break;
        case SPECS.PILGRIM:
          slave = new Pilgrim();
          break;
        case SPECS.CRUSADER:
          slave = new Crusader();
          break;
        case SPECS.PROPHET:
          slave = new Prophet();
          break;
        case SPECS.PREACHER:
          slave = new Preacher();
          break;
        default:
          r = this.me;
          if (r != null) {
            this.log("Invalid unit type: " + r.unit);
            throw new TypeError("Invalid unit type: " + r.unit);
          }
      }
    }
    step++;
    return slave.turn(this);
  }
}

var robot = new MyRobot();
