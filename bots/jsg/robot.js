import {BCAbstractRobot, SPECS} from 'battlecode';
import Nav from './nav.js';

const SUPPRESS_LOGS = false;
const TIME_ALERT = SPECS.CHESS_EXTRA; //display a log when more than this amount of time was used last turn
const TIME_WARNING = SPECS.CHESS_INITIAL * .6; //display a log and skip some of this turn if less than this much time remains
const TIME_ERROR = SPECS.CHESS_INITIAL * .3; //display a log and skip this turn if less than this much time remains
const UNIT_TYPES = ['Castle', 'Church', 'Pilgrim', 'Crusader', 'Prophet', 'Preacher'];
const ATTACK_PRIORITY = [SPECS.CASTLE, SPECS.PREACHER, SPECS.PROPHET, SPECS.CRUSADER, SPECS.CHURCH, SPECS.PILGRIM];
const MINE_KARBONITE_BUFFER = {karbonite: 0, fuel: SPECS.MINE_FUEL_COST};
const MINE_FUEL_BUFFER = {karbonite: 0, fuel: SPECS.MINE_FUEL_COST + SPECS.UNITS[SPECS.CASTLE].CONSTRUCTION_FUEL};

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
        action = this.walk();
        if (action) {
            //this.log('Moving');
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
        if (onKarbonite && !karboniteFull && this.checkResources(MINE_KARBONITE_BUFFER)) {
            return this.mine();
        }
        if (onFuel && !fuelFull && this.checkResources(MINE_FUEL_BUFFER)) {
            return this.mine();
        }
    }
    
    build() {
        if (![SPECS.CASTLE, SPECS.CHURCH, SPECS.PILGRIM].includes(this.me.unit)) {
            return;
        }
        let action;
        let shouldBuild = false;
        switch(this.me.unit) {
            case SPECS.CASTLE:
            case SPECS.CHURCH:
                if (this.hasResourcesForUnits(SPECS.PILGRIM, SPECS.CHURCH)) {
                    let visiblePilgrims = this.nav.getVisibleRobots(this.team, SPECS.PILGRIM);
                    let visibleUnoccupiedResources = this.nav.getAllResourceLocations(visiblePilgrims, this.specs.VISION_RADIUS);
                    if (visibleUnoccupiedResources.length) {
                        shouldBuild = SPECS.PILGRIM;
                    }
                }
                break;
            case SPECS.PILGRIM:
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
                break;
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
        if (this.fuel < this.specs.FUEL_PER_MOVE) {
            return;
        }
        if (this.me.unit === SPECS.PILGRIM) {
            let hasKarbonite = !!this.me.karbonite;
            let hasFuel = !!this.me.fuel;
            let bases = this.nav.getVisibleRobots(this.team, [SPECS.CASTLE, SPECS.CHURCH]);
            if (hasKarbonite || hasFuel) {
                if (bases.length) {
                    return this.approach(bases[0]);
                }
            } else {
                let closestKarbonite = this.nav.getResourceLocations(this.getKarboniteMap(), this.nav.getVisibleRobots(), this.specs.VISION_RADIUS);
                let closestFuel = this.nav.getResourceLocations(this.getFuelMap(), this.nav.getVisibleRobots(), this.specs.VISION_RADIUS);
                //this.log('close Karbonite: ' + closestKarbonite.length);
                //this.log('close Fuel: ' + closestFuel.length);
                if (closestKarbonite.length) {
                    //this.log('Approaching Karbonite');
                    return this.approach(closestKarbonite[0]);
                } else if (closestFuel.length) {
                    //this.log('Approaching Fuel');
                    return this.approach(closestFuel[0]);
                } else if (bases.length) {
                    let dist = this.nav.sqDist(this.me, bases[0]);
                    if (dist <= 9) {
                        //this.log('Moving away from closest base');
                        return this.approach(bases[0], true);
                    } else if (dist > 36) {
                        //this.log('Approaching closest base');
                        return this.approach(bases[0]);
                    }
                }
            }
        }
        return this.randomWalk();
    }
    
    approach(target, retreat = false) {
        let dir = this.nav.getDir(this.me, target);
        if (retreat) {
            dir = this.nav.rotate(dir, 4);
        }
        let rotations = [-1,1,-2,2,-3,3];
        for (let i = 0; i < rotations.length; i++) {
            if (this.nav.isPassable(this.nav.applyDir(dir))) {
                break;
            }
            dir = this.nav.rotate(dir, rotations[i]);
        }
        let offset = dir;//this.nav.applyDist(dir, this.specs.SPEED);
        if (this.nav.isPassable(this.nav.applyDir(offset))) {
            return this.move(offset.x, offset.y);
        }
    }
    
    randomWalk() {
        if (!this.specs.SPEED) {
            return;
        }
        
        if (this.dir && !this.nav.isPassable(this.nav.applyDir(this.dir))) {
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
        let totalCost = this.getTotalResourceCost.apply(this, arguments);
        return this.checkResources(totalCost);
    }
    
    getTotalResourceCost() { //Accepts any number of arguments
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