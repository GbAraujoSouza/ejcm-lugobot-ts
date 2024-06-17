`use strict`;
import {
  Bot,
  GameSnapshotInspector,
  Lugo,
  Mapper,
  PLAYER_STATE,
  distanceBetweenPoints,
  Region,
  geo,
  SPECS,
} from "@lugobots/lugo4node";
import {
  GameState,
  getMyExpectedPosition,
  MAPPER_COLS,
  MAPPER_ROWS,
} from "./settings";
import { Order, Point, Vector } from "@lugobots/lugo4node/dist/proto_exported";

type MethodReturn =
  | Lugo.Order[]
  | { orders: Lugo.Order[]; debug_message: string }
  | null;

export class MyBot implements Bot {
  side: Lugo.Team.Side;

  number: number;

  initPosition: Lugo.Point;

  mapper: Mapper;

  constructor(
    side: Lugo.Team.Side,
    number: number,
    initPosition: Lugo.Point,
    mapper: Mapper
  ) {
    this.side = side;
    this.number = number;
    this.mapper = mapper;
    this.initPosition = initPosition;
  }

  onDisputing(inspector: GameSnapshotInspector): MethodReturn {
    try {
      const orders: Order[] = [];
      const me = inspector.getMe();
      if (!me) return orders;

      const ballPosition = inspector.getBall()?.getPosition();
      if (!ballPosition) return orders;

      let moveDestination: Point | null = null;
      if (this.shouldIHelp(me, inspector.getMyTeamPlayers(), ballPosition, 2)) {
        moveDestination = ballPosition;
        const moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
        const catchOrder = inspector.makeOrderCatch();

        orders.push(moveOrder, catchOrder);
        return orders;
      }
      const ballRegion = this.mapper.getRegionFromPoint(
        inspector.getBall().getPosition()
      );
      const inOurField = ballRegion.getCol() <= MAPPER_COLS / 2;
      const state = inOurField ? "DEFENSIVE" : "OFFENSIVE";
      moveDestination = getMyExpectedPosition(state, this.mapper, this.number);
      if (!moveDestination) return orders;
      const moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
      if (this.holdPosition(state, inspector)) {
        orders.push(inspector.makeOrderMoveToStop());
        return orders;
      }
      orders.push(moveOrder);
      return orders;
    } catch (e) {
      console.log(`did not play this turn`, e);
      return null;
    }
  }

  onDefending(inspector: GameSnapshotInspector): MethodReturn {
    try {
      const orders: Order[] = [];
      const me = inspector.getMe();
      if (!me) return orders;

      const ballPosition = inspector.getBall()?.getPosition();
      if (!ballPosition) return orders;

      let moveDestination: Point | null = null;
      if (this.shouldIHelp(me, inspector.getMyTeamPlayers(), ballPosition, 2)) {
        moveDestination = ballPosition;
        const moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
        const catchOrder = inspector.makeOrderCatch();

        orders.push(moveOrder, catchOrder);
        return orders;
      }
      const ballRegion = this.mapper.getRegionFromPoint(
        inspector.getBall().getPosition()
      );
      const inOurField = ballRegion.getCol() <= MAPPER_COLS / 2;
      const state = inOurField ? "DEFENSIVE" : "OFFENSIVE";
      moveDestination = getMyExpectedPosition(state, this.mapper, this.number);
      if (!moveDestination) return orders;
      const moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
      if (this.holdPosition(state, inspector)) {
        orders.push(inspector.makeOrderMoveToStop());
        return orders;
      }
      orders.push(moveOrder);

      return orders;
    } catch (e) {
      console.log(`did not play this turn`, e);
      return null;
    }
  }

