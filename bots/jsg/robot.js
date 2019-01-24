import {BCAbstractRobot, SPECS} from 'battlecode';
import Nav from './nav.js';

const SUPPRESS_LOGS = false;
const TIME_ALERT = SPECS.CHESS_EXTRA; //display a log when more than this amount of time was used last turn
const TIME_WARNING = SPECS.CHESS_INITIAL * .6; //display a log and skip some of this turn if less than this much time remains
const TIME_ERROR = SPECS.CHESS_INITIAL * .3; //display a log and skip this turn if less than this much time remains
//const FUNCTION_LIST = [castle, church, pilgrim, crusader, prophet, preacher];
const UNIT_TYPES = ['Castle', 'Church', 'Pilgrim', 'Crusader', 'Prophet', 'Preacher'];
const ATTACK_PRIORITY = [SPECS.CASTLE, SPECS.PREACHER, SPECS.PROPHET, SPECS.CRUSADER, SPECS.CHURCH, SPECS.PILGRIM];

class MyRobot extends BCAbstractRobot {
    constructor() {
        super();
        this._slave; //names beginning with _ are known to not be intended for use elsewhere
        this._log = this.log; //backup original this.log at this._log
        this.log = this._newLog; //replace this.log calls with this._newLog calls
        this._unit = '';
        
        this.step = -1;
        this.specs;
        this.previous_time = SPECS.CHESS_INITIAL - SPECS.CHESS_EXTRA;
        this.nav = new Nav(this);
    }
    
