import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const pilgrim = {};
var dir;

pilgrim.turn = (self) => {
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
        if (distance <= 3**2 && more_fuel) {
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
        let lacking_karconite = !nav.checkResources(self, 2*church_karbonite, 0);
        let lacking_fuel = !nav.checkResources(self, 0, 2*church_fuel);
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
    } else if (!has_resources && near_wanted_resource) {
        //todo: teleport
       if (more_karbonite && nav.exists(closestFuel) && closestFuel.length) {
            dir = nav.getDir(self.me, closestFuel[0]);
            if (nav.exists(dir) && dir != oldDir) {
                self.log("More karbonite. Targeting nearby fuel to the " + nav.toCompassDir(dir));
            }
        } else if (nav.exists(closestKarbonite) && closestKarbonite.length) {
            dir = nav.getDir(self.me, closestKarbonite[0]);
            if (nav.exists(dir) && dir != oldDir) {
                self.log("More fuel. Targeting nearby karbonite to the " + nav.toCompassDir(dir));
            }
        }
    } else if (more_karbonite && nav.exists(closestFuel) && closestFuel.length) {
        dir = nav.getDir(self.me, closestFuel[0]);
        if (nav.exists(dir) && dir != oldDir) {
            self.log("More karbonite. Targeting fuel to the " + nav.toCompassDir(dir));
        }
    } else if (nav.exists(closestKarbonite) && closestKarbonite.length) {
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
}

export default pilgrim;