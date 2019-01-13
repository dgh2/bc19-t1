import random

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

def get_offset(direction):
    return directions.get(direction, lambda: None)

def get_opposite_direction(direction):
    return opposite_directions.get(direction, lambda: None)

def get_random_direction():
    return random.choice(list(directions.keys()))

def get_distance(x1, y1, x2, y2):
    return (x2-x1)**2 + (y2-y1)**2

def get_random_directions():
    randomized = list(directions.keys())
    random.shuffle(randomized)
    return randomized