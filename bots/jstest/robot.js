import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';
import castle from './castle.js';
import church from './church.js';
import pilgrim from './pilgrim.js';
import crusader from './crusader.js';
import prophet from './prophet.js';
import preacher from './preacher.js';

const SUPPRESS_LOGS = false;
const TIME_ALERT = SPECS.CHESS_EXTRA; //display a log when more than this amount of time was used last turn
const TIME_WARNING = SPECS.CHESS_INITIAL * .6; //display a log and skip some of this turn if less than this much time remains
const TIME_ERROR = SPECS.CHESS_INITIAL * .3; //display a log and skip this turn if less than this much time remains
const FUNCTION_LIST = [castle, church, pilgrim, crusader, prophet, preacher];

class MyRobot extends BCAbstractRobot {
    constructor() {
        super();
        this._slave; //names beginning with _ are known to not be intended for use elsewhere
        this._log = this.log; //backup original self.log at self._log
        this.log = this._newLog; //replace self.log calls with self._newLog calls
        this._unit = "";
        
        //These are now available in 'this' in the MyRobot class and 'self' in the unit classes
        this.self = this;
        this.step = -1;
        this.specs;
        this.previous_time = SPECS.CHESS_INITIAL - SPECS.CHESS_EXTRA;
        this.enemy_team;
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
        let step_time_cost = this.previous_time - (this.time - SPECS.CHESS_EXTRA);
        this.previous_time = this.time;
        this.step++;
        this.castleTalk(this.me.unit + 1); //unit+1 because all units have castle_talk == 0 between creation and their first turn
        //return new Function('return ' + FUNCTION_LIST[this.me.unit].toLowerCase() + '.turn(this);')(); //don't do this anywhere else
        let remaining_time = ' - ' + this.time + ' remaining';
        if (step_time_cost >= TIME_ALERT) {
            this.log('ALERT: Excessive time of ' + step_time_cost + ' used last turn!' + remaining_time);
        }
        if (this.time <= TIME_WARNING) {
            if (nav.exists(FUNCTION_LIST[this.me.unit].shortTurn)) {
                this.log('WARNING: Time low, running shortened turn!' + remaining_time);
                return FUNCTION_LIST[this.me.unit].shortTurn(this);
            } else {
                this.log('WARNING: Time low!' + remaining_time);
            }
        }
        if (this.time <= TIME_ERROR) {
            this.log('ERROR: Insufficient time, skipping turn!' + remaining_time);
            return;
        }
        return FUNCTION_LIST[this.me.unit].turn(this);
    }
    
    initialize() {
        //first turn initialization
        this._unit = FUNCTION_LIST[this.me.unit].constructor.name;
        this.specs = SPECS['UNITS'][this.me.unit];
    }
}

var robot = new MyRobot();