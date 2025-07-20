export class Ship {
  constructor(length) {
    this.length = length;
    this.hits = [];
    this.sunk = false;
  }

  hit(x = null, y = null) {
    if (x !== null && y !== null) {
      this.hits.push([x, y]);
    }
    if (!this.sunk && this.hits.length >= this.length) {
      this.sunk = true;
    }
  }

  isSunk() {
    return this.sunk;
  }
}

export class Gameboard {
  constructor() {
    this.board = Array(10).fill().map(() => Array(10).fill(null));
    this.ships = [];
    this.missedAttacks = [];
  }

  placeShip(ship, x, y, orientation) {
    for (let i = 0; i < ship.length; i++) {
      const posX = orientation === 'horizontal' ? x + i : x;
      const posY = orientation === 'vertical' ? y + i : y;
      this.board[posY][posX] = ship;
    }
    this.ships.push(ship);
  }

  receiveAttack(x, y) {
    const cell = this.board[y][x];
    if (cell instanceof Ship) {
      cell.hit(x, y);
      return true;
    }
    this.missedAttacks.push([x, y]);
    return false;
  }

  allShipsSunk() {
    return this.ships.every(ship => ship.isSunk());
  }

  reset() {
    this.board = Array(10).fill().map(() => Array(10).fill(null));
    this.ships = [];
    this.missedAttacks = [];
  }
}

export class Player {
  constructor(name, isAI = false) {
    this.name = name;
    this.isAI = isAI;
    this.gameboard = new Gameboard();
    this.availableShips = [
      { name: 'Carrier', size: 5 },
      { name: 'Battleship', size: 4 },
      { name: 'Cruiser', size: 3 },
      { name: 'Submarine', size: 3 },
      { name: 'Destroyer', size: 2 }
    ];
    this.lastAttack = { x: null, y: null };
    this.attackedPositions = [];
    this.pendingTargets = []; 
  }

  placeShipsRandomly() {
    this.availableShips.forEach(ship => {
      let placed = false;
      while (!placed) {
        const x = Math.floor(Math.random() * 10);
        const y = Math.floor(Math.random() * 10);
        const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        if (this.canPlaceShip(x, y, ship.size, orientation)) {
          this.gameboard.placeShip(new Ship(ship.size), x, y, orientation);
          placed = true;
        }
      }
    });
  }
  

  canPlaceShip(x, y, size, orientation) {
    if (orientation === 'horizontal' && x + size > 10) return false;
    if (orientation === 'vertical' && y + size > 10) return false;

    for (let i = 0; i < size; i++) {
      const checkX = orientation === 'horizontal' ? x + i : x;
      const checkY = orientation === 'vertical' ? y + i : y;
      if (this.gameboard.board[checkY][checkX] !== null) return false;
    }
    return true;
  }

  removeShipType(type) {
    this.availableShips = this.availableShips.filter(ship => ship.name !== type);
  }

  hasShipType(type) {
    return this.availableShips.some(ship => ship.name === type);
  }

  attack(x, y, enemyGameboard, cellElement = null) {
    if (x < 0 || x > 9 || y < 0 || y > 9) return false;
    if (this.attackedPositions.some(pos => pos[0] === x && pos[1] === y)) return false;

    this.attackedPositions.push([x, y]);
    this.lastAttack = { x, y };
    const hitShip = enemyGameboard.receiveAttack(x, y);

    if (cellElement) {
      cellElement.style.backgroundColor = hitShip ? 'green' : 'yellow';
      cellElement.textContent = hitShip ? '💥' : '•';
    }
    return hitShip;
  }

aiAttack(enemyGameboard, boardElement) {
  let x, y;

  if (this.pendingTargets.length > 0) {
    [x, y] = this.pendingTargets.shift();
  } else {
    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
    } while (this.attackedPositions.some(pos => pos[0] === x && pos[1] === y));
  }

  const cell = boardElement.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
  const hit = this.attack(x, y, enemyGameboard, cell);

  if (hit) {
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    dirs.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < 10 && ny >= 0 && ny < 10 &&
          !this.attackedPositions.some(pos => pos[0] === nx && pos[1] === ny)) {
        this.pendingTargets.push([nx, ny]);
      }
    });
  }

  return hit;
}
  checkSunkShips(enemyBoard, boardElement) {
    enemyBoard.ships.forEach(ship => {
      if (ship.isSunk()) {
        for (let y = 0; y < 10; y++) {
          for (let x = 0; x < 10; x++) {
            if (enemyBoard.board[y][x] === ship) {
              const cell = boardElement.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
              if (cell) {
                cell.style.backgroundColor = 'darkred';
                cell.textContent = '☠️';
              }
            }
          }
        }
      }
    });
}
}
