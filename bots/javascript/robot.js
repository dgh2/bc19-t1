import {BCAbstractRobot, SPECS} from 'battlecode';

const directions = [[0,-1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

var step = -1;

class Castle {
  turn() {
    this.log("Castle health: " + this.me.health);
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
  }
}

class Church {
  turn() {
    this.log("Church health: " + this.me.health);
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
  }
}

class Pilgrim {
  turn() {
    this.log("Pilgrim health: " + this.me.health);
    var direction = directions[Math.floor(Math.random()*directions.length)];
    return this.move(...direction);
  }
}

class Crusader {
  turn() {
    this.log("Crusader health: " + this.me.health);
    var direction = directions[Math.floor(Math.random()*directions.length)];
    return this.move(...direction);
  }
}

class Prophet {
  turn() {
    this.log("Prophet health: " + this.me.health);
    var direction = directions[Math.floor(Math.random()*directions.length)];
    return this.move(...direction);
  }
}

class Preacher {
  turn() {
    this.log("Preacher health: " + this.me.health);
    var direction = directions[Math.floor(Math.random()*directions.length)];
    return this.move(...direction);
  }
}

class MyRobot extends BCAbstractRobot {
	constructor() {
		super();
		this.robot = null;
		
		switch (this.me.unit) {
			case SPECS.CASTLE:
				this.robot = new Castle();
				break;
			case SPECS.CHURCH:
				this.robot = new Church();
				break;
			case SPECS.PILGRIM:
				this.robot = new Pilgrim();
				break;
			case SPECS.CRUSADER:
				this.robot = new Crusader();
				break;
			case SPECS.PROPHET:
				this.robot = new Prophet();
				break;
			case SPECS.PREACHER:
				this.robot = new Preacher();
				break;
			default:
				this.log("Invalid unit type: " + this.me.unit);
				throw new TypeError("Invalid unit type: " + this.me.unit);
		}
	}
	
  turn() {
    this.step++;
    return robot.turn();
  }
}

var robot = new MyRobot();
