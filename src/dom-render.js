import carrierImg from './assets/carrier.png';
import battleshipImg from './assets/battleship.png';
import cruiserImg from './assets/cruiser.png';
import submarineImg from './assets/submarine.png';
import destroyerImg from './assets/destroyer.png';

import { Gameboard, Ship } from './index';
import './styles.css';

document.addEventListener('DOMContentLoaded', () => {
  const player1Ships = document.getElementById('player1-ships');
  const player2Ships = document.getElementById('player2-ships');
  const container1 = document.getElementById('player1-board');
  const container2 = document.getElementById('player2-board');

  const player1Board = new Gameboard();
  const player2Board = new Gameboard();

  const ships = [
    { name: 'Carrier', size: 5, img: carrierImg, color: 'rgba(255, 100, 100, 0.6)' },
    { name: 'Battleship', size: 4, img: battleshipImg, color: 'rgba(100, 255, 100, 0.6)' },
    { name: 'Cruiser', size: 3, img: cruiserImg, color: 'rgba(100, 100, 255, 0.6)' },
    { name: 'Submarine', size: 3, img: submarineImg, color: 'rgba(255, 255, 100, 0.6)' },
    { name: 'Destroyer', size: 2, img: destroyerImg, color: 'rgba(255, 100, 255, 0.6)' },
  ];

  function createShipIcons(container) {
    ships.forEach(ship => {
      const img = document.createElement('img');
      img.src = ship.img;
      img.alt = ship.name;
      img.classList.add('ship-icon');
      img.draggable = true;
      img.dataset.size = ship.size;
      img.dataset.name = ship.name;
      img.dataset.img = ship.img;
      img.dataset.color = ship.color;

      container.appendChild(img);
    });
  }

  createShipIcons(player1Ships);
  createShipIcons(player2Ships);

  function createBoard(container, gameboard) {
    container.innerHTML = '';
    container.classList.add('board-grid');

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('cell');
        cellDiv.dataset.x = x;
        cellDiv.dataset.y = y;
        container.appendChild(cellDiv);
      }
    }
  }

  createBoard(container1, player1Board);
  createBoard(container2, player2Board);

  let draggedShip = null;
  const shipPlacements = new Map(); 

  // Setup drag events
  [player1Ships, player2Ships].forEach(shipsContainer => {
    shipsContainer.addEventListener('dragstart', e => {
      if (e.target.classList.contains('ship-icon')) {
        draggedShip = {
          size: parseInt(e.target.dataset.size, 10),
          name: e.target.dataset.name,
          img: e.target.dataset.img,
          color: e.target.dataset.color
        };
        e.dataTransfer.setData('text/plain', '');
      }
    });
  });

 
  [container1, container2].forEach(board => {
    board.addEventListener('dragover', e => {
      e.preventDefault();
      const cell = e.target.closest('.cell');
      if (!cell || !draggedShip) return;

      const x = parseInt(cell.dataset.x, 10);
      const y = parseInt(cell.dataset.y, 10);

      board.querySelectorAll('.temp-highlight').forEach(c => {
        c.classList.remove('temp-highlight');

        if (!c.dataset.shipColor) {
          c.style.backgroundColor = '';
        }
      });

      
      for (let i = 0; i < draggedShip.size; i++) {
        const targetX = x + i;
        if (targetX >= 10) break;
        const targetCell = board.querySelector(`.cell[data-x="${targetX}"][data-y="${y}"]`);
        if (targetCell) {
          targetCell.classList.add('temp-highlight');
          if (!targetCell.dataset.shipColor) {
            targetCell.style.backgroundColor = 'rgba(200, 200, 200, 0.5)';
          }
        }
      }
    });

    board.addEventListener('dragleave', () => {
      board.querySelectorAll('.temp-highlight').forEach(c => {
        c.classList.remove('temp-highlight');
        if (!c.dataset.shipColor) {
          c.style.backgroundColor = '';
        }
      });
    });

    board.addEventListener('drop', e => {
      e.preventDefault();
      const cell = e.target.closest('.cell');
      if (!cell || !draggedShip) return;

      const x = parseInt(cell.dataset.x, 10);
      const y = parseInt(cell.dataset.y, 10);
      const currentBoard = board === container1 ? player1Board : player2Board;

     
      if (x + draggedShip.size > 10) {
        alert('Ship would go out of bounds!');
        return;
      }

     
      for (let i = 0; i < draggedShip.size; i++) {
        if (currentBoard.board[y][x + i] !== null) {
          alert('Cannot place ship here - overlaps with existing ship!');
          return;
        }
      }

     
      currentBoard.placeShip(new Ship(draggedShip.size), x, y, 'horizontal');
      const shipDisplay = document.createElement('div');
      shipDisplay.className = 'ship-display';
      
      const cellSize = 50;
      const gapSize = 2;
      const widthMultiplier = 1.5; 
      const width = (draggedShip.size * cellSize * widthMultiplier) + ((draggedShip.size - 1) * gapSize);
      
      shipDisplay.style.cssText = `
        position: absolute;
        width: ${width}px;
        height: ${cellSize}px;
        left: ${x * (cellSize + gapSize) - (cellSize * 0.25)}px; /* Center the wider ship */
        top: ${y * (cellSize + gapSize)}px;
        background-image: url(${draggedShip.img});
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        pointer-events: none;
        z-index: 5;
      `;

     
      for (let i = 0; i < draggedShip.size; i++) {
        const targetX = x + i;
        const targetCell = board.querySelector(`.cell[data-x="${targetX}"][data-y="${y}"]`);
        if (targetCell) {
          targetCell.style.backgroundColor = draggedShip.color;
          targetCell.dataset.shipColor = draggedShip.color;
        }
      }

      board.appendChild(shipDisplay);
      
     
      board.querySelectorAll('.temp-highlight').forEach(c => {
        c.classList.remove('temp-highlight');
        if (!c.dataset.shipColor) {
          c.style.backgroundColor = '';
        }
      });
      
      draggedShip = null;
    });
  });
});