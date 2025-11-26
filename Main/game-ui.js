class ChessUI {
    constructor() {
        console.log('ChessUI constructor called');
        
        // Check if required classes exist
        if (typeof ChessGame === 'undefined') {
            console.error('ChessGame class not found!');
            return;
        }
        if (typeof ChessAI === 'undefined') {
            console.error('ChessAI class not found!');
            return;
        }

        this.game = new ChessGame();
        this.ai = new ChessAI();
        this.boardElement = document.getElementById('chess-board');
        
        if (!this.boardElement) {
            console.error('Chess board element not found!');
            return;
        }

        this.initializeEventListeners();
        this.createBoard();
        
        // Signal UI initialized
        this.updateStatus('status-game-ui', 'game-ui: initialized');
        console.log('ChessUI initialized successfully');
    }

    updateStatus(id, text) {
        try {
            const el = document.getElementById(id);
            if (el) el.textContent = text;
        } catch (e) {
            // Ignore if element doesn't exist
        }
    }

    initializeEventListeners() {
        console.log('Setting up event listeners...');
        
        const singlePlayerBtn = document.getElementById('single-player');
        const twoPlayerBtn = document.getElementById('two-player');
        const newGameBtn = document.getElementById('new-game');
        const flipBoardBtn = document.getElementById('flip-board');
        const backToMenuBtn = document.getElementById('back-to-menu');

        if (singlePlayerBtn) {
            singlePlayerBtn.addEventListener('click', () => {
                console.log('single-player clicked');
                this.startGame('single');
            });
        }

        if (twoPlayerBtn) {
            twoPlayerBtn.addEventListener('click', () => {
                console.log('two-player clicked');
                this.startGame('two');
            });
        }

        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                console.log('new-game clicked');
                this.showModeSelection();
            });
        }

        if (flipBoardBtn) {
            flipBoardBtn.addEventListener('click', () => {
                console.log('flip-board clicked');
                this.flipBoard();
            });
        }

        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                console.log('back-to-menu clicked');
                this.showModeSelection();
            });
        }

        console.log('Event listeners set up successfully');
    }

    startGame(mode) {
        console.log('Starting game in mode:', mode);
        this.game.gameMode = mode;
        this.game.reset();
        
        const modeSelection = document.getElementById('game-mode-selection');
        const gameContainer = document.getElementById('game-container');
        
        if (modeSelection) modeSelection.classList.add('hidden');
        if (gameContainer) gameContainer.classList.remove('hidden');
        
        this.updateDisplay();
    }

    showModeSelection() {
        console.log('Showing mode selection');
        const gameContainer = document.getElementById('game-container');
        const modeSelection = document.getElementById('game-mode-selection');
        
        if (gameContainer) gameContainer.classList.add('hidden');
        if (modeSelection) modeSelection.classList.remove('hidden');
        
        this.game.reset();
    }

    createBoard() {
        console.log('Creating board...');
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
                    const r = parseInt(e.currentTarget.dataset.row);
                    const c = parseInt(e.currentTarget.dataset.col);
                    console.log('square clicked display coords:', r, c);
                    this.handleSquareClick(r, c);
                });
                
                this.boardElement.appendChild(square);
            }
        }
        
        this.updateDisplay();
        console.log('Board created successfully');
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
                
                if (piece && square) {
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
            if (squares[squareIndex]) {
                squares[squareIndex].classList.add('selected');
            }
        }

        // Highlight valid moves
        this.game.validMoves.forEach(move => {
            const displayRow = this.game.boardFlipped ? 7 - move.row : move.row;
            const displayCol = this.game.boardFlipped ? 7 - move.col : move.col;
            const squareIndex = displayRow * 8 + displayCol;
            if (squares[squareIndex]) {
                squares[squareIndex].classList.add('valid-move');
            }
        });

        // Highlight king in check
        if (this.game.isInCheck(this.game.currentPlayer)) {
            const king = this.game.kings[this.game.currentPlayer];
            const displayRow = this.game.boardFlipped ? 7 - king.row : king.row;
            const displayCol = this.game.boardFlipped ? 7 - king.col : king.col;
            const squareIndex = displayRow * 8 + displayCol;
            if (squares[squareIndex]) {
                squares[squareIndex].classList.add('in-check');
            }
        }

        this.updateGameInfo();
    }

    updateGameInfo() {
        const playerName = document.getElementById('player-name');
        const gameStatus = document.getElementById('game-status');
        
        if (!playerName || !gameStatus) return;
        
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

        console.log('Converted coords:', {displayRow, displayCol}, 'to', {actualRow, actualCol});

        // If clicking on a valid move, make the move
        if (this.game.selectedSquare && 
            this.game.validMoves.some(move => move.row === actualRow && move.col === actualCol)) {
            
            console.log('Making move from', this.game.selectedSquare, 'to', {actualRow, actualCol});
            
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
            console.log('Selecting piece:', piece, 'at', {actualRow, actualCol});
            this.game.selectedSquare = { row: actualRow, col: actualCol };
            this.game.validMoves = this.game.getPossibleMoves(actualRow, actualCol);
            console.log('Valid moves:', this.game.validMoves);
        } else {
            this.game.selectedSquare = null;
            this.game.validMoves = [];
        }

        this.updateDisplay();
    }

    makeAIMove() {
        if (this.game.isGameOver || this.game.currentPlayer !== 'black') return;

        console.log('AI making move...');
        const aiMove = this.ai.getBestMove(this.game);
        if (aiMove) {
            console.log('AI move:', aiMove);
            this.game.makeMove(aiMove.from.row, aiMove.from.col, aiMove.to.row, aiMove.to.col);
            this.updateDisplay();
        }
    }

    flipBoard() {
        this.game.boardFlipped = !this.game.boardFlipped;
        this.updateDisplay();
    }
}

// Wait for DOM to load, then initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ChessUI...');
    try {
        window.chessUI = new ChessUI();
    } catch (err) {
        console.error('Failed to initialize ChessUI:', err);
    }
});

console.log('Main/game-ui.js loaded');