import {SPECS} from 'battlecode';

const COMPASS = [
    ['NW', 'N', 'NE'],
    ['W', 'C', 'E'],
    ['SW', 'S', 'SE'],
];

const COMPASS_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

const COMPASS_TO_DIR = {
    'N': {x: 0, y: -1},
    'NE': {x: 1, y: -1},
    'NW': {x: -1, y: -1},
    'E': {x: 1, y: 0},
    'W': {x: -1, y: 0},
    'S': {x: 0, y: 1},
    'SE': {x: 1, y: 1},
    'SW': {x: -1, y: 1},
};

class Nav {
    exists(variable) {
        return !(typeof variable === 'undefined' || variable === null);
    }

    getRandomCompassDirs() { //Get a list of all random compass directions ['W', 'NE', 'S', ...]
        //Fisher-Yates Shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
        let dirs = COMPASS_DIRS.slice(0); //get a copy of the const directions array
        for (let i = dirs.length - 1; i > 0; i--) { //iterate in reverse to simplify indices used
            let ri = Math.floor(Math.random() * (i + 1)); //pick a random index less than or equal to the current index
            [dirs[i], dirs[ri]] = [dirs[ri], dirs[i]]; //swap the direction values at indices ri and i
        }
        return dirs;
    };
    
    toCompassDir(coordinateDir) { //convert coordinate dir like {x: -1, y: -1} into compass dir like 'NW'
        if (this.exists(coordinateDir)) {
            return COMPASS[coordinateDir.y + 1][coordinateDir.x + 1];
        }
    }
    
    toDir(compassDir) { //convert compass dir like 'NW' into coordinate dir like {x: -1, y: -1}
        if (this.exists(compassDir)) {
            return COMPASS_TO_DIR[compassDir];
        }
    }

    getRandomCompassDir() { //Get random compass direction like 'N', 'NE', 'E', ...
        return COMPASS_DIRS[Math.floor(Math.random() * COMPASS_DIRS.length)];
    }

    getRandomDir() { //Get random coordinate direction like {x: -1, y: -1}, {x: 0, y: -1}, ...
        return this.toDir(this.getRandomCompassDir());
    }

    getRandomValidDir(self, avoid_resources = true, prefer_karbonite = true, prefer_fuel = false) {
        let choice;
        let randomCompassDirs = this.getRandomCompassDirs();
        for (let i = 0; i < randomCompassDirs.length; i++) {
            /*
            let check_dir = this.toDir(randomCompassDirs[i]);
            let check_loc = this.applyDir(self.me, check_dir);
            if (this.isPassable(self, check_loc)) {
                return check_dir;
            //*/
            //*
            let random_dir = this.toDir(randomCompassDirs[i]);
            let loc = this.applyDir(self.me, random_dir);
            if (this.isPassable(self, loc)) {
                return random_dir;
                
                let random_dir_karbonite = self.getKarboniteMap()[loc.y][loc.x];
                let random_dir_fuel = self.getFuelMap()[loc.y][loc.x];
                if (avoid_resources && !random_dir_karbonite && !random_dir_fuel) {
                    return random_dir;
                } else if (!avoid_resources && prefer_karbonite && random_dir_karbonite) {
                    return random_dir;
                } else if (!avoid_resources && prefer_fuel && random_dir_fuel) {
                    return random_dir;
                }
                
                if (!nav.exists(choice)) {
                    choice = random_dir;
                } else {
                    let choice_loc = this.applyDir(self.me, choice);
                    let choice_karbonite = self.getKarboniteMap()[choice_loc.y][choice_loc.x];
                    let choice_fuel = self.getFuelMap()[choice_loc.y][choice_loc.x];
                    let overwrite_karbonite = (avoid_resources && choice_karbonite && !random_dir_karbonite) 
                                                  || (!avoid_resources && prefer_karbonite && !choice_karbonite && random_dir_karbonite);
                    let overwrite_fuel = (avoid_resources && choice_fuel && !random_dir_fuel) 
                                              || (!avoid_resources && prefer_fuel && !choice_fuel && random_dir_fuel);
                    if (overwrite_karbonite || overwrite_fuel) {
                        choice = random_dir;
                    }
                }
                //*/
            }
        }
        return choice;
    }

