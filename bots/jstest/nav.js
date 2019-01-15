import {SPECS} from 'battlecode';
const nav = {};

nav.compass = [
    ['NW', 'N', 'NE'],
    ['W', 'C', 'E'],
    ['SW', 'S', 'SE'],
];

nav.dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
nav.dirsInd = {
    'N': 0,
    'NE': 1,
    'E': 2,
    'SE': 3,
    'S': 4,
    'SW': 5,
    'W': 6,
    'NW': 7,
};

nav.compassToDir = {
    'N': {x: 0, y: -1},
    'NE': {x: 1, y: -1},
    'NW': {x: -1, y: -1},
    'E': {x: 1, y: 0},
    'W': {x: -1, y: 0},
    'S': {x: 0, y: 1},
    'SE': {x: 1, y: 1},
    'SW': {x: -1, y: 1},
};

nav.exists = (variable) => {
    return !(typeof variable === 'undefined' || variable === null);
}

nav.getRandomCompassDirs = () => { //Get a list of all random compass directions ['W', 'NE', 'S', ...]
    var dirs = nav.dirs.slice();
    var currentIndex = dirs.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = dirs[currentIndex];
        dirs[currentIndex] = dirs[randomIndex];
        dirs[randomIndex] = temporaryValue;
    }
    return dirs;
};

nav.toCompassDir = (coordinateDir) => { //convert coordinate dir like {x: -1, y: -1} into compass dir like 'NW'
    return nav.compass[coordinateDir.y + 1][coordinateDir.x + 1];
};

nav.toDir = (compassDir) => { //convert compass dir like 'NW' into coordinate dir like {x: -1, y: -1}
    return nav.compassToDir[compassDir];
};

nav.getRandomCompassDir = () => { //Get random compass direction like 'N', 'NE', 'E', ...
    return nav.dirs[Math.floor(Math.random() * nav.dirs.length)];
}

nav.getRandomDir = () => { //Get random coordinate direction like {x: -1, y: -1}, {x: 0, y: -1}, ...
    return nav.toDir(nav.getRandomCompassDir());
}

nav.randomCompassDir = () => {
    const roll = Math.floor(Math.random() * nav.dirs.length);
    const compassDir = nav.dirs[roll];
    return compassDir;
};

nav.randomValidDir = (self) => {
    var randomCompassDirs = nav.getRandomCompassDirs();
    for (var i = 0; i < randomCompassDirs.length; i++) {
        var randomDir = nav.toDir(randomCompassDirs[i]);
        if (nav.isPassable(self, nav.applyDir(self.me, randomDir))) {
            return randomDir;
        }
    }
    return null;
};

/*
nav.rotate = (coordinateDir, amount) => {
    const compassDir = nav.toCompassDir(coordinateDir);
    const rotateCompassDir = nav.dirs[(nav.dirsInd[compassDir] + amount) % nav.dirs.len];
    return nav.toDir(rotateCompassDir);
};
*/

nav.reflect = (loc, fullMap, isHorizontalReflection) => {
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
};

nav.getDir = (start, target) => {
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
};

nav.isPassable = (self, loc) => { //{x:self.x , y:self.y} passed in as the variable loc
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
};

nav.applyDir = (loc, dir) => {
    return {
        x: loc.x + dir.x,
        y: loc.y + dir.y,
    };
};

/*
nav.goto = (self, loc, destination, fullMap, robotMap) => {
    let goalDir = nav.getDir(loc, destination);
    if (goalDir.x === 0 && goalDir.y === 0) {
        return goalDir;
    }
    let tryDir = 0;
    while (!nav.isPassable(self, nav.applyDir(loc, goalDir), fullMap, robotMap) && tryDir < 8) {
        goalDir = nav.rotate(goalDir, 1);
        tryDir++;
    }
    return goalDir;
};
*/

nav.sqDist = (start, end) => {
    return Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2);
};

nav.getDistanceComparator = (me) => {
    return function(a, b) {
        let aDist = nav.sqDist(me, a);
        let bDist = nav.sqDist(me, b);
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
nav.getVisibleRobots = (self, team = null, units = null) => {
    let robots = self.getVisibleRobots();
    robots = robots.filter(function (robot) {
        return self.isVisible(robot)
            && (team === null || robot.team == team)
            && (units === null || units === robot.unit || units.includes(robot.unit));
    });
    if (nav.exists(robots) && robots.length) {
        return robots.sort(nav.getDistanceComparator(self.me));
    }
}

//returns all locations where resourceMap is true that are not in the exclusion list sorted by distance
nav.getResourceLocations = (self, resourceMap, exclusionList) => {
    let resources = [];
    for (let col = 0; col < resourceMap.length; col++) {
        for (let row = 0; row < resourceMap[col].length; row++) {
            let excluded = nav.exists(exclusionList) && exclusionList.length && exclusionList.includes(location);
            if (resourceMap[col][row] && !excluded) {
                let location = {x: row, y: col};
                resources.push(location);
            }
        }
    }
    if (resources.length) {
        resources.sort(nav.getDistanceComparator(self.me));
        return resources;
    }
}

//returns all karbonite sorted by distance
nav.getKarboniteLocations = (self, exclusionList) => {
    let resourceMap = self.getKarboniteMap();
    //TODO: keep a list of locations of karbonite to exclude, add to this map when you see a worker on a karbonite
    let resources = nav.getResourceLocations(self, resourceMap, exclusionList);
    if (nav.exists(resources) && resources.length) {
        return resources.sort(nav.getDistanceComparator(self.me));
    }
}

//returns all fuel sorted by distance
nav.getFuelLocations = (self, exclusionList) => {
    let resourceMap = self.getFuelMap();
    //TODO: keep a list of locations of fuel to exclude, add to this map when you see a worker on a fuel
    let resources = nav.getResourceLocations(self, resourceMap, exclusionList);
    if (nav.exists(resources) && resources.length) {
        return resources.sort(nav.getDistanceComparator(self.me));
    }
}

nav.findClosestKarbonite = (self, exclusionList) => {
    let resources = nav.getKarboniteLocations(self, exclusionList);
    if (nav.exists(resources) && resources.length) {
        return resources[0];
    }
}

nav.findClosestFuel = (self, exclusionList) => {
    let resources = nav.getFuelLocations(self, exclusionList);
    if (nav.exists(resources) && resources.length) {
        return resources[0];
    }
}

nav.checkResources = (self, resources) => {
    if (self.karbonite < resources.karbonite) {
        return false; //not enough karbonite
    }
    if (self.fuel < resources.fuel) {
        return false; //not enough fuel
    }
    return true;
}

//takes compass direction
nav.canBuild = (self, type, direction) => {
  required_karbonite = SPECS['UNITS'][SPECS[type.upper()]].CONSTRUCTION_KARBONITE;
  required_fuel = SPECS['UNITS'][SPECS[type.upper()]].CONSTRUCTION_FUEL;
  if (!nav.checkResources(self, {karbonite: required_karbonite , fuel: required_fuel} )) {
    return false;
  }
  if (direction) { //would only skip if falsy
    offset = nav.toDir(direction); //coordinate dir like {x: -1, y: -1}
    target = { x: self.x + offset.x , y: self.y + offset.y }; // as {x: , y: }
    if (!nav.isPassable(self, target)) {
      return false;
    }
  }
  return true;
}

export default nav;
