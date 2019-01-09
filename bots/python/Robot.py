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
        N: (0,-1),
        NE: (1, -1),
        E: (1, 0),
        SE: (1, 1),
        S: (0, 1),
        SW: (-1, 1),
        W: (-1, 0),
        NW: (-1, -1)
    }
    
    def getRandomDirection():
        return random.choice(list(d.keys()))
    
    #you must return self.move(direction) or self.attack(direction) to do something
    def castle():
        #CASTLE code
        print "CASTLE"
        if self.step < 10:
            self.log("Building a crusader at " + str(self.me['x']+1) + ", " + str(self.me['y']+1))
            return self.build_unit(SPECS['CRUSADER'], 1, 1)
        else:
            self.log("Castle health: " + self.me['health'])
        
    def church():
        #CHURCH code
        print "CHURCH"
        if self.step < 10:
            self.log("Building a crusader at " + str(self.me['x']+1) + ", " + str(self.me['y']+1))
            return self.build_unit(SPECS['CRUSADER'], 1, 1)
        else:
            self.log("Castle health: " + self.me['health'])
        
    def pilgrim():
        #PILGRIM code
        print "PILGRIM"
        if self.direction is None:
            self.direction = getRandomDirection()
            self.log('TRYING TO MOVE IN DIRECTION ' + str(choice))
        return self.move(*directions.get(self.direction, lambda: None))
        
    def crusader():
        #CRUSADER code
        print "CRUSADER"
        
    def prophet():
        #PROPHET code
        print "PROPHET"
        
    def preacher():
        #PREACHER code
        print "PREACHER"
        
    def runUnitFunction(type):
        unitFunctions = {
            SPECS['CASTLE']: castle,
            SPECS['CHURCH']: church,
            SPECS['PILGRIM']: pilgrim,
            SPECS['CRUSADER']: crusader,
            SPECS['PROPHET']: prophet,
            SPECS['PREACHER']: preacher
        }
        unitFunction = unitFunctions.get(type, lambda: "Invalid unit type: " + type)
        return unitFunction()
    
    def turnStart():
        #code common to ALL unit types BEFORE unit specific code
        self.step += 1
        
    def turnEnd():
        #code common to ALL unit types AFTER unit specific code
        
    def turn(self):
        turnStart()
        returnValue = runUnitFunction(self.me['unit'])
        turnEnd()
        return returnValue

robot = myRobot