    rotate(coordinateDir, amount) {
        amount = amount % COMPASS_DIRS.length;
        if (amount < 0) {
            amount = amount + COMPASS_DIRS.length 
        }
        let compassDir = this.toCompassDir(coordinateDir);
        let index = COMPASS_DIRS.indexOf(compassDir);
        let rotateCompassDir = COMPASS_DIRS[(index + amount) % COMPASS_DIRS.length];
        return this.toDir(rotateCompassDir);
    }

    reflect(loc, fullMap, isHorizontalReflection) {
        const mapLen = fullMap.length;
        const hReflect = {
            x: loc.x,
            y: mapLen - loc.y,
        };
        const vReflect = {
            x: mapLen - loc.y,
            y: loc.y,
        };

        if (isHorizontalReflection) {
            return fullMap[hReflect.y][hReflect.x] ? hReflect : vReflect;
        } else {
            return fullMap[vReflect.y][vReflect.x] ? vReflect : hReflect;
        }
    }

    getDir(start, target) {
        const newDir = {
            x: target.x - start.x,
            y: target.y - start.y,
        };

        if (newDir.x < 0) {
            newDir.x = -1;
        } else if (newDir.x > 0) {
            newDir.x = 1;
        }

        if (newDir.y < 0) {
            newDir.y = -1;
        } else if (newDir.y > 0) {
            newDir.y = 1;
        }

        return newDir;
    }

    isPassable(self, loc) { //{x:self.x , y:self.y} passed in as the variable loc
        const {x, y} = loc;
        const passableMap = self.getPassableMap();
        const robotMap = self.getVisibleRobotMap();
        if (x < 0 || x >= passableMap.length) {
            return false; //loc out of x bounds
        }
        if (y < 0 || y >= passableMap.length) {
            return false; //loc out of y bounds
        }
        if (!passableMap[y][x]) {
            return false; //loc occupied or not passable
        }
        if (robotMap[y][x] > 0) {
            return false; //loc occupied or not passable
        }
        return true;
    }

    applyDir(loc, dir) {
        return {
            x: loc.x + dir.x,
            y: loc.y + dir.y,
        };
    }

/*
    goto (self, loc, destination, fullMap, robotMap) {
        let goalDir = this.getDir(loc, destination);
        if (goalDir.x === 0 && goalDir.y === 0) {
            return goalDir;
        }
        let tryDir = 0;
        while (!this.isPassable(self, this.applyDir(loc, goalDir), fullMap, robotMap) && tryDir < 8) {
            goalDir = this.rotate(goalDir, 1);
            tryDir++;
        }
        return goalDir;
    }
*/

