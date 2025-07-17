// board is 10x10 per player, create a grid like element where each player can place up to five ships 
// ship sizes are carrier(5 space) , battlship(4 space), cruiser(3 space), destroyer(2 space) - 17/20 spaces are filled
// 
class Gameboard {
    constructor(){
        this.board = Array(10).fill(null).map(() => Array(10).fill(null));
        this.ships = []
        this.missedSpots = []
    }
    placeShip(ship, positionX,positionY,direction){
        if (direction === 'horizontal' && positionX + ship.length > 10) return 'ship placement out of horizontal bounds'
        if (direction === 'vertical' && positionY + ship.length > 10) return 'ship placement out of vertical bounds'
        for (let i = 0; i < ship.length; i++){
            if(direction === 'horizontal'){
                this.board[positionX + i][positionY] = ship
            }   else {
                this.board[positionX][positionY+i] = ship;
            }
        }
        this.ships.push(ship)
    }
    takeDamage(x,y){
            if (x < 0 || x >= 10 || y < 0 || y >= 10){
                return 'out of bounds';
            }
        const cell = this.board[x][y]
        if (cell === null) {
            this.missedSpots.push([x,y]);
            this.board[x][y] = 'miss';
        } else if (cell instanceof Ship){
            cell.hit()
            this.board[x][y] = 'hit';
        }
    }
    win(){
       return this.ships.every(ship => ship.isSunk())
    }
}

class Ship {
    constructor(length){
        this.length = length;
        this.hits = 0;
    }
    hit(){
        this.hits++
    }
    isSunk(){
        return this.hits === this.length;
    }
}

class Player {
    constructor(name){
        this.name = name;
        this.gameboard = new Gameboard()
    }
    attack(enemyBoard, x,y){
        enemyBoard.takeDamage(x,y )
    }
}
module.exports = {Gameboard, Ship, Player};