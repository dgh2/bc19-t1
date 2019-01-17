import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';
import castle from './castle.js';
import church from './church.js';
import pilgrim from './pilgrim.js';
import crusader from './crusader.js';
import prophet from './prophet.js';
import preacher from './preacher.js';

const CLASS_LIST = [castle, church, pilgrim, crusader, prophet, preacher]; //list of classes for each unit type, in index order

//GLOBAL SETTINGS
const SUPPRESS_LOGS = false; //set to true to suppress all output logging

class MyRobot extends BCAbstractRobot {
    constructor() { //bc19 data like this.me is not yet available
        super();
        
        //variable names beginning with _ are not intended for use elsewhere
        this._unit = ""; //This unit's type as a string value, used for displaying in logs
        this._class = null; //This unit's class object, used for calling .turn() each turn
        this._log = this.log; //backup original self.log at self._log
        this.log = this._newLog; //replace self.log calls with self._newLog calls
        
        //helpful variables added to self. Anything requiring bc19 data must be set in initialize()
        this.self = this; //helper for having self available
        this.step = -1; //turn counter. 0 for first turn because robots
        this.specs = null; //helper storing the specs for this unit's type
    }
    
    initialize() { //the first time that bc19 data like this.me is available to use
        //first turn initialization
        this._class = CLASS_LIST[this.me.unit]; //Get class object from CLASS_LIST
        this._unit = this._class.constructor.name; //Get class name from class object (castle -> "Castle")
        this.specs = SPECS['UNITS'][this.me.unit]; //Get data for this unit type from SPECS
    }
    
    turn() {
        if (this.step == -1) {
            this.initialize(); //run initialize() method on only the first turn
        }
        this.step++; //increment turn counter
        this.castleTalk(this.me.unit + 1); //unit+1 because all units have castle_talk == 0 between creation and their first turn
        return this._class.turn(this); //call turn method for unit's class
    }
    
    _newLog(message) { //ids don't match between logs and visualizer, so robot location is needed to uniquely identify a unit
        if (!SUPPRESS_LOGS) { //Set SUPPRESS_LOGS to true to disable all logging output
            let loc = "(" + this.me.x + "," + this.me.y + ")"; //get this robot's location, needed to identify a unit 
            let prefix = this._unit + " " + loc + ": "; //get the robot's unit type and location for display
            this._log(prefix + message); //call back to original self.log with unit type and location added before the message
        }
    }
}

var robot = new MyRobot();