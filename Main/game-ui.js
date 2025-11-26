class ChessUI {
    constructor() {
        this.game = new ChessGame();
        this.ai = new ChessAI();
        this.boardElement = document.getElementById('chess-board');
        this.initializeEventListeners();
        this.createBoard();
    }

    initializeEventListeners() {
        document.getElementById('single-player').addEventListener('click', () => {
            this.startGame('single');
        });

        document.getElementById('two-player').addEventListener('click', () => {
            this.startGame('two');
        });

        document.getElementById('new-game').addEventListener('click', () => {
            this.showModeSelection();
        });

        document.getElementById('flip-board').addEventListener('click', () => {
            this.flipBoard();
        });

        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.showModeSelection();
        });
    }

    startGame(mode) {
        this.game.gameMode = mode;
        this.game.reset();
        document.getElementById('game-mode-selection').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        this.updateDisplay();
    }

    showModeSelection() {
        document.getElementById('game-container').classList.add('hidden');
        document.getElementById('game-mode-selection').classList.remove('hidden');
        this.game.reset();
    }

    createBoard() {
        this.boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = 'square';
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Add checkerboard pattern
                if ((row + col) % 2 === 0) {
                    square.classList.add('light');
                } else {
                    square.classList.add('dark');
                }
                
                square.addEventListener('click', (e) => {
                    this.handleSquareClick(parseInt(e.target.dataset.row), parseInt(e.target.dataset.col));
                });
                
                this.boardElement.appendChild(square);
            }
        }
        
        this.updateDisplay();
    }

    updateDisplay() {
        // Clear all squares
        const squares = this.boardElement.querySelectorAll('.square');
        squares.forEach(square => {
            square.textContent = '';
            square.classList.remove('selected', 'valid-move', 'in-check');
        });

        // Place pieces
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const displayRow = this.game.boardFlipped ? 7 - row : row;
                const displayCol = this.game.boardFlipped ? 7 - col : col;
                const piece = this.game.board[row][col];
                const squareIndex = displayRow * 8 + displayCol;
                const square = squares[squareIndex];
                
                if (piece) {
                    square.textContent = this.game.getPieceSymbol(piece);
                    square.setAttribute('data-actual-row', row);
                    square.setAttribute('data-actual-col', col);
                }
            }
        }

        // Highlight selected square
        if (this.game.selectedSquare) {
            const { row, col } = this.game.selectedSquare;
            const displayRow = this.game.boardFlipped ? 7 - row : row;
            const displayCol = this.game.boardFlipped ? 7 - col : col;
            const squareIndex = displayRow * 8 + displayCol;
            squares[squareIndex].classList.add('selected');
        }

        // Highlight valid moves
        this.game.validMoves.forEach(move => {
            const displayRow = this.game.boardFlipped ? 7 - move.row : move.row;
            const displayCol = this.game.boardFlipped ? 7 - move.col : move.col;
            const squareIndex = displayRow * 8 + displayCol;
            squares[squareIndex].classList.add('valid-move');
        });

        // Highlight king in check
        if (this.game.isInCheck(this.game.currentPlayer)) {
            const king = this.game.kings[this.game.currentPlayer];
            const displayRow = this.game.boardFlipped ? 7 - king.row : king.row;
            const displayCol = this.game.boardFlipped ? 7 - king.col : king.col;
            const squareIndex = displayRow * 8 + displayCol;
            squares[squareIndex].classList.add('in-check');
        }

        this.updateGameInfo();
    }

    updateGameInfo() {
        const playerName = document.getElementById('player-name');
        const gameStatus = document.getElementById('game-status');
        
        if (this.game.isGameOver) {
            playerName.textContent = "Game Over";
            gameStatus.textContent = this.game.checkGameOver();
        } else {
            const currentPlayerName = this.game.currentPlayer === 'white' ? 'White' : 'Black';
            playerName.textContent = `${currentPlayerName}'s Turn`;
            
            const status = this.game.checkGameOver();
            gameStatus.textContent = status;
            
            if (this.game.gameMode === 'single' && this.game.currentPlayer === 'black' && !this.game.isGameOver) {
                gameStatus.textContent = "AI is thinking...";
                setTimeout(() => this.makeAIMove(), 500);
            }
        }
    }

    handleSquareClick(displayRow, displayCol) {
        if (this.game.isGameOver) return;
        if (this.game.gameMode === 'single' && this.game.currentPlayer === 'black') return;

        // Convert display coordinates to actual board coordinates
        const actualRow = this.game.boardFlipped ? 7 - displayRow : displayRow;
        const actualCol = this.game.boardFlipped ? 7 - displayCol : displayCol;

        // If clicking on a valid move, make the move
        if (this.game.selectedSquare && 
            this.game.validMoves.some(move => move.row === actualRow && move.col === actualCol)) {
            
            this.game.makeMove(
                this.game.selectedSquare.row, 
                this.game.selectedSquare.col, 
                actualRow, 
                actualCol
            );
            
            this.game.selectedSquare = null;
            this.game.validMoves = [];
            
            // Flip board in 2-player mode
            if (this.game.gameMode === 'two' && !this.game.isGameOver) {
                this.flipBoard();
            }
            
            this.updateDisplay();
            return;
        }

        // Select a piece
        const piece = this.game.board[actualRow][actualCol];
        if (piece && piece.color === this.game.currentPlayer) {
            this.game.selectedSquare = { row: actualRow, col: actualCol };
            this.game.validMoves = this.game.getPossibleMoves(actualRow, actualCol);
        } else {
            this.game.selectedSquare = null;
            this.game.validMoves = [];
        }

        this.updateDisplay();
    }

    makeAIMove() {
        if (this.game.isGameOver || this.game.currentPlayer !== 'black') return;

        const aiMove = this.ai.getBestMove(this.game);
        if (aiMove) {
            this.game.makeMove(aiMove.from.row, aiMove.from.col, aiMove.to.row, aiMove.to.col);
            this.updateDisplay();
        }
    }

    flipBoard() {
        this.game.boardFlipped = !this.game.boardFlipped;
        this.updateDisplay();
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new ChessUI();
});