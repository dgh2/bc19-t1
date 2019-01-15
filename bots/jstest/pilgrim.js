import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const pilgrim = {};
var dir;

pilgrim.turn = (self) => {
    //self.log("Health: " + self.me.health);
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
    let has_karbonite = self.me.karbonite;
    let has_fuel = self.me.fuel;
    let has_resources = has_karbonite || has_fuel;
    let karbonite_full = self.me.karbonite >= self.specs.KARBONITE_CAPACITY;
    let fuel_full = self.me.fuel >= self.specs.FUEL_CAPACITY;
    let on_karbonite = self.getKarboniteMap()[self.me.y][self.me.x];
    let on_fuel = self.getFuelMap()[self.me.y][self.me.x];
    let on_wanted_resource = (more_karbonite ? on_fuel : on_karbonite);
    let on_resource = on_karbonite || on_fuel;
    let has_base = false;
    let at_base = false;
    let near_base = false;
    
    if (nav.exists(dir) && !nav.isPassable(self, nav.applyDir(self.me, dir))) {
        dir = null;
    }
    
    if (nav.exists(closestBases) && closestBases.length) {
        has_base = true;
        let closestBase = closestBases[0];
        let distance = nav.sqDist(self.me, closestBase);
        if (distance < 2**2) {
            at_base = true;
        }
        if (distance <= 4**2) {
            near_base = true;
        }
        let compassDir = nav.toCompassDir(nav.getDir(self.me, closestBase));
        self.log("Closest base: " + closestBase.x + "," + closestBase.y + " is " + distance + " to the " + compassDir);
    }
    if (nav.exists(closestKarbonite)) {
        let distance = nav.sqDist(self.me, closestKarbonite);
        closestKarboniteDistance = distance;
        if (distance <= 3**2 && more_fuel) {
            near_wanted_resource = true;
        }
        let compassDir = nav.toCompassDir(nav.getDir(self.me, closestKarbonite));
        self.log("Closest karbonite: " + closestKarbonite.x + "," + closestKarbonite.y + " is " + distance + " to the " + compassDir);
    }
    if (nav.exists(closestFuel)) {
        let distance = nav.sqDist(self.me, closestFuel);
        closestFuelDistance = distance;
        if (distance <= 3**2 && more_karbonite) {
            near_wanted_resource = true;
        }
        let compassDir = nav.toCompassDir(nav.getDir(self.me, closestFuel));
        self.log("Closest fuel: " + closestFuel.x + "," + closestFuel.y + " is " + distance + " to the " + compassDir);
    }
    
    if (nav.exists(closestBases) && closestBases.length && at_base && (karbonite_full || fuel_full)) {
        let baseDir = nav.getDir(self.me, closestBases[0]);
        return self.give(baseDir.x, baseDir.y, self.me.karbonite, self.me.fuel);
    }
    if (on_fuel && !fuel_full) {
        return self.mine();
    }
    if (on_karbonite && !karbonite_full) {
        return self.mine();
    }
    if (on_wanted_resource && !near_base) {
        buildDir = nav.randomValidDir(self);
        if (nav.exists(buildDir)) {
            dir = null;
            return self.build(SPECS.CHURCH, ...buildDir);
        }
    }
    if (has_resources && near_base) {
        dir = nav.getDir(self.me, closestBases[0]);
    } else if (!has_resources && near_wanted_resource) {
        //todo: teleport
        if (more_karbonite) {
          dir = nav.getDir(self.me, closestFuel);
        } else {
          dir = nav.getDir(self.me, closestKarbonite);
        }
    } else if (more_karbonite) {
        dir = nav.getDir(self.me, closestFuel);
    } else if (more_fuel) {
        dir = nav.getDir(self.me, closestKarbonite);
    }
    if (nav.exists(dir) && !nav.isPassable(self, nav.applyDir(self.me, dir))) {
        dir = null;
    }
    if (!nav.exists(dir)) {
        dir = nav.randomValidDir(self);
    }
    if (!nav.exists(dir)) {
        self.log("No valid dirs");
        return;
    }
    return self.move(dir.x, dir.y);
}

export default pilgrim;

/*
church_cost = (SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_FUEL)
            pilgrim_cost = (SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_FUEL)
            crusader_cost = (SPECS['UNITS'][SPECS['CRUSADER']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CRUSADER']].CONSTRUCTION_FUEL)
            prophet_cost = (SPECS['UNITS'][SPECS['PROPHET']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PROPHET']].CONSTRUCTION_FUEL)
            preacher_cost = (SPECS['UNITS'][SPECS['PREACHER']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PREACHER']].CONSTRUCTION_FUEL)
*/