    sqDist(start, end) {
        return Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2);
    }

    getDistanceComparator(me) {
        let self = this; 
        return function(a, b) {
            let aDist = self.sqDist(me, a);
            let bDist = self.sqDist(me, b);
            if (aDist < bDist) {
                return -1;
            }
            if (aDist > bDist) {
                return 1;
            }
            return 0;
        }
    }

    //not to be confused with self.getVisibleRobots()
    //this method does not return non-visible units that are broadcasting
    //returns all visible robots meeting the criteria sorted by distance
    getVisibleRobots(self, team, units) {
        let robots = [];
        let visibleRobots = self.getVisibleRobots();
        for (let i = 0; i < visibleRobots.length; i++) {
            let robot = visibleRobots[i];
            /*
            if (self.isVisible(robot)) {
                if (!this.exists(team)) {
                    self.log('team doesn\'t matter');
                } else if (robot.team === team) {
                    self.log('team matches requested team: ' + team);
                }
            }
            //*/
            if (self.isVisible(robot)
                && (!this.exists(team) || robot.team === team)
                && (!this.exists(units) 
                    || (Array.isArray(units) && units.includes(robot.unit)
                        || (!Array.isArray(units) && units === robot.unit)))) {
                robots.push(robot);
            }
        }
        if (robots.length) {
            robots.sort(this.getDistanceComparator(self.me));
        }
        return robots;
    }

    //returns all locations where resourceMap is true that are not in the exclusion list sorted by distance
    getResourceLocations(self, resourceMap, exclusionList) {
        let resources = [];
        for (let col = 0; col < resourceMap.length; col++) {
            for (let row = 0; row < resourceMap[col].length; row++) {
                let loc = {x: row, y: col};
                let excluded = this.exists(exclusionList) && exclusionList.length && exclusionList.some(test => test.x === loc.x && test.y === loc.y);
                if (resourceMap[col][row] && !excluded) {
                    resources.push(loc);
                }
            }
        }
        if (resources.length) {
            resources.sort(this.getDistanceComparator(self.me));
        }
        return resources;
    }

    //returns all karbonite sorted by distance
    getKarboniteLocations(self, exclusionList) {
        let resourceMap = self.getKarboniteMap();
        //TODO: keep a list of locations of karbonite to exclude, add to this map when you see a worker on a karbonite
        let resources = this.getResourceLocations(self, resourceMap, exclusionList);
        if (resources.length) {
            resources.sort(this.getDistanceComparator(self.me));
        }
        return resources;
    }

    //returns all fuel sorted by distance
    getFuelLocations(self, exclusionList) {
        let resourceMap = self.getFuelMap();
        //TODO: keep a list of locations of fuel to exclude, add to this map when you see a worker on a fuel
        let resources = this.getResourceLocations(self, resourceMap, exclusionList);
        if (resources.length) {
            resources.sort(this.getDistanceComparator(self.me));
        }
        return resources;
    }

    findClosestKarbonite(self, exclusionList) {
        let resources = this.getKarboniteLocations(self, exclusionList);
        if (this.exists(resources) && resources.length) {
            return resources[0];
        }
    }

    findClosestPassableKarbonite(self, exclusionList) {
        let closestList = [];
        let resources = this.getKarboniteLocations(self, exclusionList);
        if (this.exists(resources) && resources.length) {
            for (let i = 0; i < resources.length; i++) {
                if (this.isPassable(self, resources[i])) {
                    closestList.push(resources[i]); 
                }
            }
        }
        return closestList;
    }

    findClosestFuel(self, exclusionList) {
        let resources = this.getFuelLocations(self, exclusionList);
        if (this.exists(resources) && resources.length) {
            return resources[0];
        }
    }

    findClosestPassableFuel (self, exclusionList) {
        let closestList = [];
        let resources = this.getFuelLocations(self, exclusionList);
        if (this.exists(resources) && resources.length) {
            for (let i = 0; i < resources.length; i++) {
                if (this.isPassable(self, resources[i])) {
                    closestList.push(resources[i]); 
                }
            }
        }
        if (closestList.length) {
            return closestList;
        }
    }

    checkResources(self, resources) {
        if (self.karbonite < resources.karbonite) {
            return false; //not enough karbonite
        }
        if (self.fuel < resources.fuel) {
            return false; //not enough fuel
        }
        return true;
    }

    //takes coordinate dir like {x: -1, y: -1}
    canBuild(self, type, direction) {
      let required_karbonite = SPECS['UNITS'][type].CONSTRUCTION_KARBONITE;
      let required_fuel = SPECS['UNITS'][type].CONSTRUCTION_FUEL;
      if (!this.checkResources(self, {karbonite: required_karbonite , fuel: required_fuel} )) {
        return false;
      }
      if (this.exists(direction)) {
        if (!this.isPassable(self, this.applyDir(self.me, direction))) {
          return false;
        }
      }
      return true;
    }
}

const nav = new Nav();
export default nav;