  onHolding(inspector: GameSnapshotInspector): MethodReturn {
    try {
      const me: any = inspector.getMe();
      const attackGoalCenter = this.mapper.getAttackGoal().getCenter();
      const opponentGoal = this.mapper.getRegionFromPoint(attackGoalCenter);
      const myRegion = this.mapper.getRegionFromPoint(me.getPosition());
      let nearestAlly = this.getNearestAlly(me, inspector.getMyTeamPlayers());

      const orders: Order[] = [];
      let myOrder = [inspector.makeOrderMoveMaxSpeed(attackGoalCenter)];

      // tocar bola
      //
      // pegar aliado mais proximo que nao esta na minha regiao
      let lastDistance = SPECS.FIELD_WIDTH;
      for (const ally of inspector.getMyTeamPlayers()) {
        const allyPosition = ally.getPosition();
        if (!allyPosition) return orders;

        const distanceBetweenMeAndPlayer = geo.distanceBetweenPoints(
          me.getPosition(),
          allyPosition
        );
        if (
          this.equalRegion(
            this.mapper.getRegionFromPoint(allyPosition),
            myRegion
          )
        ) {
          continue;
        }
        if (
          distanceBetweenMeAndPlayer < lastDistance &&
          me.getNumber() != ally.getNumber() &&
          allyPosition.getX() > me.getPosition().getX()
        ) {
          nearestAlly = ally;
        }
        lastDistance = distanceBetweenMeAndPlayer;
      }

      for (const opponent of inspector.getOpponentPlayers()) {
        const opponentPosition = opponent.getPosition();
        if (!opponentPosition) return orders;

        if (
          this.equalRegion(
            this.mapper.getRegionFromPoint(opponentPosition),
            myRegion
          ) &&
          opponent.getNumber() != 1 &&
          opponentPosition.getX() > me.getPosition().getX()
        ) {
          // o numero 1 e o numero do goleiro
          myOrder = [
            inspector.makeOrderMoveMaxSpeed(nearestAlly.getPosition()),
            inspector.makeOrderKickMaxSpeed(nearestAlly.getPosition()),
          ];
          break;
        }
      }

      // chutar pro gol
      if (this.isINear(myRegion, opponentGoal, 2)) {
        const goalCorner = this.getGoalCorner(inspector);
        myOrder = [inspector.makeOrderKickMaxSpeed(goalCorner)];
      }

      orders.push(...myOrder);
      return orders;
    } catch (e) {
      console.log(`did not play this turn`, e);
      return null;
    }
  }

  onSupporting(inspector: GameSnapshotInspector): MethodReturn {
    try {
      const orders: Order[] = [];
      const me = inspector.getMe();
      const myPosition = me.getPosition();
      if (!me || !myPosition) return orders;

      const ballPosition = inspector.getBall()?.getPosition();
      if (!ballPosition) return orders;

      let moveDestination: Point | null = null;
      /* if (this.shouldIHelp(me, inspector.getMyTeamPlayers(), ballPosition, 2)) {
        const currentRegion = this.mapper.getRegionFromPoint(me.getPosition());
        const y = currentRegion.getRow();
        const x = currentRegion.getCol();
        moveDestination = this.mapper.getRegion(y, x).getCenter();

        const moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
        orders.push(moveOrder);
        return orders;
      } */
      const ballRegion = this.mapper.getRegionFromPoint(
        inspector.getBall().getPosition()
      );
      const inOurField = ballRegion.getCol() <= MAPPER_COLS / 2;
      const state = inOurField ? "DEFENSIVE" : "OFFENSIVE";
      moveDestination = getMyExpectedPosition(state, this.mapper, this.number);
      if (!moveDestination) return orders;
      const moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
      if (this.holdPosition(state, inspector)) {
        orders.push(inspector.makeOrderMoveToStop());
        return orders;
      }
      orders.push(moveOrder);

      return orders;
    } catch (e) {
      console.log(`did not play this turn`, e);
      return null;
    }
  }

  asGoalkeeper(
    inspector: GameSnapshotInspector,
    state: PLAYER_STATE
  ): MethodReturn {
    try {
      const orders: Order[] = [];
      let position = inspector.getBall()?.getPosition();
      if (!position) return orders;

      if (state !== PLAYER_STATE.DISPUTING_THE_BALL) {
        position = this.mapper.getDefenseGoal().getCenter();
      }
      if (state == PLAYER_STATE.HOLDING_THE_BALL) {
        // meio em cima fo camplo
        const target = new Point();
        target.setX(SPECS.FIELD_WIDTH / 2);
        if (this.mostOpponentSide(inspector) == "bot") {
          target.setY(SPECS.MAX_Y_COORDINATE);
        } else {
          target.setY(0);
        }
        const kickOrder = inspector.makeOrderKickMaxSpeed(target);
        orders.push(kickOrder);
      }

      const ballPosition = inspector.getBall()?.getPosition();
      if (!ballPosition) return orders;

      //(state === PLAYER_STATE.DEFENDING && this.mapper.getRegionFromPoint(ballPosition).getCol() < 3)

      if (
        state === PLAYER_STATE.DISPUTING_THE_BALL &&
        this.mapper.getRegionFromPoint(ballPosition).getCol() < 2
      ) {
        const jumpOrder = inspector.makeOrderJump(
          this.mapper.getDefenseGoal().getCenter(),
          SPECS.GOAL_KEEPER_JUMP_SPEED
        );
        orders.push(
          inspector.makeOrderMove(ballPosition, SPECS.PLAYER_MAX_SPEED),
          jumpOrder,
          inspector.makeOrderCatch()
        );
        console.log("Jumped");
        return orders;
      }
      console.log("did not jumped");

      const myOrder = inspector.makeOrderMoveMaxSpeed(position);

      orders.push(myOrder, inspector.makeOrderCatch());
      return orders;
    } catch (e) {
      console.log(`did not play this turn`, e);
      return null;
    }
  }

