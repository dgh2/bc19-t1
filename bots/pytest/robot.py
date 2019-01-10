from battlecode import BCAbstractRobot, SPECS
import battlecode as bc
import random

#__pragma__('iconv')
#__pragma__('tconv')
#__pragma__('opov')

# don't try to use global variables!!
class MyRobot(BCAbstractRobot):
    step = -1
    direction = None
    directions = {
        'N': (0,-1),
        'NE': (1, -1),
        'E': (1, 0),
        'SE': (1, 1),
        'S': (0, 1),
        'SW': (-1, 1),
        'W': (-1, 0),
        'NW': (-1, -1)
    }
    opposite_directions = {
        'N': 'S',
        'NE': 'SW',
        'E': 'W',
        'SE': 'NW',
        'S': 'N',
        'SW': 'NE',
        'W': 'E',
        'NW': 'SE'
    }
    
    def get_opposite_direction(self, direction):
        return self.opposite_directions.get(direction, lambda: None)
    
    def get_random_direction(self):
        return random.choice(list(self.directions.keys()))
    
    def can_build(self, type, direction = None):
        required_karbonite = SPECS['UNITS'][SPECS[type.upper()]].CONSTRUCTION_KARBONITE
        required_fuel = SPECS['UNITS'][SPECS[type.upper()]].CONSTRUCTION_FUEL
        if required_karbonite > self.karbonite:
            return False
        if required_fuel > self.fuel:
            return False
        if direction is not None:
            offset = self.directions.get(direction, lambda: None) #lookup (dx,dy) for direction
            target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
            if not self.traversable(*target):
                return False
        return True
    
    def check_resources(self, karbonite = 0, fuel = 0):
        if self.karbonite < karbonite:
            return False #not enough karbonite
        if self.fuel < fuel:
            return False #not enough fuel
        return True
        
    def walk(self, direction): #take one step in given direction
        if direction is None:
            direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + direction)
        offset = self.directions.get(direction, lambda: None) #lookup (dx,dy) for direction
        target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        #self.log(self.me['unit'] + ': At (' + self.me['x'] + ',' + self.me['y'] + ')')
        #self.log(self.me['unit'] + ': Moving ' + direction + ' to (' + (self.me['x'] + offset[0]) + ',' + (self.me['y'] + offset[1]) + ')')
        required_fuel = self.specs['FUEL_PER_MOVE']
        if self.fuel >= required_fuel and self.traversable(*target):
            return self.move(*offset)
    
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
        
    def random_walk(self, changeDirection = False):
        if self.direction is None:
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
        offset = self.directions.get(self.direction, lambda: None) #lookup (dx,dy) for direction
        target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        #try a few times to get a random traversable direction
        if changeDirection:
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
            offset = self.directions.get(self.direction, lambda: None) #lookup (dx,dy) for direction
            target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        if not self.traversable(*target):
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
            offset = self.directions.get(self.direction, lambda: None) #lookup (dx,dy) for direction
            target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        if not self.traversable(*target):
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
            offset = self.directions.get(self.direction, lambda: None) #lookup (dx,dy) for direction
            target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        if not self.traversable(*target):
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
            offset = self.directions.get(self.direction, lambda: None) #lookup (dx,dy) for direction
            target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        #walk in direction if traversable
        if self.traversable(*target):
            return self.walk(self.direction)
        
    def build(self, type, direction):
        if self.can_build(type, direction):
            self.log(self.me['unit'] + ': Building a ' + type.lower() + ' to the ' + direction)
            offset = self.directions.get(direction, lambda: None) #lookup (dx,dy) for direction
            return self.build_unit(SPECS[type.upper()], *offset)
    
    def deposit(self, direction):
        if self.me['karbonite'] > 0 or self.me['fuel'] > 0:
            if self.me['karbonite'] > 0 and self.me['fuel'] > 0:
                self.log(self.me['unit'] + ': Depositing ' + self.me['karbonite'] + ' karbonite and ' + self.me['fuel'] + ' fuel')
            elif self.me['karbonite'] > 0:
                self.log(self.me['unit'] + ': Depositing ' + self.me['karbonite'] + ' karbonite')
            else:
                self.log(self.me['unit'] + ': Depositing ' + self.me['fuel'] + ' fuel')
            offset = self.directions.get(direction, lambda: None) #lookup (dx,dy) for direction
            return self.give(*offset, self.me['karbonite'], self.me['fuel'])
    
    def castle(self):
        #self.log('CASTLE')
        if self.direction is None:
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
        offset = self.directions.get(self.direction, lambda: None) #lookup (dx,dy) for direction
        if not self.traversable(self.me['x'] + offset[0], self.me['y'] + offset[1]):
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
            offset = self.directions.get(self.direction, lambda: None)
        if not self.traversable(self.me['x'] + offset[0], self.me['y'] + offset[1]):
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
            offset = self.directions.get(self.direction, lambda: None)
        if not self.traversable(self.me['x'] + offset[0], self.me['y'] + offset[1]):
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
            offset = self.directions.get(self.direction, lambda: None)
        if self.traversable(self.me['x'] + offset[0], self.me['y'] + offset[1]):
            old_direction = self.direction
            church_cost = SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_KARBONITE
            if self.step % 7 == 0 and self.karbonite > church_cost + SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_KARBONITE:
                self.direction = self.get_random_direction()
                #self.log(self.me['unit'] + ': Moving ' + self.direction)
                return self.build('pilgrim', old_direction)
            elif self.step % 4 == 0 and self.karbonite >= 2*church_cost:
                self.direction = self.get_random_direction()
                #self.log(self.me['unit'] + ': Moving ' + self.direction)
                return self.build('crusader', old_direction)
        
    def church(self):
        #self.log('CHURCH')
        if self.direction is None:
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
        offset = self.directions.get(self.direction, lambda: None) #lookup (dx,dy) for direction
        if not self.traversable(self.me['x'] + offset[0], self.me['y'] + offset[1]):
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
            offset = self.directions.get(self.direction, lambda: None)
        if not self.traversable(self.me['x'] + offset[0], self.me['y'] + offset[1]):
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
            offset = self.directions.get(self.direction, lambda: None)
        if not self.traversable(self.me['x'] + offset[0], self.me['y'] + offset[1]):
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
            offset = self.directions.get(self.direction, lambda: None)
        if self.traversable(self.me['x'] + offset[0], self.me['y'] + offset[1]):
            old_direction = self.direction
            church_cost = SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_KARBONITE
            if self.step % 7 == 0 and self.karbonite > church_cost + SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_KARBONITE:
                self.direction = self.get_random_direction()
                #self.log(self.me['unit'] + ': Moving ' + self.direction)
                return self.build('pilgrim', old_direction)
            elif self.step % 4 == 0 and self.karbonite >= 2*church_cost:
                self.direction = self.get_random_direction() #change direction after building to reduce clumping
                #self.log(self.me['unit'] + ': Moving ' + self.direction)
                return self.build('crusader', old_direction)
        
    def pilgrim(self):
        #self.log('PILGRIM')
        if self.direction is None:
            self.direction = self.get_random_direction()
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
        opposite = self.get_opposite_direction(self.direction)
        offset = self.directions.get(opposite, lambda: None) #lookup (dx,dy) for opposite direction
        target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        home = None #try to find a castle or church behind this robot
        id = -1
        if self.traversable(*target, True):
            id = self.get_visible_robot_map()[target[1]][target[0]]
        if id > 0: #target has a robot
            home = self.get_robot(id) #the robot behind this robot
            #self.log(self.me['unit'] + ': Behind = (' + home['x'] + ', ' + home['y'] + ')')
            if home['team'] != self.me['team']:
                home = None #other team
                #todo: speed up?
            elif home['unit'] != SPECS['CASTLE'] and home['unit'] != SPECS['CHURCH']:
                home = None #not castle or church
                #todo: speed up?
            #else: #home = castle or church for depositing resources
                #self.log(self.me['unit'] + ': Home = (' + home['y'] + ', ' + home['x'] + ')')
        has_resources = self.me['karbonite'] > 0 or self.me['fuel'] > 0
        on_karbonite = self.karbonite_map[self.me['y']][self.me['x']]
        on_fuel = self.fuel_map[self.me['y']][self.me['x']]
        church_cost = SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_KARBONITE
        if on_karbonite and self.me['karbonite'] < self.specs['KARBONITE_CAPACITY'] and self.fuel > SPECS['MINE_FUEL_COST']:
            if self.me['karbonite'] == 0:
                self.log(self.me['unit'] + ': Mining karbonite')
            return self.mine()
        if on_fuel and self.me['fuel'] < self.specs['FUEL_CAPACITY'] and self.fuel > SPECS['MINE_FUEL_COST']:
            if self.me['fuel'] == 0:
                self.log(self.me['unit'] + ': Mining fuel')
            return self.mine()
        if has_resources and home is not None:
            return self.deposit(opposite)
        if self.can_build('church', opposite) and (on_karbonite or (on_fuel and self.karbonite >= 2*church_cost)):
            return self.build('church', opposite)
        #TODO: if direction is occupied, go around or through
        if home is None:
            if on_karbonite or on_fuel:
                self.direction = opposite
                #self.log(self.me['unit'] + ': Moving ' + self.direction)
            if self.fuel > self.specs['FUEL_PER_MOVE'] and not on_karbonite:
                return self.random_walk(self.step % 4)
        
    def crusader(self):
        #self.log('CRUSADER')
        #TODO: attack any enemy in range
        #TODO: walk toward any visible enemy
        if self.fuel > self.specs['FUEL_PER_MOVE']:
            return self.random_walk(self.step % 4)
        
    def prophet(self):
        #self.log('PROPHET')
        #TODO: attack any enemy in range
        #TODO: walk toward any visible enemy
        if self.fuel > self.specs['FUEL_PER_MOVE']:
            return self.random_walk(self.step % 4)
        
    def preacher(self):
        #self.log('PREACHER')
        #TODO: attack any enemy in range
        #TODO: walk toward any visible enemy
        if self.fuel > self.specs['FUEL_PER_MOVE']:
            return self.random_walk(self.step % 4)
        
    def runUnitFunction(self, type):
        unitFunctions = {
            SPECS['CASTLE']: self.castle,
            SPECS['CHURCH']: self.church,
            SPECS['PILGRIM']: self.pilgrim,
            SPECS['CRUSADER']: self.crusader,
            SPECS['PROPHET']: self.prophet,
            SPECS['PREACHER']: self.preacher
        }
        unitFunction = unitFunctions.get(type, lambda: 'Invalid unit type: ' + type)
        self.specs = SPECS['UNITS'][self.me['unit']]
        return unitFunction()
    
    def turnStart(self):
        #code common to ALL unit types BEFORE unit specific code
        self.step += 1
        
    def turnEnd(self):
        #code common to ALL unit types AFTER unit specific code
        pass
        
    def turn(self):
        self.turnStart()
        returnValue = self.runUnitFunction(self.me['unit'])
        self.turnEnd()
        return returnValue

robot = myRobot