import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const MEMORY = 15;

var dir;
var castles = [];
var churches = [];
var occupied_karbonite = [];
var occupied_fuel = [];

class Pilgrim {
    turn(self) {
        //*
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
        let enemy_team = (self.team == 0 ? 1 : 0);
        let enemy_attackers = nav.getVisibleRobots(self, enemy_team, [SPECS.CRUSADER, SPECS.PROPHET, SPECS.PREACHER]);
        let enemy_pilgrims = nav.getVisibleRobots(self, enemy_team, SPECS.PILGRIM);
        let enemy_castles = nav.getVisibleRobots(self, enemy_team, SPECS.CASTLE);
        let enemy_churches = nav.getVisibleRobots(self, enemy_team, SPECS.CHURCH);
        let enemy_bases = nav.getVisibleRobots(self, enemy_team, [SPECS.CASTLE, SPECS.CHURCH]);
        
        //update churches and castles lists
        let visibleBases = nav.getVisibleRobots(self, self.team, [SPECS.CASTLE, SPECS.CHURCH]);
        for (let i = 0; i < visibleBases.length; i++) {
            let base = visibleBases[i];
            let loc = {x: base.x, y: base.y};
            if (base.unit === SPECS.CASTLE && !castles.includes(loc)) {
                castles.push(loc);
            } else if (base.unit === SPECS.CHURCH && !churches.includes(loc)) {
                churches.push(loc);
            }
        }
        
        //update occupied resources
        let visibleObstacleRobots = nav.getVisibleRobots(self, null, [SPECS.CASTLE, SPECS.CHURCH, SPECS.PILGRIM]);
        for (let i = 0; i < visibleObstacleRobots.length; i++) {
            let robot = visibleObstacleRobots[i];
            let loc = {x: robot.x, y: robot.y};
            if (self.getKarboniteMap()[loc.y][loc.x] && !occupied_karbonite.includes(loc)) {
                occupied_karbonite.push(loc);
            } else if (self.getFuelMap()[loc.y][loc.x] && !castles.includes(loc)) {
                occupied_fuel.push(loc);
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
        
        //*/
        
        /*
        base_distance = null
        if home_castle exists and home_castle location visible and not occupied:
            home_castle = null
        if first turn or no home_castle:
            home_castle = closest visible castle
        base = closest visible castle or church
        if no base:
            base = home_castle
        if base exists:
            base_distance = distance from self.me to base
        set deposit_moves = ceiling((base_distance-1) / max_movement_range)
        set num_turns_not_mining = 1 + (2 * deposit_moves)
        set deposit_fuel_cost = (movement_cost * base_distance) + ((fuel_per_mine - mining_fuel_cost) * num_turns_not_mining)
        set deposit_karbonite_cost = (movement_cost * base_distance) + (karbonite_per_mine * num_turns_not_mining)
        set should_deposit_karbonite = (team karbonite >= church_karbonite && full_karbonite) 
                                            || (team karbonite < church_karbonite && team karbonite + carried karbonite >= church_karbonite)
        set should_deposit_fuel = (team fuel >= church_fuel && full_fuel) 
                                            || (team fuel < church_fuel && team fuel + carried fuel - deposit_fuel_cost >= church_fuel)
        set should_deposit = should_deposit_karbonite || should_deposit_fuel
        if should_deposit:
            if adjacent to base:
                deposit to base
            if near base and team fuel > deposit_fuel_cost:
                teleport to base
            else if hasResources(church_cost):
                find valid direction not on a resource:
                    build church there
            else:
                walk slowly toward base



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
        let enemyTeam = (self.team == 0 ? 1 : 0);
        let closestBases = nav.getVisibleRobots(self, self.team, [SPECS.CASTLE, SPECS.CHURCH]);
        let closestKarbonite = nav.findClosestPassableKarbonite(self);
        let closestKarboniteDistance = -1;
        let closestFuel = nav.findClosestPassableFuel(self);
        let closestFuelDistance = -1;
        let closestEnemies = nav.getVisibleRobots(self, enemyTeam, [SPECS.CRUSADER, SPECS.PROPHET, SPECS.PREACHER]);
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
        let lacking_karbonite = !nav.checkResources(self, 2*church_karbonite, 0);
        let lacking_fuel = !nav.checkResources(self, 0, 2*church_fuel);
        
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
            //self.log("Closest base: " + closest.x + "," + closest.y + " is " + distance + " to the " + compassDir);
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
            //self.log("Closest karbonite: " + closest.x + "," + closest.y + " is " + distance + " to the " + compassDir);
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
            //self.log("Closest fuel: " + closest.x + "," + closest.y + " is " + distance + " to the " + compassDir);
        }
        
        if (nav.exists(closestBases) && closestBases.length && at_base && (karbonite_full || fuel_full)) {
            let baseDir = nav.getDir(self.me, closestBases[0]);
            let giveReport = self.me.karbonite + " karbonite and " + self.me.fuel + " fuel";
            let resourceReport = self.karbonite + " karbonite and " + self.fuel + " fuel";
            self.log("Giving " + giveReport + " to base to the " + nav.toCompassDir(baseDir));
            self.log("Total resources: " + resourceReport);
            return self.give(baseDir.x, baseDir.y, self.me.karbonite, self.me.fuel);
        }
        if (on_fuel && !fuel_full) {
            if (self.me.fuel == 0) {
                self.log("Mining fuel");
            }
            return self.mine();
        }
        if (on_karbonite && !karbonite_full) {
            if (self.me.karbonite == 0) {
                self.log("Mining karbonite");
            }
            return self.mine();
        }
        if (!near_base && nav.checkResources(self, church_resources)) {
            if (on_wanted_resource || (on_fuel && lacking_fuel) || (on_karbonite && lacking_karbonite)) {
                let buildDir = nav.randomValidDir(self);
                if (nav.exists(buildDir)) {
                    self.log("Building church to the " + nav.toCompassDir(nav.getDir(self.me, buildDir)));
                    return self.buildUnit(SPECS.CHURCH, buildDir.x, buildDir.y);
                }
            }
        }
        
        if (nav.exists(dir) && nav.isPassable(self, nav.applyDir(self.me, dir))
                && !visible_wanted_resource && !has_base && !on_resource) {
            self.log("Continuing in the previous direction, " + nav.toCompassDir(dir));
            return self.move(dir.x, dir.y);
        }
        
        let oldDir = dir;
        if (nav.exists(closestBases) && closestBases.length && has_resources && near_base) {
            dir = nav.getDir(self.me, closestBases[0]);
            if (nav.exists(dir) && dir != oldDir) {
                self.log("Targeting base to the " + nav.toCompassDir(dir));
            }
        } else if (!has_resources && !lacking_fuel && (near_wanted_resource || lacking_karbonite)) {
            //todo: teleport
            if ((more_karbonite || lacking_fuel) && nav.exists(closestFuel) && closestFuel.length) {
                dir = nav.getDir(self.me, closestFuel[0]);
                if (nav.exists(dir) && dir != oldDir) {
                    self.log("More karbonite. Targeting nearby fuel to the " + nav.toCompassDir(dir));
                }
            } else if ((more_fuel || lacking_karbonite) && nav.exists(closestKarbonite) && closestKarbonite.length) {
                dir = nav.getDir(self.me, closestKarbonite[0]);
                if (nav.exists(dir) && dir != oldDir) {
                    self.log("More fuel. Targeting nearby karbonite to the " + nav.toCompassDir(dir));
                }
            }
        } else if ((more_karbonite || lacking_fuel) && nav.exists(closestFuel) && closestFuel.length) {
            dir = nav.getDir(self.me, closestFuel[0]);
            if (nav.exists(dir) && dir != oldDir) {
                self.log("More karbonite. Targeting fuel to the " + nav.toCompassDir(dir));
            }
        } else if ((more_fuel || lacking_karbonite) && nav.exists(closestKarbonite) && closestKarbonite.length) {
            dir = nav.getDir(self.me, closestKarbonite[0]);
            if (nav.exists(dir) && dir != oldDir) {
                self.log("More fuel. Targeting karbonite to the " + nav.toCompassDir(dir));
            }
        }
        if (nav.exists(dir) && !nav.isPassable(self, nav.applyDir(self.me, dir))) {
            self.log("Chosen direction is not passable. Clearing direction.");
            dir = null;
        }
        if (!nav.exists(dir)) {
            dir = nav.randomValidDir(self);
            if (nav.exists(dir)) {
                self.log("Picking random direction: " + nav.toCompassDir(dir));
            }
        }
        if (nav.exists(dir)) {
            return self.move(dir.x, dir.y);
        } else {
            self.log("No valid dirs");
        }
        //*/
    }
}

const pilgrim = new Pilgrim();
export default pilgrim;