    _newLog(message) {
        if (!SUPPRESS_LOGS) {
            let loc = '(' + this.me.x + ',' + this.me.y + ')';
            let prefix = this._unit + ' ' + loc + ': ';
            this._log(prefix + message); //call back to original this.log
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
        if (step_time_cost >= TIME_ALERT) {
            this.log('ALERT: Excessive time of ' + step_time_cost + ' used last turn! ' + this.time + ' remaining.');
        }
        if (this.time <= TIME_WARNING) {
            this.log('WARNING: Time low, running shortened turn! ' + this.time + ' remaining.');
            return this.shortTurn();
        }
        if (this.time <= TIME_ERROR) {
            this.log('ERROR: Insufficient time, skipping turn! ' + this.time + ' remaining.');
            return;
        }
        return this.fullTurn();
    }
    
    shortTurn() {
        let action;
        action = this.attackClosestEnemy();
        if (action) {
            //this.log('Attacking');
            return action;
        }
        action = this.deposit();
        if (action) {
            //this.log('Depositing');
            return action;
        }
        action = this.gather();
        if (action) {
            //this.log('Gathering');
            return action;
        }
    }
    
    fullTurn() {
        let action;
        action = this.build();
        if (action) {
            //this.log('Building');
            return action;
        }
        action = this.fight();
        if (action) {
            //this.log('Attacking');
            return action;
        }
        action = this.deposit();
        if (action) {
            //this.log('Depositing');
            return action;
        }
        action = this.gather();
        if (action) {
            //this.log('Gathering');
            return action;
        }
        action = this.random_walk();
        if (action) {
            //this.log('Randomly walking');
            return action;
        }
        //this.log('Waiting');
    }
    
    deposit() {
        if ([SPECS.CASTLE, SPECS.CHURCH].includes(this.me.unit)) {
            return;
        }
        
        let karbonite_full = this.me.karbonite >= this.specs.KARBONITE_CAPACITY;
        let fuel_full = this.me.fuel >= this.specs.FUEL_CAPACITY;
        if (karbonite_full || fuel_full) {
            let bases = this.nav.getVisibleRobots(this.team, [SPECS.CASTLE, SPECS.CHURCH]);
            let base_is_adjacent = bases.length && this.nav.sqDist(this.me, bases[0]) < 2**2;
            if (base_is_adjacent) {
                let dir = this.nav.getDir(this.me, bases[0]);
                return this.give(dir.x, dir.y, this.me.karbonite, this.me.fuel);
            }
        }
    }
    
    gather() {
        if (this.me.unit !== SPECS.PILGRIM) {
            return;
        }
        let karbonite_full = this.me.karbonite >= this.specs.KARBONITE_CAPACITY;
        let fuel_full = this.me.fuel >= this.specs.FUEL_CAPACITY;
        let on_karbonite = this.getKarboniteMap()[this.me.y][this.me.x];
        let on_fuel = this.getFuelMap()[this.me.y][this.me.x];
        if ((on_karbonite && !karbonite_full) || (on_fuel && !fuel_full)) {
            return this.mine();
        }
    }
    
    build() {
        if (![SPECS.CASTLE, SPECS.CHURCH, SPECS.PILGRIM].includes(this.me.unit)) {
            return;
        }
        let action;
        let should_build = false;
        if ([SPECS.CASTLE, SPECS.CHURCH].includes(this.me.unit)) {
            if (this.hasResourcesForUnits(SPECS.PILGRIM, SPECS.CHURCH)) {
                should_build = SPECS.PILGRIM;
            }
        } else if (this.me.unit == SPECS.PILGRIM) {
            if (this.hasResourcesForUnits(SPECS.CHURCH)) {
                let bases = this.nav.getVisibleRobots(this.team, [SPECS.CASTLE, SPECS.CHURCH]);
                let base_is_adjacent = bases.length && this.nav.sqDist(this.me, bases[0]) < 2**2;
                if (!base_is_adjacent) {
                    let karbonite_full = this.me.karbonite >= this.specs.KARBONITE_CAPACITY;
                    let fuel_full = this.me.fuel >= this.specs.FUEL_CAPACITY;
                    let on_karbonite = this.getKarboniteMap()[this.me.y][this.me.x];
                    let on_fuel = this.getFuelMap()[this.me.y][this.me.x];
                    if ((karbonite_full && on_karbonite) || (fuel_full && on_fuel)) {
                        should_build = SPECS.CHURCH;
                    }
                }
            }
        }
        if (should_build)  {
            let dir = this.nav.getRandomValidDir(this.me.unit == SPECS.PILGRIM, this.karbonite <= this.fuel, this.fuel < this.karbonite);
            if (dir) {
                action = this.buildUnit(should_build, dir.x, dir.y);
            }
        }
        return action;
    }
    
    fight(attack_order = ATTACK_PRIORITY) {
        if (!this.specs.ATTACK_RADIUS) {
            return;
        }
        
        let action;
        for (let i = 0; i < attack_order.length; i++) {
            action = this.attackClosestEnemy(attack_order[i]);
            if (action) {
                return action;
            }
        }
    }
    
    random_walk() {
        if (!this.specs.SPEED) {
            return;
        }
        
        if (this.dir && !this.nav.isPassable(this.nav.applyDir(this.me, this.dir))) {
            this.dir = null;
        }
        //anything else that might set dir
        if (!this.dir) {
            this.dir = this.nav.getRandomValidDir(this);
        }
        if (this.dir && this.fuel >= this.specs.FUEL_PER_MOVE) {
            //this.log('Moving to ' + this.dir.x + ',' + this.dir.y);
            return this.move(this.dir.x, this.dir.y);
        }
        this.log('No valid dirs');
    }
    
    attackClosestEnemy(units) { //attack the closest enemy with a type included the units array
        let closestEnemies = this.nav.getVisibleRobots(this.enemy_team, units);
        if (closestEnemies && closestEnemies.length) {
            let closest = closestEnemies[0];
            let distance = this.nav.sqDist(this.me, closest);
            if (distance >= this.specs.ATTACK_RADIUS[0] && distance <= this.specs.ATTACK_RADIUS[1]) {
                let attack_offset = {x: closest.x - this.me.x, y: closest.y - this.me.y};
                return this.attack(attack_offset.x, attack_offset.y);
            }
        }
    }
    
    hasResourcesForUnits() {
        let cost = this.getTotalResourceCost.apply(this, arguments);
        return this.checkResources(cost);
    }
    
    getTotalResourceCost() {
        let k = 0;
        let f = 0;
        for (let i = 0; i < arguments.length; i++) {
            k += SPECS.UNITS[arguments[i]].CONSTRUCTION_KARBONITE;
            f += SPECS.UNITS[arguments[i]].CONSTRUCTION_FUEL;
        }
        return {karbonite: k, fuel: f};
    }

    checkResources(resources) {
        if (this.karbonite < resources.karbonite) {
            return false; //not enough karbonite
        }
        if (this.fuel < resources.fuel) {
            return false; //not enough fuel
        }
        return true;
    }
    
    initialize() {
        //first turn initialization
        //this._unit = FUNCTION_LIST[this.me.unit].constructor.name;
        this._unit = UNIT_TYPES[this.me.unit];
        this.specs = SPECS.UNITS[this.me.unit];
        this.team = this.me.team;
        this.enemy_team = (this.me.team === SPECS.RED ? SPECS.BLUE : SPECS.RED);
    }
}

var robot = new MyRobot();