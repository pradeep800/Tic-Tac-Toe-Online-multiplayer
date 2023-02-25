import { winningPositions } from "./winningPos.js";
export default function WinCheck(board, x) {
    for (let i = 0; i < winningPositions.length; i++) {
        let j = 0;
        for (j = 0; j < winningPositions[i].length; j++) {
            if (board[winningPositions[i][j]] !== x) {
                break;
            }
        }
        if (j === winningPositions[i].length) {
            return true;
        }
    }
    return false;
}
export function NoTurns(board) {
    let turnleft = 0;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            turnleft++;
        }
    }
    return turnleft === 0;
}
//# sourceMappingURL=WinCheck.js.map