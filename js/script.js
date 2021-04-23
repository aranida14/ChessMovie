
const PIECES_CLASS_MAP = {
    PAWN: 'fa-chess-pawn',
    ROOK: 'fa-chess-rook',
    KNIGHT: 'fa-chess-knight',
    BISHOP: 'fa-chess-bishop',
    QUEEN: 'fa-chess-queen',
    KING: 'fa-chess-king'
};
const PIECES_SYMBOL_MAP = {
    N: 'KNIGHT', 
    B: 'BISHOP', 
    R: 'ROOK', 
    K: 'KING',
    Q: 'QUEEN'
}

// данные текущей партии:
let movesArray = [];
let currentMoveNum = 0;
let capturedPieces = {};
let inputRangeSlided = false;
let timer;

function drawBoard() {
    let mainBlock = document.querySelector('.main-block');
    mainBlock.innerHTML = '';
    let block;
    let isWhite = true;
    for (let i = 0; i < 8; i++) {            
        for (let j = 0; j < 8; j++) {
            block = document.createElement('div');

            if (isWhite) block.className = 'block light-block';
            else block.className = 'block dark-block';

            mainBlock.appendChild(block);
            
            isWhite = !isWhite;
        }
        isWhite = !isWhite;
    }

    for (let i = 0; i < 8; i++) {
        drawPiece('PAWN', i, 1, false);
        drawPiece('PAWN', i, 6, true);
    }

    drawPiece('ROOK', 0, 0, false);
    drawPiece('ROOK', 7, 0, false);
    drawPiece('ROOK', 0, 7, true);
    drawPiece('ROOK', 7, 7, true);

    drawPiece('KNIGHT', 1, 0, false);
    drawPiece('KNIGHT', 6, 0, false);
    drawPiece('KNIGHT', 1, 7, true);
    drawPiece('KNIGHT', 6, 7, true);
    
    drawPiece('BISHOP', 2, 0, false);
    drawPiece('BISHOP', 5, 0, false);
    drawPiece('BISHOP', 2, 7, true);
    drawPiece('BISHOP', 5, 7, true);
    
    drawPiece('QUEEN', 3, 0, false);
    drawPiece('QUEEN', 3, 7, true);
    
    drawPiece('KING', 4, 0, false);
    drawPiece('KING', 4, 7, true);
}
drawBoard();

function addGamesList(gamesArray) {
    let gamesList = document.querySelector('#gamesList');
    let list = document.createElement('ul');

    gamesArray.forEach(function(game, index) {

        let li = document.createElement('li');
        li.innerHTML = game.name;
        li.id = 'game' + index;
        li.addEventListener('click', fillMovesTextArea);

        list.appendChild(li);
    });
    gamesList.appendChild(list);
}
addGamesList(games);

function fillMovesTextArea() {
    let gameId = this.id.split('game')[1];
    let input = document.querySelector('#movestext');
    input.value = games[gameId].notation;
    addMovesList();
}

function drawPiece(piece, x, y, isWhite) {
    // <i class="fas fa-chess-pawn"></i>
    let pieceElem = document.createElement('i');
    pieceElem.className = `${'fas ' + PIECES_CLASS_MAP[piece] + (isWhite ? ' fa-inverse' : '')}`;
    let block = document.querySelector(`.main-block>.block:nth-child(${y*8 + x + 1})`);
    block.appendChild(pieceElem);
}

function movePieceToXY(fromX, fromY, toX, toY) {
    let piece = document.querySelector(`.main-block>.block:nth-child(${fromY*8 + fromX + 1})>i`);
    let blockTo = document.querySelector(`.main-block>.block:nth-child(${toY*8 + toX + 1})`);
    let blockToPiece = blockTo.getElementsByTagName('i');
    if (blockToPiece.length > 0) //взятие
        blockTo.removeChild(blockToPiece[0]);
    blockTo.appendChild(piece);
}

// movePieceToXY(4,6,4,4);
// movePieceToXY(4,1,4,3);
// movePieceToXY(3,6,3,4);
// movePieceToXY(4,3,3,4);

