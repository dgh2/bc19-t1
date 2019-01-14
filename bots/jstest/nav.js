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

nav.compassToCoordinate = {
    'N': {x: 0, y: -1},
    'NE': {x: 1, y: -1},
    'NW': {x: -1, y: -1},
    'E': {x: 1, y: 0},
    'W': {x: -1, y: 0},
    'S': {x: 0, y: 1},
    'SE': {x: 1, y: 1},
    'SW': {x: -1, y: 1},
};

nav.getRandomCompassDirs = () => {
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

nav.getRandomCompassDir = () => {
    return nav.getRandomCompassDirs()[0];
}

nav.getRandomDir = () => {
    return nav.toDir(nav.getRandomCompassDir());
}

nav.toCompassDir = (coordinateDir) => {
    return nav.compass[coordinateDir.y + 1][coordinateDir.x + 1];
};

nav.toDir = (compassDir) => {
    return nav.compassToCoordinate[compassDir];
};

nav.randomCompassDir = () => {
    const roll = Math.floor(Math.random() * nav.dirs.length);
    const compassDir = nav.dirs[roll];
    return compassDir;
};

nav.randomDir = () => {
    const randomCompassDir = nav.randomCompassDir();
    const randomDir = nav.toDir(randomCompassDir);
    return randomDir;
};

nav.randomValidDir = (self) => {
    var randomCompassDirs = nav.getRandomCompassDirs();
    for (var i = 0; i < randomCompassDirs.length; i++) {
        var randomCompassDir = randomCompassDirs[i];
        var randomDir = nav.toDir(randomCompassDir);
        if (nav.isPassable(self, {x: self.me.x + randomDir.x, y: self.me.y + randomDir.y})) {
            return randomDir;
        }
    }
    return null;
};

nav.rotate = (coordinateDir, amount) => {
    const compassDir = nav.toCompassDir(coordinateDir);
    const rotateCompassDir = nav.dirs[(nav.dirsInd[compassDir] + amount) % nav.dirs.len];
    return nav.toDir(rotateCompassDir);
};

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

nav.isPassable = (self, loc) => {
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
/*
nav.applyDir = (loc, coordinateDir) => {
    return {
        x: loc.x + coordinateDir.x,
        y: loc.y + coordinateDir.y,
    };
};

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

nav.sqDist = (start, end) => {
    return Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2);
};
*/
/*
def traversable(self, x, y, ignore_robots = False):
    if x < 0 or x >= len(self.map[y]):
        return False #out of x bounds
    if y < 0 or y >= len(self.map):
        return False #out of y bounds
    if not self.map[y][x]:
        return False #target is an obstacle
    if not ignore_robots and self.get_visible_robot_map()[y][x] > 0:
        return False #target is blocked by a robot and we care
    return True
*/

export default nav;