"use strict";
exports.__esModule = true;
exports.getMyExpectedPosition = exports.PLAYER_TACTIC_POSITIONS = exports.PLAYER_INITIAL_POSITIONS = exports.MAPPER_ROWS = exports.MAPPER_COLS = void 0;
exports.MAPPER_COLS = 19;
exports.MAPPER_ROWS = 17;
// here we define the initial positions
exports.PLAYER_INITIAL_POSITIONS = {
    1: { Col: 0, Row: 8 },
    2: { Col: 4, Row: 10 },
    3: { Col: 2, Row: 8 },
    4: { Col: 4, Row: 6 },
    5: { Col: 6, Row: 4 },
    6: { Col: 6, Row: 12 },
    7: { Col: 8, Row: 13 },
    8: { Col: 6, Row: 8 },
    9: { Col: 8, Row: 9 },
    10: { Col: 8, Row: 7 },
    11: { Col: 8, Row: 3 }
};
// here we
exports.PLAYER_TACTIC_POSITIONS = {
    DEFENSIVE: {
        2: { Col: 0, Row: 13 },
        3: { Col: 1, Row: 10 },
        4: { Col: 1, Row: 6 },
        5: { Col: 0, Row: 3 },
        6: { Col: 3, Row: 12 },
        7: { Col: 7, Row: 10 },
        8: { Col: 4, Row: 8 },
        9: { Col: 3, Row: 4 },
        10: { Col: 6, Row: 3 },
        11: { Col: 9, Row: 3 }
    },
    OFFENSIVE: {
        2: { Col: 11, Row: 12 },
        3: { Col: 8, Row: 10 },
        4: { Col: 8, Row: 6 },
        5: { Col: 11, Row: 4 },
        6: { Col: 15, Row: 11 },
        7: { Col: 18, Row: 13 },
        8: { Col: 13, Row: 7 },
        9: { Col: 17, Row: 10 },
        10: { Col: 17, Row: 6 },
        11: { Col: 18, Row: 3 }
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
