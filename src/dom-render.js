
import carrierImg from './assets/carrier.png';
import battleshipImg from './assets/battleship.png';
import cruiserImg from './assets/cruiser.png';
import submarineImg from './assets/submarine.png';
import destroyerImg from './assets/destroyer.png';

import { Player, Ship } from './index';
import './styles.css';

document.addEventListener('DOMContentLoaded', () => {
  let gameOver = false;
  let playerTurn = true;
  let allPlayerShipsPlaced = false;
  let playerShipPlacements = []; 
  
  const player1Ships = document.getElementById('player1-ships');
  const container1 = document.getElementById('player1-board');
  const container2 = document.getElementById('player2-board');
  const flipButton = document.querySelector('.player1-button');
  const turnDisplay = document.getElementById('turn-display');
  const gameControls = document.getElementById('game-controls');
  
  const startButton = document.createElement('button');
  startButton.textContent = 'Start Game';
  startButton.classList.add('start-button');
  startButton.disabled = true;
  gameControls.appendChild(startButton);

  const gameMessage = document.createElement('div');
  gameMessage.classList.add('game-message');
  document.body.appendChild(gameMessage);

  const humanPlayer = new Player('Player');
  const aiPlayer = new Player('AI', true);

  const ships = [
    { name: 'Carrier', size: 5, img: carrierImg, color: 'rgba(255, 100, 100, 0.6)' },
    { name: 'Battleship', size: 4, img: battleshipImg, color: 'rgba(100, 255, 100, 0.6)' },
    { name: 'Cruiser', size: 3, img: cruiserImg, color: 'rgba(100, 100, 255, 0.6)' },
    { name: 'Submarine', size: 3, img: submarineImg, color: 'rgba(255, 255, 100, 0.6)' },
    { name: 'Destroyer', size: 2, img: destroyerImg, color: 'rgba(255, 100, 255, 0.6)' },
  ];

  function createShipIcons() {
    player1Ships.innerHTML = '';
    ships.forEach(ship => {
      if (humanPlayer.hasShipType(ship.name)) {
        const img = document.createElement('img');
        img.src = ship.img;
        img.alt = ship.name;
        img.classList.add('ship-icon');
        img.draggable = true;
        img.dataset.size = ship.size;
        img.dataset.name = ship.name;
        img.dataset.img = ship.img;
        img.dataset.color = ship.color;
        img.dataset.orientation = 'horizontal';
        player1Ships.appendChild(img);
      }
    });
  }

  function createBoard(container, isPlayerBoard = false) {
    container.innerHTML = '';
    container.classList.add('board-grid');

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('cell');
        cellDiv.dataset.x = x;
        cellDiv.dataset.y = y;
        
        if (!isPlayerBoard && allPlayerShipsPlaced) {
          cellDiv.addEventListener('click', () => handlePlayerAttack(x, y, cellDiv));
        }
        
        container.appendChild(cellDiv);
      }
    }
  }

