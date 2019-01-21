import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const CHURCH_KARBONITE = SPECS['UNITS'][SPECS.CHURCH].CONSTRUCTION_KARBONITE;
const CHURCH_FUEL = SPECS['UNITS'][SPECS.CHURCH].CONSTRUCTION_FUEL;
const CHURCH_COSTS = {karbonite: CHURCH_KARBONITE, fuel: CHURCH_FUEL};
const BUFFER_RESOURCES = {karbonite: CHURCH_KARBONITE, fuel: CHURCH_FUEL};
const TARGET_KARBONITE = {karbonite: 3*CHURCH_KARBONITE, fuel: 0};
const TARGET_FUEL = {karbonite: 0, fuel: 3*CHURCH_FUEL};
const MEMORY = 15;

var castles = [];
var churches = [];
var occupied_karbonite = [];
var occupied_fuel = [];

class Pilgrim {
    turn(self) {
        this.self = self;
        
        //maintain current occupied karbonite list
        for (let i = occupied_karbonite.length - 1; i >= 0; i--) { //iterate in reverse so removing elements during iteration doesn't cause problems
            let loc = occupied_karbonite[i];
            let remove = false;
            if (self.me.x === loc.x && self.me.y === loc.y) {
                remove = true;
            } else if (self.getVisibleRobotMap()[loc.y][loc.x] === 0) {
                remove = true;
            } else if (self.getVisibleRobotMap()[loc.y][loc.x] > 0) {
                let robot = self.getRobot(self.getVisibleRobotMap()[loc.y][loc.x]);
                if (!self.isVisible(robot) || SPECS.PILGRIM !== robot.type) {
                    remove = true;
                }
            }
            if (remove) {
                occupied_karbonite.splice(i, 1);
            }
        }
        //maintain current occupied fuel list
        for (let i = occupied_fuel.length - 1; i >= 0; i--) { //iterate in reverse so removing elements during iteration doesn't cause problems
            let loc = occupied_fuel[i];
            let remove = false;
            if (self.me.x === loc.x && self.me.y === loc.y) {
                remove = true;
            } else if (self.getVisibleRobotMap()[loc.y][loc.x] === 0) {
                remove = true;
            } else if (self.getVisibleRobotMap()[loc.y][loc.x] > 0) {
                let robot = self.getRobot(self.getVisibleRobotMap()[loc.y][loc.x]);
                if (!self.isVisible(robot) || SPECS.PILGRIM !== robot.type) {
                    remove = true;
                }
            }
            if (remove) {
                occupied_fuel.splice(i, 1);
            }
        }
        //maintain current castles list
        for (let i = castles.length - 1; i >= 0; i--) { //iterate in reverse so removing elements during iteration doesn't cause problems
            let base = castles[i];
            let robot = self.getVisibleRobotMap()[base.y][base.x];
            if (robot > 0) {
                robot = self.getRobot(robot);
            }
            if (robot === 0 || robot.team != self.team || robot.unit != SPECS.CASTLE) {
                castles.splice(i, 1);
            }
        }
        //maintain current churches list
        for (let i = 0; i < churches.length; i++) {
            let base = churches[i];
            let robot = self.getVisibleRobotMap()[base.y][base.x];
            if (robot > 0) {
                robot = self.getRobot(robot);
            }
            if (robot === 0 || robot.team != self.team || robot.unit != SPECS.CHURCH) {
                churches.splice(i, 1);
            }
        }
        
        //get enemy info
        let enemy_attackers = nav.getVisibleRobots(self, self.enemy_team, [SPECS.CRUSADER, SPECS.PROPHET, SPECS.PREACHER]);
        let enemy_pilgrims = nav.getVisibleRobots(self, self.enemy_team, SPECS.PILGRIM);
        let enemy_castles = nav.getVisibleRobots(self, self.enemy_team, SPECS.CASTLE);
        let enemy_churches = nav.getVisibleRobots(self, self.enemy_team, SPECS.CHURCH);
        let enemy_bases = nav.getVisibleRobots(self, self.enemy_team, [SPECS.CASTLE, SPECS.CHURCH]);
        
        //update churches and castles lists
        let visibleBases = nav.getVisibleRobots(self, self.team, [SPECS.CASTLE, SPECS.CHURCH]);
        for (let i = 0; i < visibleBases.length; i++) {
            let base = visibleBases[i];
            let loc = {x: base.x, y: base.y};
            if (base.unit === SPECS.CASTLE && !castles.some(test => test.x === loc.x && test.y === loc.y)) {
                castles.push(loc);
            } else if (base.unit === SPECS.CHURCH && !churches.some(test => test.x === loc.x && test.y === loc.y)) {
                churches.push(loc);
            }
        }
        
        //update occupied resources
        let visibleObstacleRobots = nav.getVisibleRobots(self, null, [SPECS.CASTLE, SPECS.CHURCH, SPECS.PILGRIM]);
        for (let i = 0; i < visibleObstacleRobots.length; i++) {
            let robot = visibleObstacleRobots[i];
            if (robot.x === self.me.x && robot.y === self.me.y) {
                continue;
            }
            let loc = {x: robot.x, y: robot.y};
            if (self.getKarboniteMap()[loc.y][loc.x] && !occupied_karbonite.some(test => test.x === loc.x && test.y === loc.y)) {
                occupied_karbonite.push(loc);
                //self.log('Karbonite at ' + loc.x + ',' + loc.y + ' is occupied');
            } else if (self.getFuelMap()[loc.y][loc.x] && !occupied_fuel.some(test => test.x === loc.x && test.y === loc.y)) {
                occupied_fuel.push(loc);
                //self.log('Fuel at ' + loc.x + ',' + loc.y + ' is occupied');
            }
        }
        
        //set bases to be an array of all previously seen castles and churches sorted by distance
        let bases = castles.slice(0);
        bases = bases.concat(churches.slice(0));
        bases.sort(nav.getDistanceComparator(self.me));
        
        //start strat
        let base;
        let base_distance;
        let base_direction;
        if (bases.length) {
            base = bases[0];
            base_distance = nav.sqDist(self.me, base);
            base_direction = nav.getDir(self.me, base);
        }
        
        if (nav.exists(base) && self.getVisibleRobotMap()[base.y][base.x] === 0) {
            base = null; //the base died
        }
        if (!nav.exists(base) && castles.length) {
            base = castles[0];
        }
        if (!nav.exists(base) && churches.length) {
            base = churches[0];
        }
        
        //TODO: Better should_deposit logic
        /*
        set deposit_moves = ceil((base_distance-1) / max_movement_range)
        set turns_not_mining = 1 + (2 * deposit_moves)
        set deposit_fuel_cost = (movement_cost * base_distance) + ((fuel_per_mine - mining_fuel_cost) * turns_not_mining)
        set deposit_karbonite_cost = (movement_cost * base_distance) + (karbonite_per_mine * turns_not_mining)
        set should_deposit_karbonite = (team karbonite >= church_karbonite && full_karbonite) 
                                            || (team karbonite < church_karbonite && team karbonite + carried karbonite >= church_karbonite)
        set should_deposit_fuel = (team fuel >= church_fuel && full_fuel) 
                                            || (team fuel < church_fuel && team fuel + carried fuel - deposit_fuel_cost >= church_fuel)
        set should_deposit = should_deposit_karbonite || should_deposit_fuel
        */
        let karbonite_full = self.me.karbonite >= self.specs.KARBONITE_CAPACITY;
        let fuel_full = self.me.fuel >= self.specs.FUEL_CAPACITY;
        let karbonite_low = self.karbonite < BUFFER_RESOURCES.karbonite;
        let fuel_low = self.fuel < BUFFER_RESOURCES.fuel;
        let should_deposit_karbonite = karbonite_full || (karbonite_low && self.karbonite + self.me.karbonite >= BUFFER_RESOURCES.karbonite);
        let should_deposit_fuel = fuel_full || (fuel_low && self.fuel + self.me.fuel >= BUFFER_RESOURCES.fuel);
        let should_deposit = should_deposit_karbonite || should_deposit_fuel;
        let on_karbonite = self.getKarboniteMap()[self.me.y][self.me.x];
        let on_fuel = self.getFuelMap()[self.me.y][self.me.x];
        let on_resource = on_karbonite || on_fuel;
        let action;
        if (should_deposit) {
            if (nav.exists(base)) {
                action = this.deposit(base);
                if (nav.exists(action)) {return action;} //return if depositing
                
                if (base_distance + 1 < self.specs.SPEED) {
                    let deposit_moves = Math.ceil((base_distance - 1) / self.specs.SPEED);
                    let turns_not_mining = 1 + (2 * deposit_moves);
                    let deposit_fuel_cost = ((base_distance*self.specs.FUEL_PER_MOVE)+((SPECS.FUEL_YIELD - SPECS.MINE_FUEL_COST)*turns_not_mining));
                    //let deposit_karbonite_cost = SPECS.KARBONITE_YIELD*turns_not_mining;
                    
                    action = this.moveToward(base, deposit_fuel_cost / turns_not_mining);
                    if (nav.exists(action)) {
                        //self.log('Moving ' + nav.toCompassDir(nav.getDir(self.me, base)) + ' toward base at (' + base.x + ',' + base.y + ')');
                        return action; //return if moving toward base
                    }
                }
            
                if (on_resource && nav.checkResources(self, CHURCH_COSTS)) {
                    action = this.buildChurch();
                    if (nav.exists(action)) {return action;} //return if building a church
                }
            
                action = this.moveToward(base, 2*self.specs.FUEL_PER_MOVE);
                if (nav.exists(action)) {
                    //self.log('Slowly moving ' + nav.toCompassDir(nav.getDir(self.me, base)) + ' toward base at (' + base.x + ',' + base.y + ')');
                    return action; //return if moving toward base
                }
            } else if (on_resource && nav.checkResources(self, CHURCH_COSTS)) {
                action = this.buildChurch();
                if (nav.exists(action)) {return action;} //return if building a church
            }
        }
        
        let karbonites = nav.getKarboniteLocations(self, occupied_karbonite);
        let fuels = nav.getFuelLocations(self, occupied_fuel);
        let closest_resource;
        let closest_karbonite;
        if (!karbonite_full && karbonites.length) {
            closest_karbonite = karbonites[0];
            closest_resource = closest_karbonite;
        }
        let closest_fuel;
        if (!fuel_full && fuels.length) {
            closest_fuel = fuels[0];
            if (!nav.exists(closest_resource) || (self.step > 10 && nav.sqDist(self.me, closest_fuel) < nav.sqDist(self.me, closest_resource))) {
                closest_resource = closest_fuel;
            }
        }
        
        if (nav.exists(closest_resource)) {
            let dist = nav.sqDist(self.me, closest_resource);
            if (dist === 0) {
                if (closest_resource === closest_karbonite && self.me.karbonite === 0) {
                    //self.log('Mining karbonite! Carrying: ' + (self.me.karbonite + SPECS.KARBONITE_YIELD) + '/' + self.specs.KARBONITE_CAPACITY);
                    self.log('Mining karbonite!');
                } else if (closest_resource === closest_fuel && self.me.fuel === 0) {
                    //self.log('Mining fuel! Carrying: ' + (self.me.fuel + SPECS.FUEL_YIELD) + '/' + self.specs.FUEL_CAPACITY);
                    self.log('Mining fuel!');
                }
                return self.mine();
            }
            action = this.moveToward(closest_resource, self.specs.SPEED * self.specs.FUEL_PER_MOVE);
            if (nav.exists(action)) {
                //let dir = nav.toCompassDir(nav.getDir(self.me, closest_resource));
                //let resource_type = (closest_resource === closest_karbonite ? 'karbonite' : 'fuel');
                //self.log('Moving ' + dir + ' toward ' + resource_type + ' at (' + closest_resource.x + ',' + closest_resource.y + ')');
                return action; //return if moving toward a resource
            }
        }
        
        /*
        let target_karbonite = !karbonite_full && (!nav.checkResources(self, TARGET_KARBONITE) || self.karbonite <= self.fuel);
        let target_fuel = !fuel_full && (!nav.checkResources(self, TARGET_FUEL) || self.fuel <= self.karbonite);
        let karbonites = nav.getKarboniteLocations(self, occupied_karbonite);
        let fuels = nav.getFuelLocations(self, occupied_fuel);
        let closest_karbonite;
        if (target_karbonite && karbonites.length) {
            closest_karbonite = karbonites[0];
        }
        let closest_fuel;
        if (target_fuel && fuels.length) {
            closest_fuel = fuels[0];
        }
        let skip_karbonite = nav.exists(closest_karbonite) && nav.exists(closest_fuel) && nav.sqDist(self.me, closest_fuel) > nav.sqDist(self.me, closest_karbonite);
        if (target_karbonite && karbonites.length && !skip_karbonite) {
            let target = karbonites[0];
            if (nav.sqDist(self.me, target) === 0) {
                self.log('Mining karbonite! Carrying: ' + (self.me.karbonite + SPECS.KARBONITE_YIELD) + '/' + self.specs.KARBONITE_CAPACITY);
                return self.mine();
            }
            action = this.moveToward(target, 2*self.specs.FUEL_PER_MOVE);
            if (nav.exists(action)) {
                self.log('Moving ' + nav.toCompassDir(nav.getDir(self.me, target)) + ' toward karbonite at (' + target.x + ',' + target.y + ')');
                return action; //return if moving toward karbonite
            }
        }
        if (target_fuel && fuels.length) {
            let target = fuels[0];
            if (nav.sqDist(self.me, target) === 0) {
                self.log('Mining fuel! Carrying: ' + (self.me.fuel + SPECS.FUEL_YIELD) + '/' + self.specs.FUEL_CAPACITY);
                return self.mine();
            }
            action = this.moveToward(target, 2*self.specs.FUEL_PER_MOVE);
            if (nav.exists(action)) {
                self.log('Moving ' + nav.toCompassDir(nav.getDir(self.me, target)) + ' toward fuel at (' + target.x + ',' + target.y + ')');
                return action; //return if moving toward fuel
            }
        }
        //*/
        
        /*
        store occupied_karbonite as all locations with a karbonite and a visible pilgrim
        store occupied_fuel as all locations with a fuel and a visible pilgrim
        determine if should target fuel or karbonite, heuristic needs to target karbonite in very early game
        if targeting karbonite:
            set direction = toward closest karbonite location not in the occupied_karbonite list
        else: //targeting fuel
            set direction = toward closest fuel location not in the occupied_fuel list
        */
        
        
        /*
        let church_karbonite = SPECS['UNITS'][SPECS.CHURCH].CONSTRUCTION_KARBONITE;
        let church_fuel = SPECS['UNITS'][SPECS.CHURCH].CONSTRUCTION_FUEL;
        let church_resources = {karbonite: church_karbonite, fuel: church_fuel};

        let step = self.step;
        let enemy_team = (self.team == 0 ? 1 : 0);
        let closestBases = nav.getVisibleRobots(self, self.team, [SPECS.CASTLE, SPECS.CHURCH]);
        let closestKarbonite = nav.findClosestPassableKarbonite(self);
        let closestKarboniteDistance = -1;
        let closestFuel = nav.findClosestPassableFuel(self);
        let closestFuelDistance = -1;
        let closestEnemies = nav.getVisibleRobots(self, enemy_team, [SPECS.CRUSADER, SPECS.PROPHET, SPECS.PREACHER]);
        let more_karbonite = self.karbonite > self.fuel;
        let more_fuel = self.fuel >= self.karbonite;
        let near_wanted_resource = false;
        let visible_wanted_resource = false;
        let has_karbonite = self.me.karbonite;
        let has_fuel = self.me.fuel;
        let has_resources = has_karbonite || has_fuel;
        let karbonite_full = self.me.karbonite >= self.specs.KARBONITE_CAPACITY;
        let fuel_full = self.me.fuel >= self.specs.FUEL_CAPACITY;
        let on_karbonite = self.getKarboniteMap()[self.me.y][self.me.x];
        let on_fuel = self.getFuelMap()[self.me.y][self.me.x];
        let on_resource = on_karbonite || on_fuel;
        let on_wanted_resource = (more_karbonite ? on_fuel : on_karbonite);
        let has_base = false;
        let at_base = false;
        let near_base = false;
        let lacking_karbonite = !nav.checkResources(self, BUFFER_RESOURCES.karbonite, 0);
        let lacking_fuel = !nav.checkResources(self, 0, BUFFER_RESOURCES.fuel);
        
        if (nav.exists(closestBases) && closestBases.length) {
            has_base = true;
            let closest = closestBases[0];
            let distance = nav.sqDist(self.me, closest);
            if (distance < 2**2) {
                at_base = true;
            }
            if (distance <= 4**2) {
                near_base = true;
            }
            let compassDir = nav.toCompassDir(nav.getDir(self.me, closest));
            //self.log('Closest base: ' + closest.x + ',' + closest.y + ' is ' + distance + ' to the ' + compassDir);
        }
        if (nav.exists(closestKarbonite) && closestKarbonite.length) {
            let closest = closestKarbonite[0];
            let distance = nav.sqDist(self.me, closest);
            closestKarboniteDistance = distance;
            if (distance <= 5**2 && more_fuel) {
                near_wanted_resource = true;
            }
            if (self.getVisibleRobotMap()[closest.y][closest.x] > -1 && more_fuel) {
                visible_wanted_resource = true;
            }
            let compassDir = nav.toCompassDir(nav.getDir(self.me, closest));
            //self.log('Closest karbonite: ' + closest.x + ',' + closest.y + ' is ' + distance + ' to the ' + compassDir);
        }
        if (nav.exists(closestFuel) && closestFuel.length) {
            let closest = closestFuel[0];
            let distance = nav.sqDist(self.me, closest);
            closestFuelDistance = distance;
            if (distance <= 3**2 && more_karbonite) {
                near_wanted_resource = true;
            }
            if (self.getVisibleRobotMap()[closest.y][closest.x] > -1 && more_karbonite) {
                visible_wanted_resource = true;
            }
            let compassDir = nav.toCompassDir(nav.getDir(self.me, closest));
            //self.log('Closest fuel: ' + closest.x + ',' + closest.y + ' is ' + distance + ' to the ' + compassDir);
        }
        
        if (nav.exists(closestBases) && closestBases.length && at_base && (karbonite_full || fuel_full)) {
            let baseDir = nav.getDir(self.me, closestBases[0]);
            let give_report = self.me.karbonite + ' karbonite and ' + self.me.fuel + ' fuel';
            let resource_report = self.karbonite + ' karbonite and ' + self.fuel + ' fuel';
            self.log('Giving ' + give_report + ' to base to the ' + nav.toCompassDir(baseDir));
            self.log('Total resources: ' + resource_report);
            return self.give(baseDir.x, baseDir.y, self.me.karbonite, self.me.fuel);
        }
        if (on_fuel && !fuel_full) {
            if (self.me.fuel == 0) {
                self.log('Mining fuel');
            }
            return self.mine();
        }
        if (on_karbonite && !karbonite_full) {
            if (self.me.karbonite == 0) {
                self.log('Mining karbonite');
            }
            return self.mine();
        }
        if (!near_base && nav.checkResources(self, church_resources)) {
            if (on_wanted_resource || (on_fuel && lacking_fuel) || (on_karbonite && lacking_karbonite)) {
                let buildDir = nav.randomValidDir(self);
                if (nav.exists(buildDir)) {
                    self.log('Building church to the ' + nav.toCompassDir(nav.getDir(self.me, buildDir)));
                    return self.buildUnit(SPECS.CHURCH, buildDir.x, buildDir.y);
                }
            }
        }
        
        if (nav.exists(dir) && nav.isPassable(self, nav.applyDir(self.me, dir))
                && !visible_wanted_resource && !has_base && !on_resource) {
            self.log('Continuing in the previous direction, ' + nav.toCompassDir(dir));
            return self.move(dir.x, dir.y);
        }
        
        let oldDir = dir;
        if (nav.exists(closestBases) && closestBases.length && has_resources && near_base) {
            dir = nav.getDir(self.me, closestBases[0]);
            if (nav.exists(dir) && dir != oldDir) {
                self.log('Targeting base to the ' + nav.toCompassDir(dir));
            }
        } else if (!has_resources && !lacking_fuel && (near_wanted_resource || lacking_karbonite)) {
            //todo: teleport
            if ((more_karbonite || lacking_fuel) && nav.exists(closestFuel) && closestFuel.length) {
                dir = nav.getDir(self.me, closestFuel[0]);
                if (nav.exists(dir) && dir != oldDir) {
                    self.log('More karbonite. Targeting nearby fuel to the ' + nav.toCompassDir(dir));
                }
            } else if ((more_fuel || lacking_karbonite) && nav.exists(closestKarbonite) && closestKarbonite.length) {
                dir = nav.getDir(self.me, closestKarbonite[0]);
                if (nav.exists(dir) && dir != oldDir) {
                    self.log('More fuel. Targeting nearby karbonite to the ' + nav.toCompassDir(dir));
                }
            }
        } else if ((more_karbonite || lacking_fuel) && nav.exists(closestFuel) && closestFuel.length) {
            dir = nav.getDir(self.me, closestFuel[0]);
            if (nav.exists(dir) && dir != oldDir) {
                self.log('More karbonite. Targeting fuel to the ' + nav.toCompassDir(dir));
            }
        } else if ((more_fuel || lacking_karbonite) && nav.exists(closestKarbonite) && closestKarbonite.length) {
            dir = nav.getDir(self.me, closestKarbonite[0]);
            if (nav.exists(dir) && dir != oldDir) {
                self.log('More fuel. Targeting karbonite to the ' + nav.toCompassDir(dir));
            }
        }
        if (nav.exists(dir) && !nav.isPassable(self, nav.applyDir(self.me, dir))) {
            self.log('Chosen direction is not passable. Clearing direction.');
            dir = null;
        }
        if (!nav.exists(dir)) {
            dir = nav.randomValidDir(self);
            if (nav.exists(dir)) {
                self.log('Picking random direction: ' + nav.toCompassDir(dir));
            }
        }
        if (nav.exists(dir)) {
            return self.move(dir.x, dir.y);
        } else {
            self.log('No valid dirs');
        }
        //*/
    }
    
