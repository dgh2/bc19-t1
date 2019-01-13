import {BCAbstractRobot, SPECS} from 'battlecode';

var step = -1;

// #__pragma__('iconv')
// #__pragma__('tconv')
// #__pragma__('opov')

// Don't try to use Global Variables! 
    var robot = new MyRobot();

	class myRobot extends BCAbstractRobot {
    turn() {
		step++;

		direction = 'None'; 

		directions = [ 
        'N' == (0,-1),
        'NE'== (1, -1),
        'E' == (1, 0),
        'SE'== (1, 1),
        'S' == (0, 1),
        'SW' == (-1, 1),
        'W' == (-1, 0),
        'NW' == (-1, -1)];

        opposite_directions = [        
        'N' == 'S',
        'NE' == 'SW',
        'E' == 'W',
        'SE' == 'NW',
        'S' == 'N',
        'SW' == 'NE',
        'W' == 'E',
        'NW' == 'SE'];

        class get_opposite_direction (self, direction) {
        	return (self.opposite_directions.get(direction, lambda == 'None'));
        }

        class get_random_direction(self) {
        return (random.choice(list(self.directions.keys())));
		}

		class can_build(self, type, direction = 'None') {
        	required_karbonite = SPECS['UNITS'][SPECS[type.upper()]].CONSTRUCTION_KARBONITE;
        	required_fuel = SPECS['UNITS'][SPECS[type.upper()]].CONSTRUCTION_FUEL;

        		if (is not self.check_resources(required_karbonite, required_fuel)) {
            		return false;
            	}
        				if (direction != 'None') {
            				offset = self.directions.get(direction, lambda: 'None') //lookup (dx,dy) for direction;
            				target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) //calculate (x,y) from current location and  (dx,dy);
            			}
            			if (not self.traversable(* target)) {
                			return (false);
            			}
        				return (true);
        		}

        class check_resources (self, karbonite = 0, fuel = 0) {
        	if (self.karbonite < karbonite) {
        		return (false); // Not enough karbonite
        		if (self.fuel < fuel) {
        			return false; //Not enough fuel
        		}
        		return true; 
        	}
        }

        class walk (self, direction) { // Take one step in a given direction
        	if (direction is 'None') {
        		direction = self.get_random_direction();
        			//self.log(self.me['unit'] + ': Moving ' + direction)
        		offset = self.direction.get(direction, lambda,: 'None'); //look-up (dx, dy) for direction 
        		target = (self.me['x'] + offset[0], self.me['y'] + offset[1]); //calculate (x,y) from current location and (dx, dy)
        		//self.log(self.me['unit'] + ': At (' + self.me['x'] + ',' + self.me['y'] + ')')
        		//#self.log(self.me['unit'] + ': Moving ' + direction + ' to (' + (self.me['x'] + offset[0]) + ',' + (self.me['y'] + offset[1]) + ')')
        		required_fuel = self.SPECS['FUEL_PER_MOVE'];
        		if self.check_resources(0, required_fuel) and self.traversable(* target){
        			return (self.move(* offset))
        		}
        	}
        }

        class traversable (self, x, y, ignore_robots = false) {
        	if (x < 0 || >= len(self.map[y])) {
        		return false; //out of x bounds
        	}
        	if (y < 0 || >= len(self.map)) {
        		return false; //out of bounds
        	}
        	if (not ignore_robots && self.get_visible_robot_map()['y']['x'] < 0) {
        		return false //target is blocked by a robot and we care 
        		return true; 
        	}
        }

        class random_walk (self, changeDirection = false) {
        	if (self.direction is 'None') {
        		self.direction = self.get_random_direction();
        		//self.log(self.me['unit'] + ': Moving ' + self.direction)
        		offset = self.direction.get(self.direction, lambda: 'None') //lookup (dx,dy) for direction
        		target = (self.me['x'] + offset[0], self.me['y'] + offset[1]) //calculate (x,y) from currant location and (dx, dy)
        		//try a few times to get a random traversable direction
        		if (changeDirection) {
        			self.direction = self.get_random_direction();
        			//self.log(self.me['unit'] + ': Moving ' + self.direction)
        			offset = self.direction.get(self.direction, lambda:'None');
        			target = (self.me['x'] + offset[0], self.me['y'] + offset[1]); //calculate (x,y) from current location and (dx,dy)
        		}
        		if (not self.traversable( * target)) {
        			self.direction = self.get_random_direction();
        			//self.log(self.me['unit'] + ': Moving ' + self.direction)
        			offset = self.direction.get(self.direction, lambda: 'None'); //lookup (dx,dy) for direction
        			target = (self.me['x'] + offset[0], self.me['y'] + offset[1]); //calculate (x,y) from current location and (dx,dy)
        		}
        		if not self.traversable(*target) {
             		self.direction = self.get_random_direction();
             		//self.log(self.me['unit'] + ': Moving ' + self.direction)
             		offset = self.directions.get(self.direction, lambda: None); //lookup (dx,dy) for direction
             		target = (self.me['x'] + offset[0], self.me['y'] + offset[1]); //calculate (x,y) from current location and (dx,dy)
             		} 
         		if not self.traversable(*target) {
             		self.direction = self.get_random_direction();
             		//self.log(self.me['unit'] + ': Moving ' + self.direction)
             		offset = self.directions.get(self.direction, lambda: None); //lookup (dx,dy) for direction
             		target = (self.me['x'] + offset[0], self.me['y'] + offset[1]); //calculate (x,y) from current location and (dx,dy)
             	}
         			//walk in direction if traversable
         			if self.traversable(*target) {
             		return self.walk(self.direction);
             	}
					}
        		}

        class build (self, type, direction) {
        	if (self.can_build(type, direction)) {
        		self.log(self.me['unit'] + ' :Building a ' + type.lower() + 'to the ' + direction);
        		offset = self.direction.get(direction, lambda: 'None') //look-up (dx, dy) for direction
        		return (self.build_unit(SPECS[type.upper()], * offset));
        		}
        	}

     		class deposit (self, direction      			
                if (self.me['karbonite'] < 0 or self.me['fuel'] < 0) {
     				total_k = self.me['karbonite'] + self.karbonite;
     				total_f = self.me['fuel'] + self.fuel;
     				if (self.me ['karbonite'] < 0 && self.me['fuel'] < 0) {
     					self.log(self.me['unit'] + ': Depositing ' + self.me['karbonite'] + ' karbonite and ' + self.me['fuel'] + ' fuel (' + total_k ' , + total_f + '')');
     					else {
     						self.log (self.me['unit'] + ': Depositing ' + self.me['karbonite'] + ' karbonite (' + total_k + ',' + total_f + ')');
     					}
     					offset = self.direction.get(direction, lambda: 'None') //lookup (dx, dy) for direction
     					return (self.give ( * offset, set.me['karbonite'], self.me['fuel'])); 
     					}
     				}

                class castle (self) {
                    //self.log('CASTLE')
                    if self.direction == 'None'; {
                        self.direction = self.get_random_direction();
                        //self.log(self.me['UNIT'] + ': Moving ' + self.direction)
                    offset = self.direction.get(self.direction, lambda == 'None'); //look-up (dx, dy) for direction 
                    target = self.me['x'] + offset[0], self.me['y'] + offset[1]; //Calculate (x, y) from current location and (dx, dy)
                }
                    if not self.traversable(* target) {
                        self.direction = self.get_random_direction();
                        //self.log(self.me['UNIT'] + ': Moving ' + self.direction)
                        offset = self.direction.get(self.direction, lambda == 'None'); //look-up (dx, dy) for direction 
                        target = self.me['x'] + offset[0], self.me['y'] + offset[1]; //Calculate (x, y) from current location and (dx, dy)
                    }
                    if not self.traversable(* target) {
                        self.direction = self.get_random_direction();
                        //self.log(self.me['UNIT'] + ': Moving ' + self.direction)
                        offset = self.direction.get(self.direction, lambda == 'None'); //look-up (dx, dy) for direction 
                        target = self.me['x'] + offset[0], self.me['y'] + offset[1]; //Calculate (x, y) from current location and (dx, dy)               
                    }
                    if self.traversable (* target) {
                        church_cost = (SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_FUEL);
                        pilgrim_cost = (SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_FUEL);
                        crusader_cost = (SPECS['UNITS'][SPECS['CRUSADER']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CRUSADER']].CONSTRUCTION_FUEL);
                        prophet_cost = (SPECS['UNITS'][SPECS['PROPHET']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PROPHET']].CONSTRUCTION_FUEL);
                        preacher_cost = (SPECS['UNITS'][SPECS['PREACHER']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PREACHER']].CONSTRUCTION_FUEL);
                        old_direction = self.direction;
                        if (self.step < 10 and self.check_resources(church_cost[0] + pilgrim_cost[0], church_cost[1] + pilgrim_cost[1])){
                            self.direction = self.get_random_direction;
                            return(self.build('pilgrim', old_direction));
                        }
                        if (self.step % 7 == 0 and self.check_resources(church_cost[0], + pilgrim_cost[0], church_cost[1] + pilgrim_cost[1])) {
                            self.direction = self.get_random_direction();
                            return(self.build, old_direction);
                        }
                        if self.step % 5 == 0 and self.check_resources(church_cost[0] + pilgrim_cost[0] + crusader_cost[0], church_cost[1] + pilgrim_cost[1] + crusader_cost[1]) {
                        self.direction = self.get_random_direction();
                        return self.build('crusader', old_direction);
                    }
                        if self.step % 3 == 0 and self.check_resources(2*church_cost[0] + prophet_cost[0], 2*church_cost[1] + crusader_cost[1]) {
                        self.direction = self.get_random_direction();
                        return self.build('prophet', old_direction);
                    }
                        if self.step % 1 == 0 and self.check_resources(2*church_cost[0] + preacher_cost[0], 2*church_cost[1] + preacher_cost[1]) {
                        self.direction = self.get_random_direction();
                        return self.build('preacher', old_direction);
                        }
                    }

                class church (self) {
                    //self.log ('CHURCH');
                    if (self.direction == 'None') {
                        self.direction = self.get_random_direction();
                        //self.log(self.me['unit'] + ': Moving ' + self.direction)
                        offset = self.directions.get(self.direction, lambda: None); //look-up (dx,dy) for direction
                        target = (self.me['x'] + offset[0], self.me['y'] + offset[1]); //calculate (x,y) from current location and (dx,dy)
                    }
                    if not self.traversable(*target) {
                        self.direction = self.get_random_direction();
                        //self.log(self.me['unit'] + ': Moving ' + self.direction);
                        offset = self.directions.get(self.direction, lambda: None); //lookup (dx,dy) for direction
                        target = (self.me['x'] + offset[0], self.me['y'] + offset[1]); //calculate (x,y) from current location and (dx,dy)
                    }
                    if not self.traversable(*target) {
                        self.direction = self.get_random_direction();
                        //self.log(self.me['unit'] + ': Moving ' + self.direction)
                        offset = self.directions.get(self.direction, lambda: None); //lookup (dx,dy) for direction
                        target = (self.me['x'] + offset[0], self.me['y'] + offset[1]); //calculate (x,y) from current location and (dx,dy)
                    }
                    if not self.traversable(*target) {
                        self.direction = self.get_random_direction();
                        //self.log(self.me['unit'] + ': Moving ' + self.direction)
                        offset = self.directions.get(self.direction, lambda: None); //lookup (dx,dy) for direction
                        target = (self.me['x'] + offset[0], self.me['y'] + offset[1]); //calculate (x,y) from current location and (dx,dy)
                    }
                    if (self.traversable(* target)) {
                    church_cost = (SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_FUEL);
                    pilgrim_cost = (SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PILGRIM']].CONSTRUCTION_FUEL);
                    crusader_cost = (SPECS['UNITS'][SPECS['CRUSADER']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CRUSADER']].CONSTRUCTION_FUEL);
                    prophet_cost = (SPECS['UNITS'][SPECS['PROPHET']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PROPHET']].CONSTRUCTION_FUEL);
                    preacher_cost = (SPECS['UNITS'][SPECS['PREACHER']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['PREACHER']].CONSTRUCTION_FUEL);
                    old_direction = self.direction;
                }
                    if self.step < 10 and self.check_resources(church_cost[0] + pilgrim_cost[0], church_cost[1] + pilgrim_cost[1]) {
                    self.direction = self.get_random_direction();
                    return self.build('pilgrim', old_direction);
                }
                    if self.step % 7 == 0 and self.check_resources(church_cost[0] + pilgrim_cost[0], church_cost[1] + pilgrim_cost[1]) {
                    self.direction = self.get_random_direction();
                    return self.build('pilgrim', old_direction);
                }
                    if self.step % 5 == 0 and self.check_resources(church_cost[0] + pilgrim_cost[0] + crusader_cost[0], church_cost[1] + pilgrim_cost[1] + crusader_cost[1]) {
                    self.direction = self.get_random_direction();
                    return self.build('crusader', old_direction);
                }
                    if self.step % 3 == 0 and self.check_resources(2*church_cost[0] + prophet_cost[0], 2*church_cost[1] + crusader_cost[1]) {
                    self.direction = self.get_random_direction();
                    return self.build('prophet', old_direction);
                }
                    if self.step % 1 == 0 and self.check_resources(2*church_cost[0] + preacher_cost[0], 2*church_cost[1] + preacher_cost[1]) {
                    self.direction = self.get_random_direction();
                    return self.build('preacher', old_direction);
                }
                }

                class pilgrim (self) {
                    //self.log('PILGRIM')
                    if self.direction == 'None' {
                        self.direction = self.get_random_direction();
                        //self.log(self.me['unit'] + ': Moving ' + self.direction)
                        opposite = self.get_opposite_direction (self.direction);
                        offset = self.directions.get (opposite, lambda: None); //lookup (dx,dy) for opposite direction
                        target = (self.me['x'] + offset[0], self.me['y'] + offset[1]); //calculate (x,y) from current location and (dx,dy)
                        home = 'None'; //try to find a castle or church behind this robot
                        id = -1;
                    }
                    if self.traversable(*target, True) {
                        id = self.get_visible_robot_map()[target[1]][target[0]];
                    }
                    if id > 0:  {//target has a robot
                        home = self.get_robot(id); //the robot behind this robot;
                        //self.log(self.me['unit'] + ': Behind = (' + home['x'] + ', ' + home['y'] + ')')
                    }
                    if home['team'] != self.me['team'] {
                        home = None #other team;
                        //todo: speed up?
                    }
                    elif home['unit'] != SPECS['CASTLE'] and home['unit'] != SPECS['CHURCH'] {
                        home = 'None'; //not castle or church
                        //todo: speed up?
                        //else: #home = castle or church for depositing resources
                        //self.log(self.me['unit'] + ': Home = (' + home['y'] + ', ' + home['x'] + ')')
                        has_resources = self.me['karbonite'] > 0 or self.me['fuel'] > 0;
                        on_karbonite = self.karbonite_map[self.me['y']][self.me['x']];
                        on_fuel = self.fuel_map[self.me['y']][self.me['x']];
                        church_cost = (SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_KARBONITE, SPECS['UNITS'][SPECS['CHURCH']].CONSTRUCTION_FUEL);
                    }

                    if on_karbonite && self.me['karbonite'] < self.specs['KARBONITE_CAPACITY'] and self.check_resources(0, SPECS['MINE_FUEL_COST']) {
                    if self.me['karbonite'] == 0 {
                        self.log(self.me['unit'] + ': Mining karbonite');
                        return self.mine();
                    }
                }
                    if on_fuel and self.me['fuel'] < self.specs['FUEL_CAPACITY'] and self.check_resources(0, SPECS['MINE_FUEL_COST']) {
                    if self.me['fuel'] == 0 {
                        self.log(self.me['unit'] + ': Mining fuel');
                        return self.mine();
                    }
                }
                    if has_resources and home is not 'None' {
                        return self.deposit(opposite);
                    }
                    if self.can_build('church', opposite) and (on_karbonite or (on_fuel and self.check_resources(2*church_cost[0], church_cost[1]))) {
                        return self.build('church', opposite);
                        //TODO: if direction is occupied, go around or through
                    }
                    if home == 'None' && not on_karbonite {
                    if self.check_resources(0, SPECS['FUEL_PER_MOVE'] + church_cost[1]) {
                    if on_fuel {
                        //self.log(self.me['unit'] + ': Moving ' + self.direction)
                        self.direction = opposite;
                        return self.random_walk(self.step % 4);
                    }
                }
            }
        

    
//     def turnStart(self):
//         #code common to ALL unit types BEFORE unit specific code
//         self.step += 1
        
//     def turnEnd(self):
//         #code common to ALL unit types AFTER unit specific code
//         pass
        
//     def turn(self):
//         self.turnStart()
//         returnValue = self.runUnitFunction(self.me['unit'])
//         self.turnEnd()
//         return returnValue

// robot = myRobot

            class crusader (self) {
                //self.log('CRUSADER')
                //TODO: attack any enemy in range
                //TODO: walk toward any visible enemy
                if (self.fuel > self.specs['FUEL_PER_MOVE']) {
                    return (self.random_walk(self.step % 4);
            }            
        }
            class prophet (self) {
                //self.log('PROPHET')
                //TODO: attack any enemy in range
                //TODO: walk toward any visible enemy
                if (self.fuel > self.specs['FUEL_PER_MOVE']) {
                    return (self.random_walk(self.step % 4));
                }
            class preacher (self) {
                //self.log('PREACHER')
                //TODO: attack any enemy in range
                //TODO: walk toward any visible enemy
                if (self.fuel > self.specs['FUEL_PER_MOVE']) {
                    return (self.random_walk(self.step % 4));
                }
            class runUnitFunction(self, type) {
                unitFunctions = [
                SPECS['CASTLE'] == self.castle,
                SPECS['CHURCH'] == self.church,
                SPECS['PILGRIM'] == self.pilgrim,
                SPECS['CRUSADER'] == self.crusader,
                SPECS['PROPHET'] == self.prophet,
                SPECS['PREACHER'] == self.preacher
                    ]
                 unitFunction = unitFunctions.get(type, lambda == 'Invalid unit type: ' + type);
                 stepelf.specs = SPECS['UNITS'][self.me['unit']];
                 return unitFunction();
                }

            class turnStart(self) {
         //code common to ALL unit types BEFORE unit specific code
                    self.step += 1;
        }
            class turnEnd(self) {
         //code common to ALL unit types AFTER unit specific code
                    pass;
                }
            class turn(self) {
                self.turnStart();
                 returnValue = self.runUnitFunction(self.me['unit']);
                 self.turnEnd();
                 return returnValue;
             }
            }

        robot = myRobot;


            }
        }

                }
     			}
     		}
        }
        }
	}