function handlePlayerAttack(x, y, cell) {
  if (!playerTurn || gameOver || !allPlayerShipsPlaced) return;

  if (humanPlayer.attackedPositions.some(pos => pos[0] === x && pos[1] === y)) {
    turnDisplay.textContent = "You hit a target , go again!";
    return; 
  }

  const hit = humanPlayer.attack(x, y, aiPlayer.gameboard, cell);
  console.log(`Player attacked (${x},${y}) - Hit result:`, hit, typeof hit);

  if (hit) {
    humanPlayer.checkSunkShips(aiPlayer.gameboard, container2);
    if (aiPlayer.gameboard.allShipsSunk()) {
      gameOver = true;
      showGameMessage("Player wins! 🎉");
      return;
    }
    turnDisplay.textContent = "Hit! Go again!";
  } else {
    playerTurn = false;
    turnDisplay.textContent = "AI's turn...";
    setTimeout(() => handleAITurn(), 600);
  }
}
function handleAITurn() {
  if (gameOver) return;

  const hit = aiPlayer.aiAttack(humanPlayer.gameboard, container1);
  const attackedCell = container1.querySelector(
    `.cell[data-x="${aiPlayer.lastAttack.x}"][data-y="${aiPlayer.lastAttack.y}"]`
  );
  
  console.log(`AI attacked (${aiPlayer.lastAttack.x},${aiPlayer.lastAttack.y}) - Hit: ${hit}`);

  if (hit) {
    aiPlayer.checkSunkShips(humanPlayer.gameboard, container1);
    if (humanPlayer.gameboard.allShipsSunk()) {
      gameOver = true;
      showGameMessage("AI wins! 😢");
      return;
    }
    turnDisplay.textContent = "AI hit! Going again...";
    setTimeout(() => handleAITurn(), 800);
  } else {
    playerTurn = true;
    turnDisplay.textContent = "Your turn!";
  }
}


  function showGameMessage(message) {
    gameMessage.textContent = message;
    gameMessage.style.display = 'block';
    setTimeout(() => {
      gameMessage.style.display = 'none';
    }, 3000);
  }

  function restorePlayerShips() {
    playerShipPlacements.forEach(placement => {
      const ship = new Ship(placement.size);
      humanPlayer.gameboard.placeShip(ship, placement.x, placement.y, placement.orientation);
      
      for (let i = 0; i < placement.size; i++) {
        const targetX = placement.orientation === 'horizontal' ? placement.x + i : placement.x;
        const targetY = placement.orientation === 'vertical' ? placement.y + i : placement.y;
        const targetCell = container1.querySelector(`.cell[data-x="${targetX}"][data-y="${targetY}"]`);
        if (targetCell) {
          targetCell.style.backgroundColor = placement.color;
          targetCell.dataset.shipColor = placement.color;
        }
      }
      
      const shipDisplay = document.createElement('div');
      shipDisplay.className = 'ship-display';
      const cellSize = 45;
      const gapSize = 2;
      
      let width, height;
      if (placement.orientation === 'horizontal') {
        width = placement.size * (cellSize + gapSize) - gapSize;
        height = cellSize;
      } else {
        width = cellSize;
        height = placement.size * (cellSize + gapSize) - gapSize;
      }

      let left = placement.x * (cellSize + gapSize);
      let top = placement.y * (cellSize + gapSize);

      shipDisplay.style.cssText = `
        width: ${width}px;
        height: ${height}px;
        left: ${left}px;
        top: ${top}px;
        background-image: url(${placement.img});
        background-size: ${placement.orientation === 'horizontal' ? 'auto 100%' : '100% auto'};
        background-repeat: no-repeat;
        background-position: center;
        position: absolute;
        pointer-events: none;
        z-index: 5;
      `;

      container1.appendChild(shipDisplay);
    });
  }

  flipButton.addEventListener('click', () => {
    const ships = document.querySelectorAll('#player1-ships .ship-icon');
    ships.forEach(ship => {
      const isFlipped = ship.dataset.orientation === 'vertical';
      ship.dataset.orientation = isFlipped ? 'horizontal' : 'vertical';
      ship.style.transform = isFlipped ? 'none' : 'rotate(90deg)';
    });
  });

  let draggedShip = null;
  player1Ships.addEventListener('dragstart', e => {
    if (e.target.classList.contains('ship-icon')) {
      draggedShip = {
        size: parseInt(e.target.dataset.size, 10),
        name: e.target.dataset.name,
        img: e.target.dataset.img,
        color: e.target.dataset.color,
        orientation: e.target.dataset.orientation || 'horizontal'
      };
      e.dataTransfer.setData('text/plain', '');
    }
  });

  container1.addEventListener('dragover', e => {
    e.preventDefault();
    const cell = e.target.closest('.cell');
    if (!cell || !draggedShip) return;

    const x = parseInt(cell.dataset.x, 10);
    const y = parseInt(cell.dataset.y, 10);

    container1.querySelectorAll('.temp-highlight').forEach(c => {
      c.classList.remove('temp-highlight');
      if (!c.dataset.shipColor) c.style.backgroundColor = '';
    });

    for (let i = 0; i < draggedShip.size; i++) {
      const targetX = draggedShip.orientation === 'horizontal' ? x + i : x;
      const targetY = draggedShip.orientation === 'vertical' ? y + i : y;
      if (targetX >= 10 || targetY >= 10) break;

      const targetCell = container1.querySelector(`.cell[data-x="${targetX}"][data-y="${targetY}"]`);
      if (targetCell) {
        targetCell.classList.add('temp-highlight');
        if (!targetCell.dataset.shipColor) {
          targetCell.style.backgroundColor = 'rgba(200, 200, 200, 0.5)';
        }
      }
    }
  });

  container1.addEventListener('drop', e => {
    e.preventDefault();
    const cell = e.target.closest('.cell');
    if (!cell || !draggedShip) return;

    const x = parseInt(cell.dataset.x, 10);
    const y = parseInt(cell.dataset.y, 10);

    if (
      (draggedShip.orientation === 'horizontal' && x + draggedShip.size > 10) ||
      (draggedShip.orientation === 'vertical' && y + draggedShip.size > 10)
    ) {
      alert('Ship would go out of bounds!');
      return;
    }

    if (!humanPlayer.canPlaceShip(x, y, draggedShip.size, draggedShip.orientation)) {
      alert('Cannot place ship here - overlaps with existing ship!');
      return;
    }

    humanPlayer.gameboard.placeShip(new Ship(draggedShip.size), x, y, draggedShip.orientation);
    humanPlayer.removeShipType(draggedShip.name);

    playerShipPlacements.push({
      x: x,
      y: y,
      size: draggedShip.size,
      orientation: draggedShip.orientation,
      name: draggedShip.name,
      img: draggedShip.img,
      color: draggedShip.color
    });

    const shipDisplay = document.createElement('div');
    shipDisplay.className = 'ship-display';
    const cellSize = 45;
    const gapSize = 2;
    
    let width, height;
    if (draggedShip.orientation === 'horizontal') {
      width = draggedShip.size * (cellSize + gapSize) - gapSize;
      height = cellSize;
    } else {
      width = cellSize;
      height = draggedShip.size * (cellSize + gapSize) - gapSize;
    }

    let left = x * (cellSize + gapSize);
    let top = y * (cellSize + gapSize);

    shipDisplay.style.cssText = `
      width: ${width}px;
      height: ${height}px;
      left: ${left}px;
      top: ${top}px;
      background-image: url(${draggedShip.img});
      background-size: ${draggedShip.orientation === 'horizontal' ? 'auto 100%' : '100% auto'};
      background-repeat: no-repeat;
      background-position: center;
      position: absolute;
      pointer-events: none;
      z-index: 5;
    `;

    for (let i = 0; i < draggedShip.size; i++) {
      const targetX = draggedShip.orientation === 'horizontal' ? x + i : x;
      const targetY = draggedShip.orientation === 'vertical' ? y + i : y;
      const targetCell = container1.querySelector(`.cell[data-x="${targetX}"][data-y="${targetY}"]`);
      if (targetCell) {
        targetCell.style.backgroundColor = draggedShip.color;
        targetCell.dataset.shipColor = draggedShip.color;
      }
    }

    container1.appendChild(shipDisplay);
    draggedShip = null;
    
    createShipIcons();
    
    if (humanPlayer.availableShips.length === 0) {
      allPlayerShipsPlaced = true;
      startButton.disabled = false;
      turnDisplay.textContent = "All ships placed! Click Start Game to begin!";
    }
  });

  startButton.addEventListener('click', () => {
    gameOver = false;
    playerTurn = true;
    
    container1.innerHTML = '';
    container2.innerHTML = '';
    
    aiPlayer.gameboard.reset();
    aiPlayer.attackedPositions = [];
    aiPlayer.pendingTargets = [];
    
    humanPlayer.attackedPositions = [];
    
    aiPlayer.placeShipsRandomly();

    console.log("AI Ship Positions:");
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if (aiPlayer.gameboard.board[y][x] instanceof Ship) {
          console.log(`Ship at (${x},${y})`);
        }
      }
    }
    
    createBoard(container1, true);
    createBoard(container2);
    
    restorePlayerShips();
    
    startButton.style.display = 'none';
    turnDisplay.textContent = "Your turn! Attack the enemy board!";
    
    container2.querySelectorAll('.cell').forEach(cell => {
      const x = parseInt(cell.dataset.x, 10);
      const y = parseInt(cell.dataset.y, 10);
      cell.addEventListener('click', () => handlePlayerAttack(x, y, cell));
    });
  });

  createShipIcons();
  createBoard(container1, true);
  createBoard(container2);
  turnDisplay.textContent = "Place your ships to begin";
});