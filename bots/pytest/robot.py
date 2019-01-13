from battlecode import BCAbstractRobot, SPECS
import battlecode as bc
import random
import nav

#__pragma__('iconv')
#__pragma__('tconv')
#__pragma__('opov')

# don't try to use global variables!!
class MyRobot(BCAbstractRobot):
    step = -1
    direction = None
    
    def get_offset_location(self, dx, dy):
        return (self.me['x'] + dx, self.me['y'] + dy)
    
    def get_direction_offset_location(self, direction):
        return self.get_offset_location(*nav.get_offset(direction))
    
    def get_random_valid_direction(self):
        randomized = list(nav.directions.keys())
        random.shuffle(randomized)
        for direction in randomized:
            if self.traversable(*self.get_direction_offset_location(direction)):
                return direction
        return None
    
    def get_direction(self, x1, y1, x2, y2):
        dx = x2-x1
        dy = y2-y1
        if dx != 0:
            dx = dx/abs(dx)
        if dy != 0:
            dy = dy/abs(dy)
        if dx == 0 and dy == 0:
            return None
        direction = next(key for key,value in nav.directions.items() if value[0] == dx and value[1] == dy)
        #self.log(dx + ',' + dy + ' represents ' + direction)
        return direction
    
    def get_closest_robot(self, x, y, team = None, unit = None):
        closest = None
        distance = None
        visible_robots = (robot for robot in self.get_visible_robots() if self.is_visible(robot))
        for robot in visible_robots:
            rx = robot['x']
            ry = robot['y']
            if team is not None and robot['team'] != team:
                continue #team does not match the requested team
            if unit is not None and robot['unit'] != unit:
                continue #unit does not match the requested unit type
            robot_distance =(x-rx)**2 + (y-ry)**2 #r**2 distance calculation
            if closest is None or robot_distance < distance: #if robot is closer than current closest robot
                distance = robot_distance
                closest = robot
        return closest
    
    def get_closest_karbonite(self, x, y):
        closest = None
        distance = None
        for ky in range(len(self.karbonite_map)):
            for kx in range(len(self.karbonite_map[ky])):
                if not self.karbonite_map[ky][kx]:
                    continue #no resource
                if not self.traversable(kx,ky):
                    continue #unit on resource
                karbonite_distance = (x-kx)**2 + (y-ky)**2 #r**2 distance calculation
                if closest is None or karbonite_distance < distance: #if resource is closer than current closest resource
                    distance = karbonite_distance
                    closest = (kx,ky)
        return closest
    
    def get_closest_fuel(self, x, y):
        closest = None
        distance = None
        for fy in range(len(self.fuel_map)):
            for fx in range(len(self.fuel_map[fy])):
                if not self.fuel_map[fy][fx]:
                    continue #no resource
                if not self.traversable(fx,fy):
                    continue #unit on resource
                fuel_distance = (x-fx)**2 + (y-fy)**2 #r**2 distance calculation
                if closest is None or fuel_distance < distance: #if resource is closer than current closest resource
                    distance = fuel_distance
                    closest = (fx,fy)
        return closest
    
    def can_build(self, unit, direction = None):
        required_karbonite = SPECS['UNITS'][SPECS[unit.upper()]].CONSTRUCTION_KARBONITE
        required_fuel = SPECS['UNITS'][SPECS[unit.upper()]].CONSTRUCTION_FUEL
        if not self.check_resources(required_karbonite, required_fuel):
            return False
        if direction is not None:
            offset = nav.get_offset(direction) #lookup (dx,dy) for direction
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
            direction = nav.get_random_direction()
            self.log(self.me['unit'] + ': (walk) Randomly picks: ' + self.direction)
            #self.log(self.me['unit'] + ': Moving ' + direction)
        offset = nav.get_offset(direction) #lookup (dx,dy) for direction
        target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        #self.log(self.me['unit'] + ': At (' + self.me['x'] + ',' + self.me['y'] + ')')
        #self.log(self.me['unit'] + ': Moving ' + direction + ' to (' + (self.me['x'] + offset[0]) + ',' + (self.me['y'] + offset[1]) + ')')
        r2 = offset[0]**2 + offset[1]**2
        required_fuel = r2 * self.specs['FUEL_PER_MOVE'] #movement cost per r^2
        #self.log(self.me['unit'] + ': Current fuel/required fuel: ' + self.fuel + '/' + required_fuel)
        if self.check_resources(0, required_fuel) and self.traversable(*target):
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
        if changeDirection:
            self.direction = None
        if self.direction is None:
            self.direction = nav.get_random_direction()
            self.log(self.me['unit'] + ': (random_walk) Randomly picks: ' + self.direction)
        offset = nav.get_offset(self.direction) #lookup (dx,dy) for direction
        target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        #try a few times to get a random traversable direction
        if not self.traversable(*target):
            self.direction = nav.get_random_direction()
            self.log(self.me['unit'] + ': (random_walk) Randomly picks: ' + self.direction)
            offset = nav.get_offset(self.direction) #lookup (dx,dy) for direction
            target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        if not self.traversable(*target):
            self.direction = nav.get_random_direction()
            self.log(self.me['unit'] + ': (random_walk) Randomly picks: ' + self.direction)
            offset = nav.get_offset(self.direction) #lookup (dx,dy) for direction
            target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        if not self.traversable(*target):
            self.direction = nav.get_random_direction()
            self.log(self.me['unit'] + ': (random_walk) Randomly picks: ' + self.direction)
            offset = nav.get_offset(self.direction) #lookup (dx,dy) for direction
            target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        #walk in direction if traversable
        if self.traversable(*target):
            return self.walk(self.direction)
        
    def build(self, unit, direction):
        if self.can_build(unit, direction):
            self.log(self.me['unit'] + ': Building a ' + unit.lower() + ' to the ' + direction)
            offset = nav.get_offset(direction) #lookup (dx,dy) for direction
            return self.build_unit(SPECS[unit.upper()], *offset)
    
    def deposit(self, direction):
        if self.me['karbonite'] > 0 or self.me['fuel'] > 0:
            total_k = self.me['karbonite'] + self.karbonite
            total_f = self.me['fuel'] + self.fuel
            if self.me['karbonite'] > 0 and self.me['fuel'] > 0:
                self.log(self.me['unit'] + ': Depositing ' + self.me['karbonite'] + ' karbonite and ' + self.me['fuel'] + ' fuel (' + total_k + ',' + total_f + ')')
                pass
            elif self.me['karbonite'] > 0:
                self.log(self.me['unit'] + ': Depositing ' + self.me['karbonite'] + ' karbonite (' + total_k + ',' + total_f + ')')
                pass
            else:
                self.log(self.me['unit'] + ': Depositing ' + self.me['fuel'] + ' fuel (' + total_k + ',' + total_f + ')')
                pass
            offset = nav.get_offset(direction) #lookup (dx,dy) for direction
            return self.give(*offset, self.me['karbonite'], self.me['fuel'])
    
    def castle(self):
        #self.log('CASTLE')
        if self.direction is None:
            closest_karbonite = self.get_closest_karbonite(self.me['x'], self.me['y'])
            closest_fuel = self.get_closest_fuel(self.me['x'], self.me['y'])
            if closest_karbonite is not None:
                self.direction = self.get_direction(self.me['x'], self.me['y'], *closest_karbonite)
            elif closest_fuel is not None:
                self.direction = self.get_direction(self.me['x'], self.me['y'], *closest_fuel)
            else:
                self.direction = self.get_random_valid_direction()
                if self.direction is None:
                    self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                    return None
        offset = nav.get_offset(self.direction) #lookup (dx,dy) for direction
        target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        if not self.traversable(*target):
            self.direction = self.get_random_valid_direction()
            if self.direction is None:
                self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                return None
            offset = nav.get_offset(self.direction) #lookup (dx,dy) for direction
            target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        if self.traversable(*target):
            church_cost = (SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_FUEL)
            pilgrim_cost = (SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_FUEL)
            crusader_cost = (SPECS['UNITS'][SPECS['CRUSADER']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CRUSADER']].CONSTRUCTION_FUEL)
            prophet_cost = (SPECS['UNITS'][SPECS['PROPHET']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PROPHET']].CONSTRUCTION_FUEL)
            preacher_cost = (SPECS['UNITS'][SPECS['PREACHER']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PREACHER']].CONSTRUCTION_FUEL)
            old_direction = self.direction
            if self.step < 10 and self.check_resources(church_cost[0] + pilgrim_cost[0], church_cost[1] + pilgrim_cost[1]):
                self.direction = self.get_random_valid_direction()
                if self.direction is None:
                    self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                    return None
                return self.build('pilgrim', old_direction)
            if self.step % 7 == 0 and self.check_resources(church_cost[0] + pilgrim_cost[0], church_cost[1] + pilgrim_cost[1]):
                self.direction = self.get_random_valid_direction()
                if self.direction is None:
                    self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                    return None
                return self.build('pilgrim', old_direction)
            if self.step % 5 == 0 and self.check_resources(church_cost[0] + pilgrim_cost[0] + crusader_cost[0], church_cost[1] + pilgrim_cost[1] + crusader_cost[1]):
                self.direction = self.get_random_valid_direction()
                if self.direction is None:
                    self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                    return None
                return self.build('crusader', old_direction)
            if self.step % 3 == 0 and self.check_resources(2*church_cost[0] + prophet_cost[0], 2*church_cost[1] + prophet_cost[1]):
                self.direction = self.get_random_valid_direction()
                if self.direction is None:
                    self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                    return None
                return self.build('prophet', old_direction)
            if self.step % 1 == 0 and self.check_resources(2*church_cost[0] + preacher_cost[0], 2*church_cost[1] + preacher_cost[1]):
                self.direction = self.get_random_valid_direction()
                if self.direction is None:
                    self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                    return None
                return self.build('preacher', old_direction)
        
    def church(self):
        #self.log('CHURCH')
        if self.direction is None:
            closest_karbonite = self.get_closest_karbonite(self.me['x'], self.me['y'])
            closest_fuel = self.get_closest_fuel(self.me['x'], self.me['y'])
            if closest_fuel is not None:
                self.direction = self.get_direction(self.me['x'], self.me['y'], *closest_fuel)
            elif closest_karbonite is not None:
                self.direction = self.get_direction(self.me['x'], self.me['y'], *closest_karbonite)
            else:
                self.direction = self.get_random_valid_direction()
                if self.direction is None:
                    self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                    return None
        offset = nav.get_offset(self.direction) #lookup (dx,dy) for direction
        target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        if not self.traversable(*target):
            self.direction = self.get_random_valid_direction()
            if self.direction is None:
                self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                return None
            offset = nav.get_offset(self.direction) #lookup (dx,dy) for direction
            target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) #calculate (x,y) from current location and (dx,dy)
        if self.traversable(*target):
            church_cost = (SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_FUEL)
            pilgrim_cost = (SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_FUEL)
            crusader_cost = (SPECS['UNITS'][SPECS['CRUSADER']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CRUSADER']].CONSTRUCTION_FUEL)
            prophet_cost = (SPECS['UNITS'][SPECS['PROPHET']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PROPHET']].CONSTRUCTION_FUEL)
            preacher_cost = (SPECS['UNITS'][SPECS['PREACHER']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PREACHER']].CONSTRUCTION_FUEL)
            old_direction = self.direction
            if self.step < 10 and self.check_resources(church_cost[0] + pilgrim_cost[0], church_cost[1] + pilgrim_cost[1]):
                self.direction = self.get_random_valid_direction()
                if self.direction is None:
                    self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                    return None
                return self.build('pilgrim', old_direction)
            if self.step % 7 == 0 and self.check_resources(church_cost[0] + pilgrim_cost[0], church_cost[1] + pilgrim_cost[1]):
                self.direction = self.get_random_valid_direction()
                if self.direction is None:
                    self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                    return None
                return self.build('pilgrim', old_direction)
            if self.step % 5 == 0 and self.check_resources(church_cost[0] + pilgrim_cost[0] + crusader_cost[0], church_cost[1] + pilgrim_cost[1] + crusader_cost[1]):
                self.direction = self.get_random_valid_direction()
                if self.direction is None:
                    self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                    return None
                return self.build('crusader', old_direction)
            if self.step % 3 == 0 and self.check_resources(2*church_cost[0] + prophet_cost[0], 2*church_cost[1] + prophet_cost[1]):
                self.direction = self.get_random_valid_direction()
                if self.direction is None:
                    self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                    return None
                return self.build('prophet', old_direction)
            if self.step % 1 == 0 and self.check_resources(2*church_cost[0] + preacher_cost[0], 2*church_cost[1] + preacher_cost[1]):
                self.direction = self.get_random_valid_direction()
                if self.direction is None:
                    self.log(self.me['unit'] + '(' + self.me['x'] + ',' + self.me['y'] + ')' + ': No valid direction')
                    return None
                return self.build('preacher', old_direction)
        
    def pilgrim(self):
        #self.log('PILGRIM')
        closest_karbonite = self.get_closest_karbonite(self.me['x'], self.me['y'])
        closest_fuel = self.get_closest_fuel(self.me['x'], self.me['y'])
        if closest_karbonite is not None:
            #self.log(self.me['unit'] + ': From ' + self.me['x'] + ',' + self.me['y'] + ' the closest karbonite is at ' + closest_karbonite[0] + ',' + closest_karbonite[1] + ' to the ' + self.get_direction(self.me['x'], self.me['y'], *closest_karbonite))
            pass
        more_karbonite = self.check_resources(self.fuel, 0)
        more_fuel = self.check_resources(0, self.karbonite)
        if more_fuel and closest_karbonite is not None:
            previous_direction = self.direction
            self.direction = self.get_direction(self.me['x'], self.me['y'], *closest_karbonite)
            if previous_direction is None or previous_direction != self.direction:
                self.log(self.me['unit'] + ': Targeting karbonite to the ' + self.direction)
                pass
        elif more_karbonite and closest_fuel is not None:
            previous_direction = self.direction
            self.direction = self.get_direction(self.me['x'], self.me['y'], *closest_fuel)
            if previous_direction is None or previous_direction != self.direction:
                self.log(self.me['unit'] + ': Targeting fuel to the ' + self.direction)
                pass
        if self.direction is None:
            self.direction = nav.get_random_direction()
            self.log(self.me['unit'] + ': Randomly picks: ' + self.direction)
            #self.log(self.me['unit'] + ': Moving ' + self.direction)
        opposite = nav.get_opposite_direction(self.direction)
        offset = nav.get_offset(opposite) #lookup (dx,dy) for opposite direction
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
            else: #home = castle or church for depositing resources
                #self.log(self.me['unit'] + ': Home = (' + home['y'] + ', ' + home['x'] + ')')
                pass
        has_resources = self.me['karbonite'] > 0 or self.me['fuel'] > 0
        on_karbonite = self.karbonite_map[self.me['y']][self.me['x']]
        on_fuel = self.fuel_map[self.me['y']][self.me['x']]
        church_cost = (SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_FUEL)
        if on_karbonite and self.me['karbonite'] < self.specs['KARBONITE_CAPACITY'] and self.check_resources(0, SPECS['MINE_FUEL_COST']):
            if self.me['karbonite'] == 0:
                self.log(self.me['unit'] + ': Mining karbonite')
                pass
            return self.mine()
        if on_fuel and self.me['fuel'] < self.specs['FUEL_CAPACITY'] and self.check_resources(0, SPECS['MINE_FUEL_COST']):
            if self.me['fuel'] == 0:
                self.log(self.me['unit'] + ': Mining fuel')
                pass
            return self.mine()
        if has_resources and home is not None:
            return self.deposit(opposite)
        more_karbonite = self.check_resources(self.fuel, 0)
        more_fuel = self.check_resources(0, self.karbonite)
        if home is None and ((on_karbonite and more_fuel) or (on_fuel and more_karbonite)) and self.can_build('church', opposite):
            return self.build('church', opposite)
        if self.step % 4:
            if more_fuel and closest_karbonite is not None:
                previous_direction = self.direction
                self.direction = self.get_direction(self.me['x'], self.me['y'], *closest_karbonite)
                if previous_direction is None or previous_direction != self.direction:
                    self.log(self.me['unit'] + ': Targeting karbonite to the ' + self.direction)
                    pass
            elif more_karbonite and closest_fuel is not None:
                previous_direction = self.direction
                self.direction = self.get_direction(self.me['x'], self.me['y'], *closest_fuel)
                if previous_direction is None or previous_direction != self.direction:
                    self.log(self.me['unit'] + ': Targeting fuel to the ' + self.direction)
                    pass
            if self.direction is None:
                self.direction = nav.get_random_direction()
                self.log(self.me['unit'] + ': Randomly picks: ' + self.direction)
        return self.random_walk()
        
    def crusader(self):
        #self.log('CRUSADER')
        #TODO: attack any enemy in range
        #TODO: walk toward any visible enemy
        if self.fuel > self.specs['FUEL_PER_MOVE']**2:
            return self.random_walk()#self.step % 8
        
    def prophet(self):
        #self.log('PROPHET')
        #TODO: attack any enemy in range
        #TODO: walk toward any visible enemy
        if self.fuel > self.specs['FUEL_PER_MOVE']**2:
            return self.random_walk()#self.step % 8
        
    def preacher(self):
        #self.log('PREACHER')
        #TODO: attack any enemy in range
        #TODO: walk toward any visible enemy
        if self.fuel > self.specs['FUEL_PER_MOVE']**2:
            return self.random_walk()#self.step % 8
        
    def runUnitFunction(self, unit):
        unitFunctions = {
            SPECS['CASTLE']: self.castle,
            SPECS['CHURCH']: self.church,
            SPECS['PILGRIM']: self.pilgrim,
            SPECS['CRUSADER']: self.crusader,
            SPECS['PROPHET']: self.prophet,
            SPECS['PREACHER']: self.preacher
        }
        unitFunction = unitFunctions.get(unit, lambda: 'Invalid unit type: ' + unit)
        self.specs = SPECS['UNITS'][self.me['unit']]
        return unitFunction()
    
    def turnStart(self):
        #code common to ALL unit types BEFORE unit specific code
        self.step += 1
        
    def turnEnd(self):
        #code common to ALL unit units AFTER unit specific code
        pass
        
    def turn(self):
        self.turnStart()
        returnValue = self.runUnitFunction(self.me['unit'])
        self.turnEnd()
        return returnValue

robot = myRobot