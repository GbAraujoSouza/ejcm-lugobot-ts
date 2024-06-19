"use strict";
exports.__esModule = true;
exports.MyBot = void 0;
var lugo4node_1 = require("@lugobots/lugo4node");
var settings_1 = require("./settings");
var proto_exported_1 = require("@lugobots/lugo4node/dist/proto_exported");
var MyBot = /** @class */ (function () {
    function MyBot(side, number, initPosition, mapper) {
        this.side = side;
        this.number = number;
        this.mapper = mapper;
        this.initPosition = initPosition;
    }
    MyBot.prototype.onDisputing = function (inspector) {
        var _a;
        try {
            var orders = [];
            var me = inspector.getMe();
            if (!me)
                return orders;
            var ballPosition = (_a = inspector.getBall()) === null || _a === void 0 ? void 0 : _a.getPosition();
            if (!ballPosition)
                return orders;
            var moveDestination = null;
            if (this.shouldIHelp(me, inspector.getMyTeamPlayers(), ballPosition, 2)) {
                moveDestination = ballPosition;
                var moveOrder_1 = inspector.makeOrderMoveMaxSpeed(moveDestination);
                var catchOrder = inspector.makeOrderCatch();
                orders.push(moveOrder_1, catchOrder);
                return orders;
            }
            var ballRegion = this.mapper.getRegionFromPoint(inspector.getBall().getPosition());
            var inOurField = ballRegion.getCol() <= settings_1.MAPPER_COLS / 2;
            var state = inOurField ? "DEFENSIVE" : "OFFENSIVE";
            moveDestination = (0, settings_1.getMyExpectedPosition)(state, this.mapper, this.number);
            if (!moveDestination)
                return orders;
            var moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
            if (this.holdPosition(state, inspector)) {
                orders.push(inspector.makeOrderMoveToStop());
                return orders;
            }
            orders.push(moveOrder);
            return orders;
        }
        catch (e) {
            console.log("did not play this turn", e);
            return null;
        }
    };
    MyBot.prototype.onDefending = function (inspector) {
        var _a;
        try {
            var orders = [];
            var me = inspector.getMe();
            if (!me)
                return orders;
            var ballPosition = (_a = inspector.getBall()) === null || _a === void 0 ? void 0 : _a.getPosition();
            if (!ballPosition)
                return orders;
            var moveDestination = null;
            if (this.shouldMark(me, inspector.getMyTeamPlayers(), ballPosition, 2)) {
                moveDestination = ballPosition;
                var moveOrder_2 = inspector.makeOrderMoveMaxSpeed(moveDestination);
                var catchOrder = inspector.makeOrderCatch();
                orders.push(moveOrder_2, catchOrder);
                return orders;
            } /* else if (
              this.shouldIHelp(me, inspector.getMyTeamPlayers(), ballPosition, 1)
            ) {
              moveDestination = ballPosition;
              const moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
              const catchOrder = inspector.makeOrderCatch();
      
              orders.push(moveOrder, catchOrder);
              return orders;
            } */
            var ballRegion = this.mapper.getRegionFromPoint(inspector.getBall().getPosition());
            var inOurField = ballRegion.getCol() <= settings_1.MAPPER_COLS / 2;
            var state = inOurField ? "DEFENSIVE" : "OFFENSIVE";
            moveDestination = (0, settings_1.getMyExpectedPosition)(state, this.mapper, this.number);
            if (!moveDestination)
                return orders;
            var moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
            if (this.holdPosition(state, inspector)) {
                orders.push(inspector.makeOrderMoveToStop());
                return orders;
            }
            orders.push(moveOrder);
            return orders;
        }
        catch (e) {
            console.log("did not play this turn", e);
            return null;
        }
    };
    MyBot.prototype.onHolding = function (inspector) {
        try {
            var me = inspector.getMe();
            var attackGoalCenter = this.mapper.getAttackGoal().getCenter();
            var opponentGoal = this.mapper.getRegionFromPoint(attackGoalCenter);
            var myRegion = this.mapper.getRegionFromPoint(me.getPosition());
            var nearestAlly = this.getNearestAlly(me, inspector.getMyTeamPlayers());
            var orders = [];
            var myOrder = [inspector.makeOrderMoveMaxSpeed(attackGoalCenter)];
            // tocar bola
            //
            // pegar aliado mais proximo que nao esta na minha regiao
            var lastDistance = lugo4node_1.SPECS.FIELD_WIDTH;
            for (var _i = 0, _a = inspector.getMyTeamPlayers(); _i < _a.length; _i++) {
                var ally = _a[_i];
                var allyPosition = ally.getPosition();
                if (!allyPosition)
                    return orders;
                var distanceBetweenMeAndPlayer = lugo4node_1.geo.distanceBetweenPoints(me.getPosition(), allyPosition);
                if (this.equalRegion(this.mapper.getRegionFromPoint(allyPosition), myRegion)) {
                    continue;
                }
                if (distanceBetweenMeAndPlayer < lastDistance &&
                    me.getNumber() != ally.getNumber() &&
                    allyPosition.getX() > me.getPosition().getX()) {
                    nearestAlly = ally;
                }
                lastDistance = distanceBetweenMeAndPlayer;
            }
            for (var _b = 0, _c = inspector.getOpponentPlayers(); _b < _c.length; _b++) {
                var opponent = _c[_b];
                var opponentPosition = opponent.getPosition();
                if (!opponentPosition)
                    return orders;
                if (this.equalRegion(this.mapper.getRegionFromPoint(opponentPosition), myRegion) &&
                    opponent.getNumber() != 1 &&
                    opponentPosition.getX() > me.getPosition().getX()) {
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
                var goalCorner = this.getGoalCorner(inspector);
                myOrder = [inspector.makeOrderKickMaxSpeed(goalCorner)];
            }
            orders.push.apply(orders, myOrder);
            return orders;
        }
        catch (e) {
            console.log("did not play this turn", e);
            return null;
        }
    };
    MyBot.prototype.onSupporting = function (inspector) {
        var _a;
        try {
            var orders = [];
            var me = inspector.getMe();
            var myPosition = me.getPosition();
            if (!me || !myPosition)
                return orders;
            var ballPosition = (_a = inspector.getBall()) === null || _a === void 0 ? void 0 : _a.getPosition();
            if (!ballPosition)
                return orders;
            var moveDestination = null;
            /* if (this.shouldIHelp(me, inspector.getMyTeamPlayers(), ballPosition, 2)) {
              const currentRegion = this.mapper.getRegionFromPoint(me.getPosition());
              const y = currentRegion.getRow();
              const x = currentRegion.getCol();
              moveDestination = this.mapper.getRegion(y, x).getCenter();
      
              const moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
              orders.push(moveOrder);
              return orders;
            } */
            var ballRegion = this.mapper.getRegionFromPoint(inspector.getBall().getPosition());
            var shouldGetDefensive = ballRegion.getCol() <= settings_1.MAPPER_COLS / 3;
            var state = shouldGetDefensive ? "DEFENSIVE" : "OFFENSIVE";
            moveDestination = (0, settings_1.getMyExpectedPosition)(state, this.mapper, this.number);
            if (!moveDestination)
                return orders;
            var moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
            if (this.holdPosition(state, inspector)) {
                orders.push(inspector.makeOrderMoveToStop());
                return orders;
            }
            orders.push(moveOrder);
            return orders;
        }
        catch (e) {
            console.log("did not play this turn", e);
            return null;
        }
    };
    MyBot.prototype.asGoalkeeper = function (inspector, state) {
        var _a, _b;
        try {
            var orders = [];
            var position = (_a = inspector.getBall()) === null || _a === void 0 ? void 0 : _a.getPosition();
            if (!position)
                return orders;
            if (state !== lugo4node_1.PLAYER_STATE.DISPUTING_THE_BALL) {
                position = this.mapper.getDefenseGoal().getCenter();
            }
            if (state == lugo4node_1.PLAYER_STATE.HOLDING_THE_BALL) {
                // meio em cima fo camplo
                var target = new proto_exported_1.Point();
                target.setX(lugo4node_1.SPECS.FIELD_WIDTH / 2);
                if (this.mostOpponentSide(inspector) == "bot") {
                    target.setY(lugo4node_1.SPECS.MAX_Y_COORDINATE);
                }
                else {
                    target.setY(0);
                }
                var kickOrder = inspector.makeOrderKickMaxSpeed(target);
                orders.push(kickOrder);
            }
            var ballPosition = (_b = inspector.getBall()) === null || _b === void 0 ? void 0 : _b.getPosition();
            if (!ballPosition)
                return orders;
            //(state === PLAYER_STATE.DEFENDING && this.mapper.getRegionFromPoint(ballPosition).getCol() < 3)
            if (state === lugo4node_1.PLAYER_STATE.DISPUTING_THE_BALL &&
                this.mapper.getRegionFromPoint(ballPosition).getCol() < 2) {
                var jumpOrder = inspector.makeOrderJump(this.mapper.getDefenseGoal().getCenter(), lugo4node_1.SPECS.GOAL_KEEPER_JUMP_SPEED);
                orders.push(inspector.makeOrderMove(ballPosition, lugo4node_1.SPECS.PLAYER_MAX_SPEED), jumpOrder, inspector.makeOrderCatch());
                console.log("Jumped");
                return orders;
            }
            console.log("did not jumped");
            var myOrder = inspector.makeOrderMoveMaxSpeed(position);
            orders.push(myOrder, inspector.makeOrderCatch());
            return orders;
        }
        catch (e) {
            console.log("did not play this turn", e);
            return null;
        }
    };
    MyBot.prototype.gettingReady = function (inspector) {
        // This method is called when the score is changed or before the game starts.
        // We can change the team strategy or do anything else based on the outcome of the game so far.
        // for now, we are not going anything here.
    };
    MyBot.prototype.isINear = function (myPosition, targetPosition, dist) {
        var colDist = myPosition.getCol() - targetPosition.getCol();
        var rowDist = myPosition.getRow() - targetPosition.getRow();
        return Math.hypot(colDist, rowDist) <= dist;
    };
    MyBot.prototype.nearToPoint = function (myTeam, targetPosition) {
        var closest = myTeam[0];
        var lastDistance = lugo4node_1.geo.distanceBetweenPoints(closest.getPosition(), targetPosition);
        myTeam.forEach(function (player) {
            var currentDistance = lugo4node_1.geo.distanceBetweenPoints(player.getPosition(), targetPosition);
            if (lastDistance > currentDistance) {
                closest = player;
                lastDistance = currentDistance;
            }
        });
        return closest;
    };
    MyBot.prototype.shouldMark = function (me, myTeam, targetPosition, maxHelpers) {
        var nearestPlayers = 0;
        var myPosition = me.getPosition();
        if (!myPosition)
            return false;
        var myDistance = lugo4node_1.geo.distanceBetweenPoints(myPosition, targetPosition);
        for (var _i = 0, myTeam_1 = myTeam; _i < myTeam_1.length; _i++) {
            var teamMate = myTeam_1[_i];
            var teamMatePosition = teamMate.getPosition();
            if (!teamMatePosition)
                return false;
            if (teamMate.getNumber() != me.getNumber() &&
                lugo4node_1.geo.distanceBetweenPoints(teamMatePosition, targetPosition) <
                    myDistance &&
                myPosition.getX() < targetPosition.getX()) {
                nearestPlayers++;
                if (nearestPlayers >= maxHelpers) {
                    return false;
                }
            }
        }
        return true;
    };
    MyBot.prototype.shouldIHelp = function (me, myTeam, targetPosition, maxHelpers) {
        var nearestPlayers = 0;
        var myPosition = me.getPosition();
        if (!myPosition)
            return false;
        var myDistance = lugo4node_1.geo.distanceBetweenPoints(myPosition, targetPosition);
        for (var _i = 0, myTeam_2 = myTeam; _i < myTeam_2.length; _i++) {
            var teamMate = myTeam_2[_i];
            var teamMatePosition = teamMate.getPosition();
            if (!teamMatePosition)
                return false;
            if (teamMate.getNumber() != me.getNumber() &&
                lugo4node_1.geo.distanceBetweenPoints(teamMatePosition, targetPosition) < myDistance) {
                nearestPlayers++;
                if (nearestPlayers >= maxHelpers) {
                    return false;
                }
            }
        }
        return true;
    };
    MyBot.prototype.getNearestAlly = function (me, myPlayers) {
        var nearestPlayer;
        var lastDistance = lugo4node_1.SPECS.FIELD_WIDTH;
        var myPosition = me.getPosition();
        if (!myPosition)
            return nearestPlayer;
        for (var _i = 0, myPlayers_1 = myPlayers; _i < myPlayers_1.length; _i++) {
            var player = myPlayers_1[_i];
            var playerPosition = player.getPosition();
            if (!playerPosition)
                return nearestPlayer;
            var distanceBetweenMeAndPlayer = lugo4node_1.geo.distanceBetweenPoints(myPosition, playerPosition);
            if (distanceBetweenMeAndPlayer < lastDistance &&
                me.getNumber() != player.getNumber()) {
                nearestPlayer = player;
            }
            lastDistance = distanceBetweenMeAndPlayer;
        }
        return nearestPlayer;
    };
    MyBot.prototype.getNearestOpponent = function (me, opponentPlayers) {
        var nearestOpponent;
        var lastDistance = lugo4node_1.SPECS.FIELD_WIDTH;
        for (var _i = 0, opponentPlayers_1 = opponentPlayers; _i < opponentPlayers_1.length; _i++) {
            var opponent = opponentPlayers_1[_i];
            var distanceBetweenMeAndOpponent = lugo4node_1.geo.distanceBetweenPoints(me.getPosition(), opponent.getPosition());
            if (distanceBetweenMeAndOpponent < lastDistance) {
                nearestOpponent = opponent;
            }
            lastDistance = distanceBetweenMeAndOpponent;
        }
        return nearestOpponent;
    };
    MyBot.prototype.equalRegion = function (region1, region2) {
        return (region1.getCol() == region2.getCol() &&
            region1.getRow() == region2.getRow());
    };
    MyBot.prototype.getGoalCorner = function (inspector) {
        var _a;
        var goalKeeperPosition = (_a = inspector.getOpponentGoalkeeper()) === null || _a === void 0 ? void 0 : _a.getPosition();
        var goalCenter = this.mapper.getAttackGoal().getCenter();
        if ((goalKeeperPosition === null || goalKeeperPosition === void 0 ? void 0 : goalKeeperPosition.getY()) >= goalCenter.getY())
            return this.mapper.getAttackGoal().getBottomPole();
        return this.mapper.getAttackGoal().getTopPole();
    };
    MyBot.prototype.holdPosition = function (state, inspector) {
        var expectedPosition = (0, settings_1.getMyExpectedPosition)(state, this.mapper, this.number);
        return (lugo4node_1.geo.distanceBetweenPoints(inspector.getMe().getPosition(), expectedPosition) < lugo4node_1.SPECS.PLAYER_SIZE);
    };
    MyBot.prototype.mostOpponentSide = function (inspector) {
        var topCount = 0;
        var botCount = 0;
        for (var _i = 0, _a = inspector.getOpponentPlayers(); _i < _a.length; _i++) {
            var op = _a[_i];
            var opPos = op.getPosition();
            if (!opPos || op.getNumber() == 1)
                continue;
            if (this.mapper.getRegionFromPoint(opPos).getRow() <= settings_1.MAPPER_ROWS / 2) {
                topCount++;
            }
            else {
                botCount++;
            }
        }
        return topCount > botCount ? "top" : "bot";
    };
    return MyBot;
}());
exports.MyBot = MyBot;
