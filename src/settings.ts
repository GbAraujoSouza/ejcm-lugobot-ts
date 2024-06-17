`use strict`;

// We will map the field into cols and rows, so the mapper will read the regions for us
// Read https://github.com/lugobots/lugo4node#mapper-and-region-classes
import {
  Lugo,
  SPECS,
  Mapper,
  GameSnapshotInspector,
} from "@lugobots/lugo4node";

export type GameState = "OFFENSIVE" | "DEFENSIVE";

export const MAPPER_COLS = 19;
export const MAPPER_ROWS = 17;

// here we define the initial positions
export const PLAYER_INITIAL_POSITIONS = {
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
  11: { Col: 8, Row: 3 },
};

// here we
export const PLAYER_TACTIC_POSITIONS = {
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
    11: { Col: 9, Row: 3 },
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
    11: { Col: 18, Row: 3 },
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
