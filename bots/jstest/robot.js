import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';
import castle from './castle.js';
import church from './church.js';
import pilgrim from './pilgrim.js';
import crusader from './crusader.js';
import prophet from './prophet.js';
import preacher from './preacher.js';
  
let step = -1;
var slave = null;

class MyRobot extends BCAbstractRobot {
    turn() {
        if (step == -1) {
            //first turn initialization
            switch (this.me.unit) {
                case SPECS.CASTLE:
                    slave = castle;
                    break;
                case SPECS.CHURCH:
                    slave = church;
                    break;
                case SPECS.PILGRIM:
                    slave = pilgrim;
                    break;
                case SPECS.CRUSADER:
                    slave = crusader;
                    break;
                case SPECS.PROPHET:
                    slave = prophet;
                    break;
                case SPECS.PREACHER:
                    slave = preacher;
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
        return slave.turn(this, step);
    }
}

var robot = new MyRobot();