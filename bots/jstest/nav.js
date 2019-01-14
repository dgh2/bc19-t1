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

nav.check_resources = (self, resources) => {
    if (self.karbonite < resources.karbonite) {
        return false; //not enough karbonite
    }
    if (self.fuel < resources.fuel) {
        return false; //not enough fuel
    }
    return true;
}

export default nav;