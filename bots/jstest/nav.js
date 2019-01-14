const nav = {};

nav.compass = [
    ['NW', 'N', 'NE'],
    ['W', 'C', 'E'],
    ['SW', 'S', 'SE'],
];

nav.rotateArr = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
nav.rotateArrInd = {
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

nav.toCompassDir = (coordinateDir) => {
    return nav.compass[coordinateDir.y + 1][coordinateDir.x + 1];
};

nav.toCoordinateDir = (compassDir) => {
    return nav.compassToCoordinate[compassDir];
};

nav.randomCompassDir = () => {
    const roll = Math.floor(Math.random() * nav.rotateArr.length);
    const compassDir = nav.rotateArr[roll];
    return compassDir;
};

nav.randomCoordinateDir = () => {
    const randomCompassDir = nav.randomCompassDir();
    const randomCoordinateDir = nav.toCoordinateDir(randomCompassDir);
    return randomCoordinateDir;
};

nav.rotate = (coordinateDir, amount) => {
    const compassDir = nav.toCompassDir(coordinateDir);
    const rotateCompassDir = nav.rotateArr[(nav.rotateArrInd[compassDir] + amount) % nav.rotateArr.len];
    return nav.toCoordinateDir(rotateCompassDir);
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

nav.isPassable = (loc, fullMap, robotMap) => {
    const {x, y} = loc;
    const mapLen = fullMap.length;
    if (x >= mapLen || x < 0) {
        return false;
    } else if (y >= mapLen || y < 0) {
        return false;
    } else if (robotMap[y][x] > 0 || !fullMap[y][x]) {
        return false;
    } else {
        return true;
    }
};

nav.applyDir = (loc, coordinateDir) => {
    return {
        x: loc.x + coordinateDir.x,
        y: loc.y + coordinateDir.y,
    };
};

nav.goto = (loc, destination, fullMap, robotMap) => {
    let goalDir = nav.getDir(loc, destination);
    if (goalDir.x === 0 && goalDir.y === 0) {
        return goalDir;
    }
    let tryDir = 0;
    while (!nav.isPassable(nav.applyDir(loc, goalDir), fullMap, robotMap) && tryDir < 8) {
        goalDir = nav.rotate(goalDir, 1);
        tryDir++;
    }
    return goalDir;
};

nav.sqDist = (start, end) => {
    return Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2);
};

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