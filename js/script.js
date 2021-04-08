
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

let movesArray = [];

function drawBoard() {
    let mainBlock = document.querySelector('.main-block');
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

function drawPiece(piece, x, y, isWhite) {
    // <i class="fas fa-chess-pawn"></i>
    let pieceElem = document.createElement('i');
    pieceElem.className = `${'fas ' + PIECES_CLASS_MAP[piece] + (isWhite ? ' fa-inverse' : '')}`;
    let block = document.querySelector(`.main-block>.block:nth-child(${y*8 + x + 1})`);
    block.appendChild(pieceElem);
}
//drawPiece('ROOK',7,7, true);

/* function drawAllPieces() {
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

} */
// drawAllPieces();

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

    let moveParts = (moveDesc.indexOf('-') != -1) ? moveDesc.split('-') : moveDesc.split('X');

    if (moveParts.length < 2) {
        throw ("Invalid move description: " + moveDesc);
    } 

    let fromStr = moveParts[0];
    let toStr = moveParts[1];
    
    if (fromStr.search(/^[NBRQK][A-H][1-8]/) != -1) 
        fromStr = fromStr.slice(1);

    let fromX = fromStr.codePointAt(0) - 'A'.codePointAt(0);
    // console.log(fromX);
    let fromY = 8 - fromStr.charAt(1);
    // console.log(fromY);

    let destMatchRes = toStr.match(/[A-H][1-8]([NBRQ])?/);
    // console.log(destMatchRes);
    if (destMatchRes == null) 
        throw ("Invalid move description: " + moveDesc);
    let toStrCleared = destMatchRes[0];
    let promotionPiece = destMatchRes[1];
    let toX = toStrCleared.codePointAt(0) - 'A'.codePointAt(0);
    // console.log(toX);
    let toY = 8 - toStrCleared.charAt(1);
    // console.log(toY);

    // взятие на проходе
    if (moveDesc.search(/^[A-H][1-8]X[A-H][1-8]/) != -1) {
        let piece1 = document.querySelector(`.main-block>.block:nth-child(${fromY*8 + fromX + 1})>i`);
        let piece2 = document.querySelector(`.main-block>.block:nth-child(${toY*8 + toX + 1})>i`);        
        if (piece1.classList.contains(PIECES_CLASS_MAP['PAWN']) && piece2 == null) {
            let capturedX = toX;
            let capturedY = fromY;
            let capturedPawn = document.querySelector(`.main-block>.block:nth-child(${capturedY*8 + capturedX + 1})>i`);
            capturedPawn.remove();
            movePieceToXY(fromX, fromY, toX, toY);
            return;
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

// movePieceLANBased(
//     ["f2-f4", "e7-e5", "f4xe5", "d7-d6", "e5xd6", "Bf8xd6", "g2-g3", "Qd8-g5", "Ng1-f3", "Qg5xg3+", "h2xg3", "Bd6xg3#"],
//     6
// );

function addMovesList() {
    let movesContainer = document.querySelector('#movesContainer');
    let movesList = document.querySelector('#movesContainer>ol');
    if (movesList) {
        movesList.remove();
        movesArray = [];
    }

    let input = document.querySelector('#movestext');
    let text = input.value.trim();
    if (!text) return;
    
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

    // console.log(movesArray);
}

function drawPosition(ev) {
    alert(`Номер хода: ${this.id.split('-').pop()}`);
}
