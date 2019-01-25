import {BCAbstractRobot, SPECS} from 'battlecode';
import Nav from './nav.js';

const SUPPRESS_LOGS = false;
const TIME_ALERT = SPECS.CHESS_EXTRA; //display a log when more than this amount of time was used last turn
const TIME_WARNING = SPECS.CHESS_INITIAL * .6; //display a log and skip some of this turn if less than this much time remains
const TIME_ERROR = SPECS.CHESS_INITIAL * .3; //display a log and skip this turn if less than this much time remains
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
        this.previousTime = SPECS.CHESS_INITIAL - SPECS.CHESS_EXTRA;
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
        let stepTimeCost = this.previousTime - (this.time - SPECS.CHESS_EXTRA);
        this.previousTime = this.time;
        this.step++;
        this.castleTalk(this.me.unit + 1); //unit+1 because all units have castleTalk == 0 between creation and their first turn
        if (stepTimeCost >= TIME_ALERT) {
            this.log('ALERT: Excessive time of ' + stepTimeCost + ' used last turn! ' + this.time + ' remaining.');
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
        action = this.randomWalk();
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
        
        let karboniteFull = this.me.karbonite >= this.specs.KARBONITE_CAPACITY;
        let fuelFull = this.me.fuel >= this.specs.FUEL_CAPACITY;
        if (karboniteFull || fuelFull) {
            let bases = this.nav.getVisibleRobots(this.team, [SPECS.CASTLE, SPECS.CHURCH]);
            let baseIsAdjacent = bases.length && this.nav.sqDist(this.me, bases[0]) < 2**2;
            if (baseIsAdjacent) {
                let dir = this.nav.getDir(this.me, bases[0]);
                return this.give(dir.x, dir.y, this.me.karbonite, this.me.fuel);
            }
        }
    }
    
    gather() {
        if (this.me.unit !== SPECS.PILGRIM) {
            return;
        }
        let karboniteFull = this.me.karbonite >= this.specs.KARBONITE_CAPACITY;
        let fuelFull = this.me.fuel >= this.specs.FUEL_CAPACITY;
        let onKarbonite = this.getKarboniteMap()[this.me.y][this.me.x];
        let onFuel = this.getFuelMap()[this.me.y][this.me.x];
        if ((onKarbonite && !karboniteFull) || (onFuel && !fuelFull)) {
            return this.mine();
        }
    }
    
    build() {
        if (![SPECS.CASTLE, SPECS.CHURCH, SPECS.PILGRIM].includes(this.me.unit)) {
            return;
        }
        let action;
        let shouldBuild = false;
        if ([SPECS.CASTLE, SPECS.CHURCH].includes(this.me.unit)) {
            let visiblePilgrims = this.nav.getVisibleRobots(this.team, SPECS.PILGRIM);
            let visibleResources = this.nav.getResourceLocations();
            if (this.hasResourcesForUnits(SPECS.PILGRIM, SPECS.CHURCH)) {
                shouldBuild = SPECS.PILGRIM;
            }
        } else if (this.me.unit == SPECS.PILGRIM) {
            if (this.hasResourcesForUnits(SPECS.CHURCH)) {
                let bases = this.nav.getVisibleRobots(this.team, [SPECS.CASTLE, SPECS.CHURCH]);
                let baseIsAdjacent = bases.length && this.nav.sqDist(this.me, bases[0]) < 2**2;
                if (!baseIsAdjacent) {
                    let karboniteFull = this.me.karbonite >= this.specs.KARBONITE_CAPACITY;
                    let fuelFull = this.me.fuel >= this.specs.FUEL_CAPACITY;
                    let onKarbonite = this.getKarboniteMap()[this.me.y][this.me.x];
                    let onFuel = this.getFuelMap()[this.me.y][this.me.x];
                    if ((karboniteFull && onKarbonite) || (fuelFull && onFuel)) {
                        shouldBuild = SPECS.CHURCH;
                    }
                }
            }
        }
        if (shouldBuild)  {
            let dir = this.nav.getRandomValidDir(this.me.unit == SPECS.PILGRIM, this.karbonite <= this.fuel, this.fuel < this.karbonite);
            if (dir) {
                action = this.buildUnit(shouldBuild, dir.x, dir.y);
            }
        }
        return action;
    }
    
    fight(attackOrder = ATTACK_PRIORITY) {
        if (!this.specs.ATTACK_RADIUS) {
            return;
        }
        
        let action;
        for (let i = 0; i < attackOrder.length; i++) {
            action = this.attackClosestEnemy(attackOrder[i]);
            if (action) {
                return action;
            }
        }
    }
    
    walk() {
        if (this.me.unit === SPECS.PILGRIM) {
            let hasKarbonite = !!this.me.karbonite;
            let hasFuel = !!this.me.fuel;
        }
        return this.randomWalk();
    }
    
    run() {
    }
    
    randomWalk() {
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
        let closestEnemies = this.nav.getVisibleRobots(this.enemyTeam, units);
        if (closestEnemies && closestEnemies.length) {
            let closest = closestEnemies[0];
            let distance = this.nav.sqDist(this.me, closest);
            if (distance >= this.specs.ATTACK_RADIUS[0] && distance <= this.specs.ATTACK_RADIUS[1]) {
                let attackOffset = {x: closest.x - this.me.x, y: closest.y - this.me.y};
                return this.attack(attackOffset.x, attackOffset.y);
            }
        }
    }
    
    hasResourcesForUnits() { //Accepts any number of arguments
        return this.checkResources(this.getTotalResourceCost.apply(this, arguments));
    }
    
    getTotalResourceCost() { //Accepts any number of arguments
        let k = 0;
        let f = 0;
        for (let i = 0; i < arguments.length; i++) {
            k += SPECS.UNITS[arguments[i]].CONSTRUCTIonKarbonite;
            f += SPECS.UNITS[arguments[i]].CONSTRUCTIonFuel;
        }
        return {karbonite: k, fuel: f};
    }

    checkResources(resources) {
        if (this.karbonite < resources.karbonite) {
            return false;
        }
        if (this.fuel < resources.fuel) {
            return false;
        }
        return true;
    }
    
    initialize() {
        //first turn initialization
        this._unit = UNIT_TYPES[this.me.unit];
        this.specs = SPECS.UNITS[this.me.unit];
        this.team = this.me.team;
        this.enemyTeam = (this.me.team === SPECS.RED ? SPECS.BLUE : SPECS.RED);
        this.reflection = this.nav.getReflection();
        this.center = this.nav.getMapCenter();
    }
}

var robot = new MyRobot();