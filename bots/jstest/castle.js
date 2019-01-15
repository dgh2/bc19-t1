import {BCAbstractRobot, SPECS} from 'battlecode';
import nav from './nav.js';

const castle = {};
var dir = null;

castle.turn = (self) => {
    //self.log("Health: " + self.me.health);
    let step = self.step;
    //self.log("step: " + step);
    let enemyTeam = (self.team == 0 ? 1 : 0);
    let closestKarbonite = nav.findClosestKarbonite(self);
    let closestFuel = nav.findClosestFuel(self);
    if (nav.exists(closestKarbonite)) {
        let distance = nav.sqDist(self.me, closestKarbonite);
        let compassDir = nav.toCompassDir(nav.getDir(self.me, closestKarbonite));
        //self.log("Closest karbonite: " + closestKarbonite.x + "," + closestKarbonite.y + " is " + distance + " to the " + compassDir);
    }
    if (nav.exists(closestFuel)) {
        let distance = nav.sqDist(self.me, closestFuel);
        let compassDir = nav.toCompassDir(nav.getDir(self.me, closestFuel));
        //self.log("Closest fuel: " + closestFuel.x + "," + closestFuel.y + " is " + distance + " to the " + compassDir);
    }
    dir = nav.randomValidDir(self);
    if (dir === null) {
        self.log("No valid directions");
        return;
    }
    let oldDir = dir;
    var loc = {x: self.me.x + dir.x, y: self.me.y + dir.y};
    if (step <= 10 || step % 10 === 0) { //(step % 10 === 0)
        if (nav.canBuild(self,SPECS.PILGRIM,oldDir)) {
          dir = nav.randomValidDir(self);
          self.log("Building a pilgrim at " + loc.x + "," + loc.y);
          return self.buildUnit(SPECS.PILGRIM, oldDir.x, oldDir.y);
        } 
        else {
          self.log("Can't Build here, it's BAT COUNTRY!");
        }
    } else if (step % 12 === 0) {
      if (nav.canBuild(self,SPECS.CRUSADER,oldDir)) {
        dir = nav.randomValidDir(self);
        self.log("Building a crusader at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.CRUSADER, oldDir.x, oldDir.y);
      }
    } else if (step % 15 === 0) {
      if (nav.canBuild(self,SPECS.PROPHET,oldDir)) {
        dir = nav.randomValidDir(self);
        self.log("Building a prophet at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.PROPHET, oldDir.x, oldDir.y);
      }
    } else if (step % 19 === 0) {
      if (nav.canBuild(self,SPECS.PREACHER,oldDir)) {
        dir = nav.randomValidDir(self);
        self.log("Building a preacher at " + loc.x + "," + loc.y);
        return self.buildUnit(SPECS.PREACHER, oldDir.x, oldDir.y);
      }
    }
}

export default castle;