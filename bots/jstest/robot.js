import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';
import castle from './castle.js';
import church from './church.js';
import pilgrim from './pilgrim.js';
import crusader from './crusader.js';
import prophet from './prophet.js';
import preacher from './preacher.js';

const SUPPRESS_LOGS = false;
const FUNCTION_LIST = [castle, church, pilgrim, crusader, prophet, preacher];

class MyRobot extends BCAbstractRobot {
    constructor() {
        super();
        this._slave = null; //names beginning with _ are known to not be intended for use elsewhere
        this._log = this.log; //backup original self.log at self._log
        this.log = this._newLog; //replace self.log calls with self._newLog calls
        this._unit = "";
        
        this.self = this;
        this.step = -1;
        this.specs = null;
    }
    
    _newLog(message) {
        if (!SUPPRESS_LOGS) {
            let loc = "(" + this.me.x + "," + this.me.y + ")";
            let prefix = this._unit + " " + loc + ": ";
            this._log(prefix + message); //call back to original self.log
        }
    }
    
    turn() {
        if (this.step == -1) {
            this.initialize();
        }
        this.step++;
        this.castleTalk(this.me.unit + 1); //unit+1 because all units have castle_talk == 0 between creation and their first turn
        //return new Function('return ' + FUNCTION_LIST[this.me.unit].toLowerCase() + '.turn(this);')(); //don't do this anywhere else
        return FUNCTION_LIST[this.me.unit].turn(this);
    }
    
    initialize() {
        //first turn initialization
        this._unit = FUNCTION_LIST[this.me.unit].constructor.name;
        this.specs = SPECS['UNITS'][this.me.unit];
    }
}

var robot = new MyRobot();