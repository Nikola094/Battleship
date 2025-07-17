const {Gameboard, Ship} = require('./index')

test ('placing a ship', () =>{
    const board = new Gameboard()
    const cruiser = new Ship(3)

    board.placeShip(cruiser, 0, 0, 'horizontal')
    board.takeDamage(0, 0)
    board.takeDamage(1, 0)
    board.takeDamage(2, 0)

    expect(cruiser.isSunk()).toBe(true)
    expect(board.missedSpots.length).toBe(0);
})

test ('record a miss', () => {
    const board = new Gameboard()
    board.takeDamage(5,5)
    expect(board.missedSpots).toContainEqual([5,5])
})