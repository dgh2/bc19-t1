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
    constructor(self) {
        this.self = self;
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
        if (coordinateDir) {
            return COMPASS[coordinateDir.y + 1][coordinateDir.x + 1];
        }
    }
    
    toDir(compassDir) { //convert compass dir like 'NW' into coordinate dir like {x: -1, y: -1}
        if (compassDir) {
            return COMPASS_TO_DIR[compassDir];
        }
    }

    getRandomCompassDir() { //Get random compass direction like 'N', 'NE', 'E', ...
        return COMPASS_DIRS[Math.floor(Math.random() * COMPASS_DIRS.length)];
    }

    getRandomDir() { //Get random coordinate direction like {x: -1, y: -1}, {x: 0, y: -1}, ...
        return this.toDir(this.getRandomCompassDir());
    }
    
    getRandomValidDir(avoidResources = true, preferKarbonite = true, preferFuel = false) {
        let choice;
        let randomCompassDirs = this.getRandomCompassDirs();
        for (let i = 0; i < randomCompassDirs.length; i++) {
            let randomDir = this.toDir(randomCompassDirs[i]);
            let loc = this.applyDir(randomDir);
            if (this.isPassable(loc)) {
                let randomDirIsKarbonite = this.self.getKarboniteMap()[loc.y][loc.x];
                let randomDirIsFuel = this.self.getFuelMap()[loc.y][loc.x];
                if (avoidResources && !randomDirIsKarbonite && !randomDirIsFuel) {
                    return randomDir;
                } else if (!avoidResources && preferKarbonite && randomDirIsKarbonite) {
                    return randomDir;
                } else if (!avoidResources && preferFuel && randomDirIsFuel) {
                    return randomDir;
                }
                
                if (!choice) {
                    choice = randomDir;
                } else {
                    let choiceLoc = this.applyDir(choice);
                    let choiceIsKarbonite = this.self.getKarboniteMap()[choiceLoc.y][choiceLoc.x];
                    let choiceIsFuel = this.self.getFuelMap()[choiceLoc.y][choiceLoc.x];
                    let overwriteKarbonite = (avoidResources && choiceIsKarbonite && !randomDirIsKarbonite) 
                                                  || (!avoidResources && preferKarbonite && !choiceIsKarbonite && randomDirIsKarbonite);
                    let overwriteFuel = (avoidResources && choiceIsFuel && !randomDirIsFuel) 
                                              || (!avoidResources && preferFuel && !choiceIsFuel && randomDirIsFuel);
                    if (overwriteKarbonite || overwriteFuel) {
                        choice = randomDir;
                    }
                }
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

    isPassable(loc) { //{x:self.x , y:self.y} passed in as the variable loc
        const {x, y} = loc;
        const passableMap = this.self.getPassableMap();
        const robotMap = this.self.getVisibleRobotMap();
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
        if (loc && !dir) {
            dir = loc;
            loc = this.self.me;
        }
        return {
            x: loc.x + dir.x,
            y: loc.y + dir.y,
        };
    }

    sqDist(start, end) {
        return Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2);
    }
    
    getDistanceComparator(me = this.self.me) {
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
    getVisibleRobots(team, units) {
        let robots = [];
        let visibleRobots = this.self.getVisibleRobots();
        for (let i = 0; i < visibleRobots.length; i++) {
            let robot = visibleRobots[i];
            if (this.self.isVisible(robot)
                && ((typeof team === 'undefined' || team === null) || robot.team === team)
                && ((typeof units === 'undefined' || units === null)
                    || (Array.isArray(units) && units.includes(robot.unit))
                    || (!Array.isArray(units) && units === robot.unit))) {
                robots.push(robot);
            }
        }
        if (robots.length) {
            robots.sort(this.getDistanceComparator(this.self.me));
        }
        return robots;
    }

    //returns all locations where resourceMap is true that are not in the exclusion list sorted by distance
    getResourceLocations(resourceMap, exclusionList, maxRadius = -1) {
        let resources = [];
        for (let col = 0; col < resourceMap.length; col++) {
            for (let row = 0; row < resourceMap[col].length; row++) {
                let loc = {x: row, y: col};
                let outOfRange = (maxRadius === -1 ? false : this.sqDist(this.self.me, loc) > maxRadius);
                let excluded = exclusionList && exclusionList.length && exclusionList.some(test => test.x === loc.x && test.y === loc.y);
                if (resourceMap[col][row] && !excluded && !outOfRange) {
                    resources.push(loc);
                }
            }
        }
        if (resources.length) {
            resources.sort(this.getDistanceComparator(this.self.me));
        }
        return resources;
    }

    //returns all karbonite sorted by distance
    getKarboniteLocations(exclusionList) {
        let resourceMap = this.self.getKarboniteMap();
        let resources = this.getResourceLocations(resourceMap, exclusionList);
        if (resources.length) {
            resources.sort(this.getDistanceComparator(this.self.me));
        }
        return resources;
    }

    //returns all fuel sorted by distance
    getFuelLocations(exclusionList) {
        let resourceMap = this.self.getFuelMap();
        let resources = this.getResourceLocations(resourceMap, exclusionList);
        if (resources.length) {
            resources.sort(this.getDistanceComparator(this.self.me));
        }
        return resources;
    }
    
    getAllResourceLocations(exclusionList) {
        let karbonite = this.getKarboniteLocations(exclusionList);
        let fuel = this.getFuelLocations(exclusionList);
    }

    findClosestKarbonite(exclusionList) {
        let resources = this.getKarboniteLocations(exclusionList);
        if (resources && resources.length) {
            return resources[0];
        }
    }

    findClosestPassableKarbonite(exclusionList) {
        let closestList = [];
        let resources = this.getKarboniteLocations(exclusionList);
        if (resources && resources.length) {
            for (let i = 0; i < resources.length; i++) {
                if (this.isPassable(resources[i])) {
                    closestList.push(resources[i]); 
                }
            }
        }
        return closestList;
    }

    findClosestFuel(exclusionList) {
        let resources = this.getFuelLocations(exclusionList);
        if (resources && resources.length) {
            return resources[0];
        }
    }

    findClosestPassableFuel (exclusionList) {
        let closestList = [];
        let resources = this.getFuelLocations(exclusionList);
        if (resources && resources.length) {
            for (let i = 0; i < resources.length; i++) {
                if (this.isPassable(resources[i])) {
                    closestList.push(resources[i]); 
                }
            }
        }
        if (closestList.length) {
            return closestList;
        }
    }

    //takes coordinate dir like {x: -1, y: -1}
    canBuild(type, direction) {
      let requiredKarbonite = SPECS['UNITS'][type].CONSTRUCTIonKarbonite;
      let requiredFuel = SPECS['UNITS'][type].CONSTRUCTIonFuel;
      if (!this.self.checkResources({karbonite: requiredKarbonite , fuel: requiredFuel} )) {
        return false;
      }
      if (direction) {
        if (!this.isPassable(this.applyDir(this.self.me, direction))) {
          return false;
        }
      }
      return true;
    }
    
    getReflection() {
        let width = this.self.getPassableMap().length;
        let height = this.self.getPassableMap()[0].length;
        for (let col = 0; col < width; col++) {
            for (let row = 0; row < height; row++) {
                let loc = {x: row, y: col};
                let hLoc = {x: row, y: width - col - 1};
                let vLoc = {x: height - row - 1, y: col};
                
                let passable = this.self.getPassableMap()[loc.y][loc.x];
                let karbonite = this.self.getPassableMap()[loc.y][loc.x];
                let fuel = this.self.getPassableMap()[loc.y][loc.x];
                
                let hPassable = this.self.getPassableMap()[hLoc.y][hLoc.x];
                let vPassable = this.self.getPassableMap()[vLoc.y][vLoc.x];
                let hKarbonite = this.self.getKarboniteMap()[hLoc.y][hLoc.x];
                let vKarbonite = this.self.getKarboniteMap()[vLoc.y][vLoc.x];
                let hFuel = this.self.getFuelMap()[hLoc.y][hLoc.x];
                let vFuel = this.self.getFuelMap()[vLoc.y][vLoc.x];
                
                let hPassableReflection = (hPassable === passable && vPassable !== passable);
                let vPassableReflection = (hPassable !== passable && vPassable === passable);
                let hKarboniteReflection = (hKarbonite === karbonite && vKarbonite !== karbonite);
                let vKarboniteReflection = (hKarbonite !== karbonite && vKarbonite === karbonite);
                let hFuelReflection = (hFuel === fuel && vFuel !== fuel);
                let vFuelReflection = (hFuel !== fuel && vFuel === fuel);
                
                if ((hPassableReflection && !vPassableReflection)
                    || (hKarboniteReflection && !vKarboniteReflection)
                    || (hFuelReflection && !vFuelReflection)) {
                    return {horizontal: true, vertical: false}; 
                }
                if ((!hPassableReflection && vPassableReflection)
                    || (!hKarboniteReflection && vKarboniteReflection)
                    || (!hFuelReflection && vFuelReflection)) {
                    return {horizontal: false, vertical: true};
                }
            }
        }
        return {horizontal: true, vertical: true};
    }
    
    getMapCenter(getClosest = true) {
        let width = this.self.getPassableMap().length;
        let height = this.self.getPassableMap()[0].length;
        if (width % 2) { //Width is odd, so there's no true center
            if (getClosest) {
                width += (2*this.self.me.x < width ? -1 : 1); //Adjust width so half is the center col closest to this unit
            } else {
                width += (2*this.self.me.x < width ? 1 : -1); //Adjust width so half is the center col farthest from this unit
            }
        }
        if (height % 2) { //Height is odd, so there's no true center
            if (getClosest) {
                height += (2*this.self.me.y < height ? -1 : 1); //Adjust height so half is the center row closest to this unit
            } else {
                height += (2*this.self.me.y < height ? -1 : 1); //Adjust height so half is the center row farthest from this unit
            }
        }
        return {x: 0.5 * width, y: 0.5 * height};
    }
}

export default Nav;