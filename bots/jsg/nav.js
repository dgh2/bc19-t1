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
        if ((coordinateDir)) {
            return COMPASS[coordinateDir.y + 1][coordinateDir.x + 1];
        }
    }
    
    toDir(compassDir) { //convert compass dir like 'NW' into coordinate dir like {x: -1, y: -1}
        if ((compassDir)) {
            return COMPASS_TO_DIR[compassDir];
        }
    }

    getRandomCompassDir() { //Get random compass direction like 'N', 'NE', 'E', ...
        return COMPASS_DIRS[Math.floor(Math.random() * COMPASS_DIRS.length)];
    }

    getRandomDir() { //Get random coordinate direction like {x: -1, y: -1}, {x: 0, y: -1}, ...
        return this.toDir(this.getRandomCompassDir());
    }
    
    getRandomValidDir(avoid_resources = true, prefer_karbonite = true, prefer_fuel = false) {
        let choice;
        let randomCompassDirs = this.getRandomCompassDirs();
        for (let i = 0; i < randomCompassDirs.length; i++) {
            let random_dir = this.toDir(randomCompassDirs[i]);
            let loc = this.applyDir(random_dir);
            if (this.isPassable(loc)) {
                let random_dir_karbonite = this.self.getKarboniteMap()[loc.y][loc.x];
                let random_dir_fuel = this.self.getFuelMap()[loc.y][loc.x];
                if (avoid_resources && !random_dir_karbonite && !random_dir_fuel) {
                    return random_dir;
                } else if (!avoid_resources && prefer_karbonite && random_dir_karbonite) {
                    return random_dir;
                } else if (!avoid_resources && prefer_fuel && random_dir_fuel) {
                    return random_dir;
                }
                
                if (!choice) {
                    choice = random_dir;
                } else {
                    let choice_loc = this.applyDir(choice);
                    let choice_karbonite = this.self.getKarboniteMap()[choice_loc.y][choice_loc.x];
                    let choice_fuel = this.self.getFuelMap()[choice_loc.y][choice_loc.x];
                    let overwrite_karbonite = (avoid_resources && choice_karbonite && !random_dir_karbonite) 
                                                  || (!avoid_resources && prefer_karbonite && !choice_karbonite && random_dir_karbonite);
                    let overwrite_fuel = (avoid_resources && choice_fuel && !random_dir_fuel) 
                                              || (!avoid_resources && prefer_fuel && !choice_fuel && random_dir_fuel);
                    if (overwrite_karbonite || overwrite_fuel) {
                        choice = random_dir;
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
    getResourceLocations(resourceMap, exclusionList, max_radius = -1) {
        let resources = [];
        for (let col = 0; col < resourceMap.length; col++) {
            for (let row = 0; row < resourceMap[col].length; row++) {
                let loc = {x: row, y: col};
                let out_of_range = (max_radius === -1 ? false : this.sqDist(this.self.me, loc) > max_radius);
                let excluded = (exclusionList) && exclusionList.length && exclusionList.some(test => test.x === loc.x && test.y === loc.y);
                if (resourceMap[col][row] && !excluded && !out_of_range) {
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

    findClosestKarbonite(exclusionList) {
        let resources = this.getKarboniteLocations(exclusionList);
        if ((resources) && resources.length) {
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
      let required_karbonite = SPECS['UNITS'][type].CONSTRUCTION_KARBONITE;
      let required_fuel = SPECS['UNITS'][type].CONSTRUCTION_FUEL;
      if (!this.self.checkResources({karbonite: required_karbonite , fuel: required_fuel} )) {
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
        let reflection = {x: 0, y: -1};
        let width = this.self.getPassableMap().length;
        let height = this.self.getPassableMap()[col].length;
        for (let col = 0; col < width; col++) {
            for (let row = 0; row < height; row++) {
                let loc = {x: row, y: col};
                let h_loc = {x: row, y: width - col - 1};
                let v_loc = {x: height - row - 1, y: col};
                
                let passable = this.self.getPassableMap()[loc.y][loc.x];
                let karbonite = this.self.getPassableMap()[loc.y][loc.x];
                let fuel = this.self.getPassableMap()[loc.y][loc.x];
                
                let h_passable = this.self.getPassableMap()[h_loc.y][h_loc.x];
                let v_passable = this.self.getPassableMap()[v_loc.y][v_loc.x];
                let h_karbonite = this.self.getKarboniteMap()[h_loc.y][h_loc.x];
                let v_karbonite = this.self.getKarboniteMap()[v_loc.y][v_loc.x];
                let h_fuel = this.self.getFuelMap()[h_loc.y][h_loc.x];
                let v_fuel = this.self.getFuelMap()[v_loc.y][v_loc.x];
                
                let h_passable_reflection = (h_passable === passable && v_passable !== passable);
                let v_passable_reflection = (h_passable !== passable && v_passable === passable);
                let h_karbonite_reflection = (h_karbonite === karbonite && v_karbonite !== karbonite);
                let v_karbonite_reflection = (h_karbonite !== karbonite && v_karbonite === karbonite);
                let h_fuel_reflection = (h_fuel === fuel && v_fuel !== fuel);
                let v_fuel_reflection = (h_fuel !== fuel && v_fuel === fuel);
                
                if ((h_passable_reflection && !v_passable_reflection)
                    || (h_karbonite_reflection && !v_karbonite_reflection)
                    || (h_fuel_reflection && !v_fuel_reflection)) {
                    return {horizontal: 1, vertical: 0}; 
                }
                if ((!h_passable_reflection && v_passable_reflection)
                    || (!h_karbonite_reflection && v_karbonite_reflection)
                    || (!h_fuel_reflection && v_fuel_reflection)) {
                    return {horizontal: 0, vertical: 1};
                }
            }
        }
        return {horizontal: 1, vertical: 1};
    }
    
    getMapCenter(getClosest = true) {
        let width = this.self.getPassableMap().length;
        let height = this.self.getPassableMap()[col].length;
        if (width % 2) { //Width is odd, so there's no true center
            if (getClosest) {
                width += (2*this.self.me.x < width ? -1, 1); //Adjust width so half is the center col closest to this unit
            } else {
                width += (2*this.self.me.x < width ? 1, -1); //Adjust width so half is the center col farthest from this unit
            }
        }
        if (height % 2) { //Height is odd, so there's no true center
            if (getClosest) {
                height += (2*this.self.me.y < height ? -1, 1); //Adjust height so half is the center row closest to this unit
            } else {
                height += (2*this.self.me.y < height ? -1, 1); //Adjust height so half is the center row farthest from this unit
            }
        }
        return {x: 0.5 * width, y: 0.5 * height};
    }
}

export default Nav;