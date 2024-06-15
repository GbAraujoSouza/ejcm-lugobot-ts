`use strict`;

// We will map the field into cols and rows, so the mapper will read the regions for us
// Read https://github.com/lugobots/lugo4node#mapper-and-region-classes
import {
  Lugo,
  SPECS,
  Mapper,
  GameSnapshotInspector,
} from "@lugobots/lugo4node";

export type GameState = "OFFENSIVE" | "NORMAL" | "DEFENSIVE";

export const MAPPER_COLS = 19;
export const MAPPER_ROWS = 15;

// here we define the initial positions
export const PLAYER_INITIAL_POSITIONS = {
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
  11: { Col: 8, Row: 2 },
};

// here we
export const PLAYER_TACTIC_POSITIONS = {
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
    11: { Col: 8, Row: 4 },
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
    11: { Col: 6, Row: 1 },
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
    11: { Col: 9, Row: 1 },
  },
};

export function getMyExpectedPosition(
  state: GameState,
  mapper: Mapper,
  myNumber: number
): Lugo.Point | null {
  if (PLAYER_TACTIC_POSITIONS[state]) {
    const expectedRegion = mapper.getRegion(
      PLAYER_TACTIC_POSITIONS[state][myNumber].Col,
      PLAYER_TACTIC_POSITIONS[state][myNumber].Row
    );
    return expectedRegion.getCenter();
  } else return null;
}
