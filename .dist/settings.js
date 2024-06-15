"use strict";
exports.__esModule = true;
exports.getMyExpectedPosition = exports.PLAYER_TACTIC_POSITIONS = exports.PLAYER_INITIAL_POSITIONS = exports.MAPPER_ROWS = exports.MAPPER_COLS = void 0;
exports.MAPPER_COLS = 19;
exports.MAPPER_ROWS = 15;
// here we define the initial positions
exports.PLAYER_INITIAL_POSITIONS = {
    1: { Col: 0, Row: 0 },
    2: { Col: 2, Row: 7 },
    3: { Col: 4, Row: 9 },
    4: { Col: 4, Row: 5 },
    5: { Col: 6, Row: 11 },
    6: { Col: 6, Row: 7 },
    7: { Col: 6, Row: 3 },
    8: { Col: 8, Row: 12 },
    9: { Col: 8, Row: 8 },
    10: { Col: 8, Row: 6 },
    11: { Col: 8, Row: 2 }
};
// here we
exports.PLAYER_TACTIC_POSITIONS = {
    DEFENSIVE: {
        2: { Col: 1, Row: 11 },
        3: { Col: 1, Row: 9 },
        4: { Col: 1, Row: 5 },
        5: { Col: 1, Row: 3 },
        6: { Col: 3, Row: 11 },
        7: { Col: 3, Row: 7 },
        8: { Col: 3, Row: 3 },
        9: { Col: 6, Row: 8 },
        10: { Col: 6, Row: 1 },
        11: { Col: 8, Row: 4 }
    },
    NORMAL: {
        2: { Col: 1, Row: 1 },
        3: { Col: 3, Row: 2 },
        4: { Col: 3, Row: 3 },
        5: { Col: 1, Row: 4 },
        6: { Col: 5, Row: 1 },
        7: { Col: 7, Row: 2 },
        8: { Col: 7, Row: 3 },
        9: { Col: 5, Row: 4 },
        10: { Col: 6, Row: 4 },
        11: { Col: 6, Row: 1 }
    },
    OFFENSIVE: {
        2: { Col: 3, Row: 1 },
        3: { Col: 5, Row: 2 },
        4: { Col: 5, Row: 3 },
        5: { Col: 3, Row: 4 },
        6: { Col: 7, Row: 1 },
        7: { Col: 8, Row: 2 },
        8: { Col: 8, Row: 3 },
        9: { Col: 7, Row: 4 },
        10: { Col: 9, Row: 4 },
        11: { Col: 9, Row: 1 }
    }
};
function getMyExpectedPosition(state, mapper, myNumber) {
    if (exports.PLAYER_TACTIC_POSITIONS[state]) {
        var expectedRegion = mapper.getRegion(exports.PLAYER_TACTIC_POSITIONS[state][myNumber].Col, exports.PLAYER_TACTIC_POSITIONS[state][myNumber].Row);
        return expectedRegion.getCenter();
    }
    else
        return null;
}
exports.getMyExpectedPosition = getMyExpectedPosition;