  gettingReady(inspector: GameSnapshotInspector): void {
    // This method is called when the score is changed or before the game starts.
    // We can change the team strategy or do anything else based on the outcome of the game so far.
    // for now, we are not going anything here.
  }

  private isINear(
    myPosition: Region,
    targetPosition: Region,
    dist: number
  ): boolean {
    const colDist = myPosition.getCol() - targetPosition.getCol();
    const rowDist = myPosition.getRow() - targetPosition.getRow();
    return Math.hypot(colDist, rowDist) <= dist;
  }

  private nearToPoint(myTeam: Lugo.Player[], targetPosition: Lugo.Point) {
    let closest = myTeam[0];
    let lastDistance = geo.distanceBetweenPoints(
      closest.getPosition(),
      targetPosition
    );
    myTeam.forEach((player) => {
      const currentDistance = geo.distanceBetweenPoints(
        player.getPosition(),
        targetPosition
      );
      if (lastDistance > currentDistance) {
        closest = player;
        lastDistance = currentDistance;
      }
    });
    return closest;
  }

  private shouldIHelp(
    me: Lugo.Player,
    myTeam: Lugo.Player[],
    targetPosition: Lugo.Point,
    maxHelpers: number
  ) {
    let nearestPlayers = 0;
    const myPosition = me.getPosition();
    if (!myPosition) return false;

    const myDistance = geo.distanceBetweenPoints(myPosition, targetPosition);
    for (const teamMate of myTeam) {
      const teamMatePosition = teamMate.getPosition();
      if (!teamMatePosition) return false;

      if (
        teamMate.getNumber() != me.getNumber() &&
        geo.distanceBetweenPoints(teamMatePosition, targetPosition) < myDistance
      ) {
        nearestPlayers++;
        if (nearestPlayers >= maxHelpers) {
          return false;
        }
      }
    }
    return true;
  }
  private getNearestAlly(me: Lugo.Player, myPlayers: Lugo.Player[]) {
    let nearestPlayer;
    let lastDistance = SPECS.FIELD_WIDTH;
    const myPosition = me.getPosition();

    if (!myPosition) return nearestPlayer;

    for (const player of myPlayers) {
      const playerPosition = player.getPosition();
      if (!playerPosition) return nearestPlayer;

      const distanceBetweenMeAndPlayer = geo.distanceBetweenPoints(
        myPosition,
        playerPosition
      );
      if (
        distanceBetweenMeAndPlayer < lastDistance &&
        me.getNumber() != player.getNumber()
      ) {
        nearestPlayer = player;
      }
      lastDistance = distanceBetweenMeAndPlayer;
    }

    return nearestPlayer;
  }
  private getNearestOpponent(me: Lugo.Player, opponentPlayers: Lugo.Player[]) {
    let nearestOpponent;
    let lastDistance = SPECS.FIELD_WIDTH;

    for (const opponent of opponentPlayers) {
      const distanceBetweenMeAndOpponent = geo.distanceBetweenPoints(
        me.getPosition(),
        opponent.getPosition()
      );
      if (distanceBetweenMeAndOpponent < lastDistance) {
        nearestOpponent = opponent;
      }
      lastDistance = distanceBetweenMeAndOpponent;
    }
    return nearestOpponent;
  }
  private equalRegion(region1: Region, region2: Region) {
    return (
      region1.getCol() == region2.getCol() &&
      region1.getRow() == region2.getRow()
    );
  }
  private getGoalCorner(inspector: GameSnapshotInspector) {
    const goalKeeperPosition = inspector.getOpponentGoalkeeper()?.getPosition();
    const goalCenter = this.mapper.getAttackGoal().getCenter();

    if (goalKeeperPosition?.getY() >= goalCenter.getY())
      return this.mapper.getAttackGoal().getBottomPole();
    return this.mapper.getAttackGoal().getTopPole();
  }
  private holdPosition(state: GameState, inspector: GameSnapshotInspector) {
    const expectedPosition = getMyExpectedPosition(
      state,
      this.mapper,
      this.number
    );
    return (
      geo.distanceBetweenPoints(
        inspector.getMe().getPosition(),
        expectedPosition
      ) < SPECS.PLAYER_SIZE
    );
  }
  private mostOpponentSide(inspector: GameSnapshotInspector) {
    let topCount = 0;
    let botCount = 0;
    for (const op of inspector.getOpponentPlayers()) {
      const opPos = op.getPosition();
      if (!opPos || op.getNumber() == 1) continue;
      if (this.mapper.getRegionFromPoint(opPos).getRow() <= MAPPER_ROWS / 2) {
        topCount++;
      } else {
        botCount++;
      }
    }
    return topCount > botCount ? "top" : "bot";
  }
}