    deposit(base) {
        let me = this.self.me;
        if (nav.exists(base) && (me.karbonite || me.fuel) && nav.sqDist(me, base) < 2**2) {
            let give_report = 'Depositing ';
            if (me.karbonite && me.fuel) {
                give_report += me.karbonite + ' karbonite and ' + me.fuel + ' fuel';
            } else if (me.karbonite) {
                give_report += me.karbonite + ' karbonite';
            } else {
                give_report += me.fuel + ' fuel';
            }
            let resource_report = (this.self.karbonite + me.karbonite) + ' karbonite and ' + (this.self.fuel + me.fuel) + ' fuel';
            let base_dir = nav.getDir(me, base);
            //this.self.log(give_report + ' to the ' + nav.toCompassDir(base_dir) + '. ' + 'Total resources: ' + resource_report);
            this.self.log(give_report + '. Total resources: ' + resource_report);
            return this.self.give(base_dir.x, base_dir.y, me.karbonite, me.fuel);
        }
    }
    
    buildChurch() {
        let dir = nav.getRandomValidDir(this.self);
        if (nav.exists(dir) && nav.canBuild(this.self, SPECS.CHURCH, dir)) {
            this.self.log('Building church to the ' + nav.toCompassDir(dir));
            return this.self.buildUnit(SPECS.CHURCH, dir.x, dir.y);
        }
    }
    
