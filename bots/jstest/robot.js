import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';
import castle from './castle.js';
import church from './church.js';
import pilgrim from './pilgrim.js';
import crusader from './crusader.js';
import prophet from './prophet.js';
import preacher from './preacher.js';


class MyRobot extends BCAbstractRobot {
    constructor() {
        super();
        this.slave = null;
        this.unit = "";
        this.step = -1; //add step to self
        this.oldLog = this.log; //backup original self.log at self.oldLog
        this.log = this.newLog; //replace self.log calls with self.newLog calls
        this.specs = null;
    }
    
    newLog(message) {
        let loc = "(" + this.me.x + "," + this.me.y + ")";
        let prefix = this.unit + " " + loc + ": ";
        this.oldLog(prefix + message); //call back to original self.log now at self.oldLog
    }
    
    turn() {
        if (this.step == -1) {
            //first turn initialization
            switch (this.me.unit) {
                case SPECS.CASTLE:
                    this.unit = "Castle";
                    this.slave = castle;
                    break;
                case SPECS.CHURCH:
                    this.unit = "Church";
                    this.slave = church;
                    break;
                case SPECS.PILGRIM:
                    this.unit = "Pilgrim";
                    this.slave = pilgrim;
                    break;
                case SPECS.CRUSADER:
                    this.unit = "Crusader";
                    this.slave = crusader;
                    break;
                case SPECS.PROPHET:
                    this.unit = "Prophet";
                    this.slave = prophet;
                    break;
                case SPECS.PREACHER:
                    this.unit = "Preacher";
                    this.slave = preacher;
                    break;
                default:
                    r = this.me;
                    if (r != null) {
                        this.log("Invalid unit type: " + r.unit);
                        throw new TypeError("Invalid unit type: " + r.unit);
                    }
            }
            this.specs = SPECS['UNITS'][this.me.unit];
        }
        this.step++;
        this.castleTalk(this.me.unit + 1);
        return this.slave.turn(this);
    }
}

var robot = new MyRobot();