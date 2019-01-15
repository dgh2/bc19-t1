import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const castle = {};
var dir = null;

castle.turn = (self) => {
    self.log("Health: " + self.me.health);
    let step = self.step;
    self.log("step: " + step);
    let enemyTeam = (self.team == 0 ? 1 : 0);
    let closestKarbonite = nav.findClosestKarbonite(self);
    let closestFuel = nav.findClosestFuel(self);
    if (nav.exists(closestKarbonite)) {
        let distance = nav.sqDist(self.me, closestKarbonite);
        let compassDir = nav.toCompassDir(nav.getDir(self.me, closestKarbonite));
        self.log("Closest karbonite: " + closestKarbonite.x + "," + closestKarbonite.y + " is " + distance + " to the " + compassDir);
    }
    if (nav.exists(closestFuel)) {
        let distance = nav.sqDist(self.me, closestFuel);
        let compassDir = nav.toCompassDir(nav.getDir(self.me, closestFuel));
        self.log("Closest fuel: " + closestFuel.x + "," + closestFuel.y + " is " + distance + " to the " + compassDir);
    }
    dir = nav.randomValidDir(self);
    if (dir === null) {
        self.log("No valid directions");
        return;
    }
    var loc = {x: self.me.x + dir.x, y: self.me.y + dir.y};
    if (step <= 1000) { //(step % 10 === 0)
        dir = nav.randomValidDir(self);
        if (nav.canBuild(self,SPECS.PILGRIM,dir)) {
          self.log("Building a pilgrim at " + loc.x + "," + loc.y);
          return self.buildUnit(SPECS.PILGRIM, dir.x, dir.y);
        } 
        else {
          self.log("Can't Build here, it's BAT COUNTRY!");
        }
    } else if (step % 12 === 0) {
        dir = nav.randomValidDir(self);
        self.log("Building a crusader at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.CRUSADER, dir.x, dir.y);
    } else if (step % 15 === 0) {
        dir = nav.randomValidDir(self);
        self.log("Building a prophet at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.PROPHET, dir.x, dir.y);
    } else if (step % 19 === 0) {
        dir = nav.randomValidDir(self);
        self.log("Building a preacher at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.PREACHER, dir.x, dir.y);
    }
}

export default castle;