    moveToward(loc, max_fuel = this.self.specs.SPEED * SPECS.FUEL_PER_MOVE) {
        //TODO: jump to farthest location costing less than max_fuel
        let movement_locations = this.calculateMovementLocations(Math.max(this.self.fuel, max_fuel));
        if (movement_locations.length) {
            movement_locations.sort(nav.getDistanceComparator(loc));
            return this.self.move(movement_locations[0].x - this.self.me.x, movement_locations[0].y - this.self.me.y);
        }
    }
    
    calculateMovementLocations(max_fuel = this.self.specs.SPEED * SPECS.FUEL_PER_MOVE) {
        //this.self.log('calling calculateMovementLocations with max_fuel: ' + max_fuel);
        let movement_locations = [];
        let locations = this.calculateLocationsWithinRadius(this.self.me, Math.min(this.self.specs.SPEED, max_fuel / this.self.specs.FUEL_PER_MOVE));
        for (let i = 0; i < locations.length; i++) {
            let {x, y} = locations[i];
            //this.self.log('calculated location: ' + x + ',' + y);
            if (this.self.getVisibleRobotMap()[y][x] > -1 && nav.isPassable(this.self, locations[i])) {
                movement_locations.push(locations[i]);
            }
        }
        //this.self.log('movement locations from ' + this.self.me.x + ',' + this.self.me.y + ' costing less than ' + max_fuel + ' fuel:');
        return movement_locations;
    }
    
    calculateLocationsWithinRadius(from = this.self.me, radius = this.self.specs.SPEED) { //inclusive on radius
        //this.self.log('calling calculateMovementLocations with from: ' + from.x + ',' + from.y + ' and radius: ' + radius);
        let locations = [];
        if (radius > 0) {
            for (let col = 0; col < this.self.getPassableMap().length; col++) {
                for (let row = 0; row < this.self.getPassableMap()[col].length; row++) {
                    let test = {x: row, y: col};
                    //this.self.log('testing location: ' + test.x + ',' + test.y);
                    if (this.self.getPassableMap()[col][row] && nav.sqDist(from, test) <= radius) {
                        locations.push(test);
                    }
                }
            }
        }
        return locations;
    }
}

const pilgrim = new Pilgrim();
export default pilgrim;