function parseNotationMove(moveDescription) {

    moveDescription = moveDescription.toUpperCase();
    let moveParts = (moveDescription.indexOf('-') != -1) ? moveDescription.split('-') : moveDescription.split('X');

    if (moveParts.length < 2) {
        throw ("Invalid move description: " + moveDescription);
    } 

    let fromStr = moveParts[0];
    let toStr = moveParts[1];
    
    let pieceName = "PAWN";
    if (fromStr.search(/^[NBRQK][A-H][1-8]/) != -1) {
        pieceName = PIECES_SYMBOL_MAP[fromStr.charAt(0)]
        fromStr = fromStr.slice(1);
    }        

    let fromX = fromStr.codePointAt(0) - 'A'.codePointAt(0);
    let fromY = 8 - fromStr.charAt(1);

    let destMatchRes = toStr.match(/[A-H][1-8]([NBRQ])?/);
    if (destMatchRes == null) 
        throw ("Invalid move description: " + moveDescription);
    let toStrCleared = destMatchRes[0];
    let promotionPiece = destMatchRes[1];
    let toX = toStrCleared.codePointAt(0) - 'A'.codePointAt(0);
    let toY = 8 - toStrCleared.charAt(1);

    let result = {
        pieceName: pieceName,
        fromX: fromX,
        fromY: fromY,
        toX: toX,
        toY: toY,
        promotionPiece: promotionPiece
    }
    return result;
}

function movePieceLANBased(movesArray, moveNum) {
    let moveDesc = movesArray[moveNum-1].toUpperCase();
    // особые случаи: рокировка, превращение пешки, взятие на проходе

    if (moveDesc == 'O-O') {
        // выполнить короткую рокировку
        if (moveNum % 2) {
            //белые
            movePieceToXY(4,7,6,7);
            movePieceToXY(7,7,5,7);
        } else {
            //черные
            movePieceToXY(4,0,6,0);
            movePieceToXY(7,0,5,0);
        }
        return;
    }
    if (moveDesc == 'O-O-O') {
        if (moveNum % 2) {
            //белые
            movePieceToXY(4,7,2,7);
            movePieceToXY(0,7,3,7);
        } else {
            //черные
            movePieceToXY(4,0,2,0);
            movePieceToXY(0,0,3,0);
        }
        return;
    }

    let moveParsed = parseNotationMove(moveDesc);
    let fromX = moveParsed.fromX;
    let fromY = moveParsed.fromY;
    let toX = moveParsed.toX;
    let toY = moveParsed.toY;
    let promotionPiece = moveParsed.promotionPiece;

    if (moveDesc.search(/^[NBRQK]?[A-H][1-8]X[A-H][1-8]/) != -1) { //взятие

        let pieceFrom = document.querySelector(`.main-block>.block:nth-child(${fromY*8 + fromX + 1})>i`);
        let pieceTo = document.querySelector(`.main-block>.block:nth-child(${toY*8 + toX + 1})>i`);

        // взятие на проходе
        if (pieceFrom.classList.contains(PIECES_CLASS_MAP['PAWN']) && pieceTo == null) {
            let capturedX = toX;
            let capturedY = fromY;
            let capturedPawn = document.querySelector(`.main-block>.block:nth-child(${capturedY*8 + capturedX + 1})>i`);
            capturedPawn.remove();
            movePieceToXY(fromX, fromY, toX, toY);
            capturedPieces[moveNum] = {
                type: 'PAWN',
                isWhite: (moveNum % 2 == 0),
                x: capturedX,
                y: capturedY
            }
            return;
        }

        // add captured piece
        for (let piece in PIECES_CLASS_MAP) {
            if ( pieceTo.classList.contains(PIECES_CLASS_MAP[piece]) ) {
                capturedPieces[moveNum] = {
                    type: piece,
                    isWhite: (moveNum % 2 == 0),
                    x: toX,
                    y: toY
                }
                break;
            }   
        }
    }

    // превращение пешки в фигуру
    if (promotionPiece) {
        let piece = document.querySelector(`.main-block>.block:nth-child(${toY*8 + toX + 1})>i`);
        if (!piece.classList.contains(PIECES_CLASS_MAP['PAWN'])) throw ('Must be a pawn');
        
        piece.classList.replace(PIECES_CLASS_MAP['PAWN'], PIECES_CLASS_MAP[PIECES_SYMBOL_MAP[promotionPiece]]);
        return;
    }

    // все "особые" случаи обработаны
    movePieceToXY(fromX, fromY, toX, toY);

}

