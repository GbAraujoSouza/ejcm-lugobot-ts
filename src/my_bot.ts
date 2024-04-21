`use strict`;
import { Bot, GameSnapshotInspector, Lugo, Mapper, PLAYER_STATE, distanceBetweenPoints, Region, geo, SPECS } from '@lugobots/lugo4node'
import { getMyExpectedPosition, MAPPER_COLS, MAPPER_ROWS } from './settings';
import { Point } from '@lugobots/lugo4node/dist/proto_exported';

type MethodReturn = Lugo.Order[] | { orders: Lugo.Order[]; debug_message: string; } | null;

export class MyBot implements Bot {

  side: Lugo.Team.Side;

  number: number;

  initPosition: Lugo.Point;

  mapper: Mapper;

  constructor(side: Lugo.Team.Side, number: number, initPosition: Lugo.Point, mapper: Mapper) {
    this.side = side
    this.number = number
    this.mapper = mapper
    this.initPosition = initPosition
  }

  onDisputing(inspector: GameSnapshotInspector): MethodReturn {
    try {
      const orders = []
      const me = inspector.getMe()
      const ballPosition = inspector.getBall().getPosition()

      // by default, I will stay at my tactic position
      let moveDestination = getMyExpectedPosition(inspector, this.mapper, this.number)



      if (this.shouldIHelp(me, inspector.getMyTeamPlayers(), ballPosition, 3)) {
        moveDestination = ballPosition;
      }

      const moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination)

      const catchOrder = inspector.makeOrderCatch()

      orders.push(moveOrder, catchOrder)

      return orders
    } catch (e) {
      console.log(`did not play this turn`, e)
      return null
    }
  }

  onDefending(inspector: GameSnapshotInspector): MethodReturn {
    try {
      const orders = []
      const me = inspector.getMe()
      const ballPosition = inspector.getBall().getPosition()

      // by default, I will stay at my tactic position
      let moveDestination = getMyExpectedPosition(inspector, this.mapper, this.number)

      if (this.shouldIHelp(me, inspector.getMyTeamPlayers(), ballPosition, 3)) {
        moveDestination = ballPosition;
      }
      const moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination)
      const catchOrder = inspector.makeOrderCatch()

      if (this.holdPosition(inspector)) {
        orders.push(inspector.makeOrderMoveToStop())
        return orders
      }

      orders.push(moveOrder, catchOrder)
      return orders
    } catch (e) {
      console.log(`did not play this turn`, e)
      return null
    }
  }

  onHolding(inspector: GameSnapshotInspector): MethodReturn {
    try {
      const me: any = inspector.getMe()
      const attackGoalCenter = this.mapper.getAttackGoal().getCenter();
      const opponentGoal = this.mapper.getRegionFromPoint(attackGoalCenter)
      const myRegion = this.mapper.getRegionFromPoint(me.getPosition())
      let nearestAlly = this.getNearestAlly(me, inspector.getMyTeamPlayers())

      const orders = []
      let myOrder= inspector.makeOrderMoveMaxSpeed(attackGoalCenter)

      // tocar bola
      //
      // pegar aliado mais proximo que nao esta na minha regiao
      let lastDistance = SPECS.FIELD_WIDTH;
      for (const ally of inspector.getMyTeamPlayers()) {
        const distanceBetweenMeAndPlayer = geo.distanceBetweenPoints(me.getPosition(), ally.getPosition());
        if (this.equalRegion(this.mapper.getRegionFromPoint(ally.getPosition()), myRegion)) {
          continue;
        }
        if (distanceBetweenMeAndPlayer < lastDistance && me.getNumber() != ally.getNumber()) {
          nearestAlly = ally;
        }
        lastDistance = distanceBetweenMeAndPlayer;
      }

      for (const opponent of inspector.getOpponentPlayers()) {
        if (this.equalRegion(this.mapper.getRegionFromPoint(opponent.getPosition()), myRegion.front()) && opponent.getNumber() != 1) { // o numero 1 e o numero do goleiro
          myOrder = inspector.makeOrderKickMaxSpeed(nearestAlly.getPosition())
          break;
        }
      }

      // chutar pro gol
      if (this.isINear(myRegion, opponentGoal, 1)) {
        const goalCorner = this.getGoalCorner(inspector);
        myOrder = inspector.makeOrderKickMaxSpeed(goalCorner);
      }


      orders.push(myOrder)
      return orders
    } catch (e) {
      console.log(`did not play this turn`, e)
      return null
    }
  }

  onSupporting(inspector: GameSnapshotInspector): MethodReturn {
    try {
      const orders = []
      const me = inspector.getMe()
      // if (!me) return orders;
      const ballHolderPosition = inspector.getBall()?.getPosition()

      let moveDestination = getMyExpectedPosition(inspector, this.mapper, this.number)

      if (this.shouldIHelp(me, inspector.getMyTeamPlayers(), ballHolderPosition, 3)) {
        moveDestination = ballHolderPosition;
      }

      if (geo.distanceBetweenPoints(me.getPosition(), ballHolderPosition) < 3 * SPECS.PLAYER_SIZE || this.holdPosition(inspector)) {
        const stopOrder = inspector.makeOrderMoveToStop();
        orders.push(stopOrder);
        return orders;
      }

      const myOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
      orders.push(myOrder)
      return orders
    } catch (e) {
      console.log(`did not play this turn`, e)
      return null
    }
  }

  asGoalkeeper(inspector: GameSnapshotInspector, state: PLAYER_STATE): MethodReturn {
    try {
      const orders = []
      let position = inspector.getBall().getPosition()
      if (state !== PLAYER_STATE.DISPUTING_THE_BALL) {
        position = this.mapper.getDefenseGoal().getCenter()
      }
      if (state == PLAYER_STATE.HOLDING_THE_BALL) {
        // meio em cima fo camplo
        const target = new Point();
        target.setX(SPECS.FIELD_WIDTH / 2)
        if (this.mostOpponentSide(inspector) == "bot") {
          target.setY(SPECS.MAX_Y_COORDINATE);
        } else {
          target.setY(0);
        }
        const kickOrder = inspector.makeOrderKickMaxSpeed(target);
        orders.push(kickOrder);
      }

      const myOrder = inspector.makeOrderMoveMaxSpeed(position)

      orders.push(myOrder, inspector.makeOrderCatch())
      return orders
    } catch (e) {
      console.log(`did not play this turn`, e)
      return null
    }
  }

  gettingReady(inspector: GameSnapshotInspector): void {
    // This method is called when the score is changed or before the game starts.
    // We can change the team strategy or do anything else based on the outcome of the game so far.
    // for now, we are not going anything here.
  }

  private isINear(myPosition: Region, targetPosition: Region, dist: number): boolean {
    const colDist = myPosition.getCol() - targetPosition.getCol()
    const rowDist = myPosition.getRow() - targetPosition.getRow()
    return Math.hypot(colDist, rowDist) <= dist
  }

  private shouldIHelp(me: Lugo.Player, myTeam: Lugo.Player[], targetPosition: Lugo.Point, maxHelpers: number) {
    let nearestPlayers = 0;
    const myDistance = geo.distanceBetweenPoints(me.getPosition(), targetPosition);
    for (const teamMate of myTeam) {
      if (teamMate.getNumber() != me.getNumber() && geo.distanceBetweenPoints(teamMate.getPosition(), targetPosition) < myDistance) {
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
    let lastDistance = SPECS.FIELD_WIDTH

    for (const player of myPlayers) {
      const distanceBetweenMeAndPlayer = geo.distanceBetweenPoints(me.getPosition(), player.getPosition());
      if (distanceBetweenMeAndPlayer < lastDistance && me.getNumber() != player.getNumber()) {
        nearestPlayer = player;
      }
      lastDistance = distanceBetweenMeAndPlayer
    }

    return nearestPlayer;
  }
  private getNearestOpponent(me: Lugo.Player, opponentPlayers: Lugo.Player[]) {
    let nearestOpponent;
    let lastDistance = SPECS.FIELD_WIDTH;

    for (const opponent of opponentPlayers) {
      const distanceBetweenMeAndOpponent = geo.distanceBetweenPoints(me.getPosition(), opponent.getPosition());
      if (distanceBetweenMeAndOpponent < lastDistance) {
        nearestOpponent = opponent;
      }
      lastDistance = distanceBetweenMeAndOpponent;
    }
    return nearestOpponent;
  }
  private equalRegion(region1: Region, region2: Region) {
    return region1.getCol() == region2.getCol() && region1.getRow() == region2.getRow()
  }
  private getGoalCorner(inspector: GameSnapshotInspector) {
    const goalKeeperPosition = inspector.getOpponentGoalkeeper()?.getPosition();
    const goalCenter = this.mapper.getAttackGoal().getCenter();

    if (goalKeeperPosition?.getY() >= goalCenter.getY())
      return this.mapper.getAttackGoal().getBottomPole();
    return this.mapper.getAttackGoal().getTopPole();
  }
  private holdPosition(inspector: GameSnapshotInspector) {
    const expectedPosition = getMyExpectedPosition(inspector, this.mapper, this.number);
    return geo.distanceBetweenPoints(inspector.getMe().getPosition(), expectedPosition) < SPECS.PLAYER_SIZE
  }
  private mostOpponentSide(inspector: GameSnapshotInspector){
    let topCount = 0;
    let botCount = 0;
    for (const op of inspector.getOpponentPlayers()) {
      const opPos = op.getPosition();
      if (!opPos || op.getNumber() == 1) continue;
      if (this.mapper.getRegionFromPoint(opPos).getRow() <= MAPPER_ROWS / 2){
        topCount++;
      }else {
        botCount++;
      }
    }
    return (topCount > botCount) ? "top" : "bot";
  }
}

