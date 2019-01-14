import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';
import castle from './castle.js';
import church from './church.js';
import pilgrim from './pilgrim.js';
import crusader from './crusader.js';
import prophet from './prophet.js';
import preacher from './preacher.js';

var slave = null;
var step = -1;
var prefix = "";
var unit = "";
var location = "";

class MyRobot extends BCAbstractRobot {
    turn() {
        if (step == -1) {
            var prefix = "";
            //first turn initialization
            switch (this.me.unit) {
                case SPECS.CASTLE:
                    unit = "Castle";
                    slave = castle;
                    break;
                case SPECS.CHURCH:
                    unit = "Church";
                    slave = church;
                    break;
                case SPECS.PILGRIM:
                    unit = "Pilgrim";
                    slave = pilgrim;
                    break;
                case SPECS.CRUSADER:
                    unit = "Crusader";
                    slave = crusader;
                    break;
                case SPECS.PROPHET:
                    unit = "Prophet";
                    slave = prophet;
                    break;
                case SPECS.PREACHER:
                    unit = "Preacher";
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
        location = "(" + this.me.x + "," + this.me.y + ")";
        prefix = unit + " - " + location + ": ";
        return slave.turn(this, step, prefix);
    }
}

var robot = new MyRobot();