function cancelMoveLANBased(movesArray, moveNum) {

    let moveDesc = movesArray[moveNum-1].toUpperCase();
    // особые случаи: рокировка, превращение пешки, взятие на проходе

    if (moveDesc == 'O-O') {
        if (moveNum % 2) {
            //белые
            movePieceToXY(6,7,4,7);
            movePieceToXY(5,7,7,7);
        } else {
            //черные
            movePieceToXY(6,0,4,0);
            movePieceToXY(5,0,7,0);
        }
        return;
    }
    if (moveDesc == 'O-O-O') {
        if (moveNum % 2) {
            //белые
            movePieceToXY(2,7,4,7);
            movePieceToXY(3,7,0,7);
        } else {
            //черные
            movePieceToXY(2,0,4,0);
            movePieceToXY(3,0,0,0);
        }
        return;
    }

    let moveParsed = parseNotationMove(moveDesc);
    let fromX = moveParsed.fromX;
    let fromY = moveParsed.fromY;
    let toX = moveParsed.toX;
    let toY = moveParsed.toY;
    let promotionPiece = moveParsed.promotionPiece;

    if (promotionPiece) {
        let piece = document.querySelector(`.main-block>.block:nth-child(${toY*8 + toX + 1})>i`);        
        piece.classList.replace(PIECES_CLASS_MAP[PIECES_SYMBOL_MAP[promotionPiece]], PIECES_CLASS_MAP['PAWN']);
    }
    
    movePieceToXY(toX, toY, fromX, fromY);
    if (moveNum in capturedPieces ) {
        let captured = capturedPieces[moveNum];
        drawPiece(captured.type, captured.x, captured.y, captured.isWhite);
        delete capturedPieces[moveNum];
    }


}

function addMovesList() {
    let movesContainer = document.querySelector('#movesContainer');
    let movesList = document.querySelector('#movesContainer>ol');
    if (movesList) {
        movesList.remove();
        movesArray = [];
        capturedPieces = {};
        drawBoard();
        currentMoveNum = 0;
    }

    let inputRange = document.querySelector('#movesRange');
    let playButton = document.querySelector('#playButton');

    let input = document.querySelector('#movestext');
    let text = input.value.trim();
    if (!text) {
        inputRange.disabled = true;
        playButton.disabled = true;
        return;
    }
    
    // let moves = text.split(/\d\.\s+/);
    let moves = text.split(/\d+\.\s*/);
    // console.log(moves);

    moves = moves.filter(move => move.length > 0); //удаляем пустые строки

    // movesContainer = document.createElement('div');
    // movesContainer.id = 'movesContainer';
    movesList = document.createElement('ol');

    moves.forEach((item, index) => {
        
        item = item.trim();
        let movesPair = item.split(/\s+/);

        let move = document.createElement('li');
        let moveLinkW = document.createElement('span');
        moveLinkW.id = `move-${index * 2 + 1}`;
        moveLinkW.innerHTML= movesPair[0];
        moveLinkW.addEventListener('click', drawPosition)

        move.appendChild(moveLinkW);

        movesArray.push(movesPair[0]);
        
        if (movesPair.length > 1) {
            let moveLinkB = document.createElement('span');
            moveLinkB.innerHTML = movesPair[1];                    
            moveLinkB.id = `move-${index * 2 + 2}`;
            moveLinkB.addEventListener('click', drawPosition);
            move.appendChild(moveLinkB);

            movesArray.push(movesPair[1]);
        }
        
        
        movesList.appendChild(move);
    });
    movesContainer.appendChild(movesList);

    inputRange.max = movesArray.length;
    inputRange.disabled = false;
    inputRange.oninput = drawPosition;
    inputRange.value = 0;

    playButton.disabled = false;
    playButton.addEventListener('click', playGame);
}

function playGame() {
    let inputRange = document.querySelector('#movesRange');
    let button = document.querySelector('#playButton');
    button.disabled = true;
    let i = currentMoveNum, tick = 1000;
    (function() {
        if (i < movesArray.length && !inputRangeSlided) {
            i++;
            console.log(`Номер хода: ${i}`)
            movePieceLANBased(movesArray, i);
            currentMoveNum = i;
            inputRange.value = currentMoveNum;
            timer = setTimeout(arguments.callee, tick);
        } else {
            button.disabled = false;
        }
    })();
}

function drawPosition(ev) {
    // console.log(ev);
    let moveNum;
    let inputRange = document.querySelector('#movesRange');
    if (ev.target.id == 'movesRange') {
        moveNum = ev.target.value;
        inputRangeSlided = true;
        clearTimeout(timer);
        let button = document.querySelector('#playButton');
        button.disabled = false;
    } else {
        moveNum = this.id.split('-').pop();
    }
    console.log(`Номер хода: ${moveNum}`);
    
    if (moveNum > currentMoveNum) {
        for (let i = currentMoveNum; i < moveNum; i++) {
            movePieceLANBased(movesArray, i+1);
            currentMoveNum = i+1;
        }
    } else {
        for (let i = currentMoveNum; i > moveNum; i--) {
            cancelMoveLANBased(movesArray, i, capturedPieces);
            currentMoveNum = i-1;
        }
    }
    if (ev.target.id != 'movesRange') {
        inputRange.value = currentMoveNum;
    } else {
        inputRangeSlided = false;
    }
    
}
