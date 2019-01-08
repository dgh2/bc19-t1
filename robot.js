import {BCAbstractRobot, SPECS} from 'battlecode';

const directions = [[0,-1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

step = -1;var

class Castle {
  run(step) {
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
  run(step) {
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
  run(step) {
    this.log("Pilgrim health: " + this.me.health);
	var direction = directions[Math.floor(Math.random()*directions.length)];
	return this.move(...direction);
  }
}

class Crusader {
  run(step) {
    this.log("Crusader health: " + this.me.health);
	var direction = directions[Math.floor(Math.random()*directions.length)];
	return this.move(...direction);
  }
}

class Prophet {
  run(step) {
    this.log("Prophet health: " + this.me.health);
	var direction = directions[Math.floor(Math.random()*directions.length)];
	return this.move(...direction);
  }
}

class Preacher {
  run(step) {
    this.log("Preacher health: " + this.me.health);
	var direction = directions[Math.floor(Math.random()*directions.length)];
	return this.move(...direction);
  }
}

class MyRobot extends BCAbstractRobot {
	constructor() {
		this.robot = null;
		
		switch (this.me.unit) {
			case SPECS.CASTLE:
				robot = new Castle();
				break;
			case SPECS.CHURCH:
				robot = new Church();
				break;
			case SPECS.PILGRIM:
				robot = new Pilgrim();
				break;
			case SPECS.CRUSADER:
				robot = new Crusader();
				break;
			case SPECS.PROPHET:
				robot = new Prophet();
				break;
			case SPECS.PREACHER:
				robot = new Preacher();
				break;
			default:
				this.log("Invalid unit type: " + this.me.unit);
				throw new TypeError("Invalid unit type: " + this.me.unit);
		}
	}
	
    turn() {
        this.step++;
		return robot.run();
    }
}

var robot = new MyRobot();
