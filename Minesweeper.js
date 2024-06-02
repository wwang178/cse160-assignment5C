export class Minesweeper {
    constructor(mapX, mapZ, bombCount, avoidX, avoidZ) {
        this.mapX = mapX;
        this.mapZ = mapZ;
        this.bombCount = bombCount;
        this.mapData = [];
        this.uiMapData = [];
        this.initializeMaps(avoidX, avoidZ);

    }

    static Tile = Object.freeze({
        Empty: 0,
        Bomb: 1
    })

    static UiTile = Object.freeze({
        Hidden: 0,
        Revealed: 1,
        Flag: 2
    })

    initializeMaps(avoidX, avoidZ) {
        for (let x = 0; x < this.mapX; x++) {
            let mapDataX = [];
            let uiMapDataX = [];
            for (let z = 0; z < this.mapZ; z++) {
                mapDataX.push(Minesweeper.Tile.Empty);
                uiMapDataX.push(Minesweeper.UiTile.Hidden);
            }
            this.mapData.push(mapDataX);
            this.uiMapData.push(uiMapDataX);
        }

        for (let i = 0; i < this.bombCount; i++) {
            let x;
            let z;
            while (true) {
                x = getRandomInt(this.mapX);
                z = getRandomInt(this.mapZ);

                if(Math.abs(avoidX - x) <= 1 && Math.abs(avoidZ - z) <= 1)
                    continue;

                if (this.mapData[x][z] == Minesweeper.Tile.Empty) {
                    this.mapData[x][z] = Minesweeper.Tile.Bomb;
                    break;
                }
            }
        }
    }

    revealTile(x, z) {
        this.uiMapData[x][z] = Minesweeper.UiTile.Revealed;
        return this.mapData[x][z];
    }

    getRevealedTileCount() {
        let count = 0;
        for (let x = 0; x < this.mapX; x++) {
            for (let z = 0; z < this.mapZ; z++) {
                if (this.uiMapData[x][z] == Minesweeper.UiTile.Revealed)
                    count++;
            }
        }
        return count;
    }

    tryToggleFlag(x, z) {
        let tile = this.uiMapData[x][z];
        if (tile === Minesweeper.UiTile.Revealed)
            return;
        if (tile === Minesweeper.UiTile.Flag)
            this.uiMapData[x][z] = Minesweeper.UiTile.Hidden;
        else if (tile === Minesweeper.UiTile.Hidden)
            this.uiMapData[x][z] = Minesweeper.UiTile.Flag;
    }

    getSurroundingBombCount(x, z) {
        let bombCount = 0;

        // left
        if (this.isValidCoord(x - 1, z + 1) && this.mapData[x - 1][z + 1] == Minesweeper.Tile.Bomb)
            bombCount++;
        if (this.isValidCoord(x - 1, z) && this.mapData[x - 1][z] == Minesweeper.Tile.Bomb)
            bombCount++;
        if (this.isValidCoord(x - 1, z - 1) && this.mapData[x - 1][z - 1] == Minesweeper.Tile.Bomb)
            bombCount++;

        // center
        if (this.isValidCoord(x, z + 1) && this.mapData[x][z + 1] == Minesweeper.Tile.Bomb)
            bombCount++;
        if (this.isValidCoord(x, z - 1) && this.mapData[x][z - 1] == Minesweeper.Tile.Bomb)
            bombCount++;

        // right
        if (this.isValidCoord(x + 1, z + 1) && this.mapData[x + 1][z + 1] == Minesweeper.Tile.Bomb)
            bombCount++;
        if (this.isValidCoord(x + 1, z) && this.mapData[x + 1][z] == Minesweeper.Tile.Bomb)
            bombCount++;
        if (this.isValidCoord(x + 1, z - 1) && this.mapData[x + 1][z - 1] == Minesweeper.Tile.Bomb)
            bombCount++;

        return bombCount;
    }

    isValidCoord(x, z) {
        return 0 <= x && x < this.mapX && 0 <= z && z < this.mapZ;
    }

    getTile(x, z) {
        return this.mapData[x][z];
    }

    getUiTile(x, z){
        return this.uiMapData[x][z];
    }

    getSafeFloodfillTiles(startX, startZ) {
        let rows = this.mapX;
        let cols = this.mapZ;
        let queue = [[startX, startZ]];
        let visited = new Set();
        let toReaveal = [];

        while (queue.length > 0) {
            let [row, col] = queue.shift();

            if (visited.has(`${row},${col}`)) {
                continue;
            }

            visited.add(`${row},${col}`);

            // Reveal the current cell
            let adjacentMines = this.getSurroundingBombCount(row, col);
            // board[row][col] = adjacentMines;
            toReaveal.push([row, col]);

            if (adjacentMines === 0) {
                // Check all 8 surrounding cells
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0)
                            continue;
                        let newRow = row + dr;
                        let newCol = col + dc;
                        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && !visited.has(`${newRow},${newCol}`)) {
                            queue.push([newRow, newCol]);
                        }
                    }
                }
            }
        }

        return toReaveal;
    }
}

// 0 to max, not inclusive of max
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

export default Minesweeper;
