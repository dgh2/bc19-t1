from battlecode import BCAbstractRobot, SPECS
import battlecode as bc
import random

__pragma__('iconv')
__pragma__('tconv')
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
    
    def getRandomDirection(self):
        return random.choice(list(d.keys()))
    
    #you must return self.move(direction) or self.attack(direction) to do something
    def castle(self):
        #CASTLE code
        self.log("CASTLE")
        if self.step < 10:
            self.log("Building a crusader at " + str(self.me['x']+1) + ", " + str(self.me['y']+1))
            return self.build_unit(SPECS['CRUSADER'], 1, 1)
        else:
            self.log("Castle health: " + self.me['health'])
        
    def church(self):
        #CHURCH code
        self.log("CHURCH")
        if self.step < 10:
            self.log("Building a crusader at " + str(self.me['x']+1) + ", " + str(self.me['y']+1))
            return self.build_unit(SPECS['CRUSADER'], 1, 1)
        else:
            self.log("Castle health: " + self.me['health'])
        
    def pilgrim(self):
        #PILGRIM code
        self.log("PILGRIM")
        if self.direction is None:
            self.direction = getRandomDirection()
            self.log('TRYING TO MOVE IN DIRECTION ' + str(choice))
        return self.move(*directions.get(self.direction, lambda: None))
        
    def crusader(self):
        #CRUSADER code
        self.log("CRUSADER")
        
    def prophet(self):
        #PROPHET code
        self.log("PROPHET")
        
    def preacher(self):
        #PREACHER code
        self.log("PREACHER")
        
    def runUnitFunction(self, type):
        unitFunctions = {
            SPECS['CASTLE']: self.castle,
            SPECS['CHURCH']: self.church,
            SPECS['PILGRIM']: self.pilgrim,
            SPECS['CRUSADER']: self.crusader,
            SPECS['PROPHET']: self.prophet,
            SPECS['PREACHER']: self.preacher
        }
        unitFunction = unitFunctions.get(type, lambda: "Invalid unit type: " + type)
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
