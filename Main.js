import Minesweeper from "./Minesweeper.js"
import * as Graphics from "./Graphics.js"
import * as Graphics2 from "./Graphics2.js"

let g_isLmbDown = false;
let g_isRmbDown = false;
let g_lastMouseX;
let g_lastMouseZ;

let g_minesweeper;
let g_gameOver = false;

// minesweeper args
let g_mapX = 15;
let g_mapZ = 15;
let g_bombCount = 25;

function main() {
    Graphics.setup(g_mapX, g_mapZ);
    Graphics.main();

    // Graphics2.animate();
    // console.log(g_minesweeper.getSafeFloodfillTiles(0, 0));
    // Graphics.initializeMap(g_minesweeper);
    // Graphics2.main();

    document.addEventListener("mousedown",
        function (event) {
            g_lastMouseX = event.clientX;
            g_lastMouseZ = event.clientY;
            if (event.buttons === 1)
                g_isLmbDown = true;
            if (event.buttons === 2)
                g_isRmbDown = true;
        }
    );
    document.addEventListener("mouseup", click);

    // document.addEventListener("keydown", function (event) {
    //     if (event.key === "e")
    //         win();
    // });
}

function click(event) {
    // detect drag
    let dragThreshold = 10;
    if (Math.abs(g_lastMouseX - event.clientX) > dragThreshold)
        return;
    if (Math.abs(g_lastMouseZ - event.clientY) > dragThreshold)
        return;

    // click location
    let clickedCoord = Graphics.raycast(event);
    if (clickedCoord == null)
        return;
    let x = clickedCoord[0];
    let z = clickedCoord[1];
    console.log(clickedCoord);

    // create map
    {
        if (!g_minesweeper) {
            g_minesweeper = new Minesweeper(g_mapX, g_mapZ, g_bombCount, x, z);
            console.log(g_minesweeper.mapData);
        }
    }

    // lmb, which === 1
    if (event.which === 1 && g_isLmbDown) {
        g_isLmbDown = false;

        if (g_minesweeper.getUiTile(x, z) === Minesweeper.UiTile.Flag)
            return;

        // check lose
        let tile = g_minesweeper.getTile(x, z);
        if (tile == Minesweeper.Tile.Bomb) {
            console.log("You lose");
            lose(x, z);
            return;
        }

        let safeTiles = g_minesweeper.getSafeFloodfillTiles(x, z);
        for (let i = 0; i < safeTiles.length; i++) {
            revealTile(safeTiles[i][0], safeTiles[i][1]);
        }

        // // reveal for first click
        // {
        //     if (g_minesweeper.getRevealedTileCount() == 0) {

        //     }
        // }

        // revealTile(x, z);

        // check win
        let remainingHiddenTilesCount = (g_minesweeper.mapX * g_minesweeper.mapZ) - g_minesweeper.getRevealedTileCount();
        if (remainingHiddenTilesCount === g_minesweeper.bombCount) {
            console.log("You win");
            win();
            return;
        }
    }

    // rmb, which === 3
    if (event.which === 3 && g_isRmbDown) {
        g_isRmbDown = false;
        if (g_minesweeper.getUiTile(x, z) !== Minesweeper.UiTile.Revealed) {
            Graphics.toggleBlowfish(x, z);
            g_minesweeper.tryToggleFlag(x, z);
        }
    }
}

function revealTile(x, z) {
    g_minesweeper.revealTile(x, z);
    let surroundingBombCount = g_minesweeper.getSurroundingBombCount(x, z);

    Graphics.removeGrass(x, z);
    if (g_minesweeper.getTile(x, z) === Minesweeper.Tile.Bomb)
        return;
    if (surroundingBombCount > 0) {
        let surroundingBombCountString = surroundingBombCount.toString();
        Graphics.createText(x, z, surroundingBombCountString, Graphics.getTextColor(surroundingBombCountString));
    }
}

function lose(lastX, lastZ) {
    console.log("Lose logic");
    g_gameOver = true;

    clearMap();

    Graphics.createAnglerfish(lastX, lastZ);
    Graphics.createStatusText((g_minesweeper.mapX / 2) - 2, g_minesweeper.mapZ / 2, "You lose");
}

function win() {
    console.log("Win logic");
    g_gameOver = true;

    clearMap();

    Graphics.createStatusText((g_minesweeper.mapX / 2) - 2, g_minesweeper.mapZ / 2, "You win");

}

function clearMap() {
    for (let x = 0; x < g_minesweeper.mapX; x++) {
        for (let z = 0; z < g_minesweeper.mapZ; z++) {
            revealTile(x, z);
            Graphics.removeBlowfish(x, z);
            if (g_minesweeper.getTile(x, z) === Minesweeper.Tile.Bomb)
                Graphics.createBlowfish(x, z);
        }
    }
}

main();
