class ChessAI {
    constructor() {
        this.maxDepth = 3;
        
        // Piece values for evaluation
        this.pieceValues = {
            pawn: 100,
            knight: 320,
            bishop: 330,
            rook: 500,
            queen: 900,
            king: 20000
        };

        // Position tables for better piece placement
        this.pawnTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 25, 25, 10,  5,  5],
            [0,  0,  0, 20, 20,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-20,-20, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0]
        ];

        this.knightTable = [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ];
    }

    getBestMove(game) {
        const validMoves = this.getAllValidMoves(game, 'black');
        if (validMoves.length === 0) return null;

        let bestMove = null;
        let bestScore = -Infinity;

        for (let move of validMoves) {
            const score = this.minimax(game, move, this.maxDepth - 1, -Infinity, Infinity, false);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    minimax(game, move, depth, alpha, beta, maximizingPlayer) {
        // Make the move
        const originalPiece = game.board[move.to.row][move.to.col];
        const movingPiece = game.board[move.from.row][move.from.col];
        game.board[move.to.row][move.to.col] = movingPiece;
        game.board[move.from.row][move.from.col] = null;

        // Update king position if necessary
        let kingMoved = false;
        let originalKingPos = null;
        if (movingPiece.type === 'king') {
            kingMoved = true;
            originalKingPos = { ...game.kings[movingPiece.color] };
            game.kings[movingPiece.color] = { row: move.to.row, col: move.to.col };
        }

        let score;
        if (depth === 0 || this.isGameOver(game)) {
            score = this.evaluateBoard(game);
        } else {
            const color = maximizingPlayer ? 'black' : 'white';
            const moves = this.getAllValidMoves(game, color);
            
            if (maximizingPlayer) {
                score = -Infinity;
                for (let nextMove of moves) {
                    score = Math.max(score, this.minimax(game, nextMove, depth - 1, alpha, beta, false));
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) break;
                }
            } else {
                score = Infinity;
                for (let nextMove of moves) {
                    score = Math.min(score, this.minimax(game, nextMove, depth - 1, alpha, beta, true));
                    beta = Math.min(beta, score);
                    if (beta <= alpha) break;
                }
            }
        }

        // Restore the board
        game.board[move.from.row][move.from.col] = movingPiece;
        game.board[move.to.row][move.to.col] = originalPiece;
        
        if (kingMoved) {
            game.kings[movingPiece.color] = originalKingPos;
        }

        return score;
    }

    getAllValidMoves(game, color) {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = game.board[row][col];
                if (piece && piece.color === color) {
                    const pieceMoves = game.getPossibleMoves(row, col);
                    for (let move of pieceMoves) {
                        moves.push({
                            from: { row, col },
                            to: { row: move.row, col: move.col }
                        });
                    }
                }
            }
        }
        return moves;
    }

    evaluateBoard(game) {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = game.board[row][col];
                if (piece) {
                    let pieceScore = this.pieceValues[piece.type];
                    
                    // Add positional bonus
                    if (piece.type === 'pawn') {
                        pieceScore += this.getPawnPositionValue(row, col, piece.color);
                    } else if (piece.type === 'knight') {
                        pieceScore += this.getKnightPositionValue(row, col, piece.color);
                    }
                    
                    if (piece.color === 'black') {
                        score += pieceScore;
                    } else {
                        score -= pieceScore;
                    }
                }
            }
        }

        // Add bonus for controlling center
        score += this.evaluateCenterControl(game);
        
        // Penalize being in check
        if (game.isInCheck('black')) score -= 50;
        if (game.isInCheck('white')) score += 50;

        return score;
    }

    getPawnPositionValue(row, col, color) {
        const table = color === 'white' ? this.pawnTable : this.pawnTable.slice().reverse();
        return table[row][col];
    }

    getKnightPositionValue(row, col, color) {
        const table = color === 'white' ? this.knightTable : this.knightTable.slice().reverse();
        return table[row][col];
    }

    evaluateCenterControl(game) {
        let score = 0;
        const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
        
        for (let [row, col] of centerSquares) {
            const piece = game.board[row][col];
            if (piece) {
                if (piece.color === 'black') {
                    score += 10;
                } else {
                    score -= 10;
                }
            }
        }
        
        return score;
    }

    isGameOver(game) {
        return !game.hasValidMoves('white') || !game.hasValidMoves('black');
    }
}