class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.gameMode = null;
        this.selectedSquare = null;
        this.validMoves = [];
        this.isGameOver = false;
        this.boardFlipped = false;
        this.moveHistory = [];
        this.kings = { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } };
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Place pawns
        for (let col = 0; col < 8; col++) {
            board[1][col] = { type: 'pawn', color: 'black' };
            board[6][col] = { type: 'pawn', color: 'white' };
        }
        
        // Place other pieces
        const pieceOrder = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let col = 0; col < 8; col++) {
            board[0][col] = { type: pieceOrder[col], color: 'black' };
            board[7][col] = { type: pieceOrder[col], color: 'white' };
        }
        
        return board;
    }

    getPieceSymbol(piece) {
        const symbols = {
            white: {
                king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙'
            },
            black: {
                king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟'
            }
        };
        return piece ? symbols[piece.color][piece.type] : '';
    }

    isValidSquare(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.color !== this.currentPlayer) return [];

        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col);
                break;
            case 'king':
                moves = this.getKingMoves(row, col);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col);
                break;
        }

        // Filter out moves that would leave king in check
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col));
    }

    getPawnMoves(row, col) {
        const moves = [];
        const piece = this.board[row][col];
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;

        // Forward move
        if (this.isValidSquare(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({ row: row + direction, col });
            
            // Two squares forward from starting position
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Captures
        for (let dcol of [-1, 1]) {
            const newRow = row + direction;
            const newCol = col + dcol;
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (target && target.color !== piece.color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    getRookMoves(row, col) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (let [drow, dcol] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + drow * i;
                const newCol = col + dcol * i;
                
                if (!this.isValidSquare(newRow, newCol)) break;
                
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        }
        
        return moves;
    }

    getBishopMoves(row, col) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        for (let [drow, dcol] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + drow * i;
                const newCol = col + dcol * i;
                
                if (!this.isValidSquare(newRow, newCol)) break;
                
                const target = this.board[newRow][newCol];
                if (!target) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (target.color !== this.board[row][col].color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        }
        
        return moves;
    }

    getQueenMoves(row, col) {
        return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
    }

    getKingMoves(row, col) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (let [drow, dcol] of directions) {
            const newRow = row + drow;
            const newCol = col + dcol;
            
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }

    getKnightMoves(row, col) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (let [drow, dcol] of knightMoves) {
            const newRow = row + drow;
            const newCol = col + dcol;
            
            if (this.isValidSquare(newRow, newCol)) {
                const target = this.board[newRow][newCol];
                if (!target || target.color !== this.board[row][col].color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }

    isInCheck(color) {
        const king = this.kings[color];
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === opponentColor) {
                    const moves = this.getPossibleMovesWithoutCheckValidation(row, col);
                    if (moves.some(move => move.row === king.row && move.col === king.col)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getPossibleMovesWithoutCheckValidation(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        switch (piece.type) {
            case 'pawn': return this.getPawnMoves(row, col);
            case 'rook': return this.getRookMoves(row, col);
            case 'bishop': return this.getBishopMoves(row, col);
            case 'queen': return this.getQueenMoves(row, col);
            case 'king': return this.getKingMoves(row, col);
            case 'knight': return this.getKnightMoves(row, col);
            default: return [];
        }
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
        // Make temporary move
        const originalPiece = this.board[toRow][toCol];
        const movingPiece = this.board[fromRow][fromCol];
        
        this.board[toRow][toCol] = movingPiece;
        this.board[fromRow][fromCol] = null;
        
        // Update king position if king moved
        if (movingPiece.type === 'king') {
            const oldKingPos = this.kings[movingPiece.color];
            this.kings[movingPiece.color] = { row: toRow, col: toCol };
            
            const inCheck = this.isInCheck(movingPiece.color);
            
            // Restore king position
            this.kings[movingPiece.color] = oldKingPos;
            
            // Restore board
            this.board[fromRow][fromCol] = movingPiece;
            this.board[toRow][toCol] = originalPiece;
            
            return inCheck;
        } else {
            const inCheck = this.isInCheck(movingPiece.color);
            
            // Restore board
            this.board[fromRow][fromCol] = movingPiece;
            this.board[toRow][toCol] = originalPiece;
            
            return inCheck;
        }
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // Make the move
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Update king position if king moved
        if (piece.type === 'king') {
            this.kings[piece.color] = { row: toRow, col: toCol };
            this.castlingRights[piece.color].kingside = false;
            this.castlingRights[piece.color].queenside = false;
        }
        
        // Update castling rights if rook moved
        if (piece.type === 'rook') {
            if (fromCol === 0) {
                this.castlingRights[piece.color].queenside = false;
            } else if (fromCol === 7) {
                this.castlingRights[piece.color].kingside = false;
            }
        }
        
        // Record move
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            captured: capturedPiece
        });
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Check for game over conditions
        this.checkGameOver();
        
        return true;
    }

    checkGameOver() {
        const hasValidMoves = this.hasValidMoves(this.currentPlayer);
        const inCheck = this.isInCheck(this.currentPlayer);
        
        if (!hasValidMoves) {
            if (inCheck) {
                this.isGameOver = true;
                return `${this.currentPlayer === 'white' ? 'Black' : 'White'} wins by checkmate!`;
            } else {
                this.isGameOver = true;
                return "Game ends in stalemate!";
            }
        } else if (inCheck) {
            return `${this.currentPlayer} is in check!`;
        }
        
        return "";
    }

    hasValidMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getPossibleMoves(row, col);
                    if (moves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    reset() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.isGameOver = false;
        this.boardFlipped = false;
        this.moveHistory = [];
        this.kings = { white: { row: 7, col: 4 }, black: { row: 0, col: 4 } };
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
    }
}

// Signal that this script loaded (helps startup status display)
try {
    if (document && document.getElementById) {
        const el = document.getElementById('status-game-functionality');
        if (el) el.textContent = 'game-functionality: loaded';
    }
    console.log('game-functionality loaded');
} catch (e) {
    console.warn('Could not update startup status for game-functionality:', e);
}