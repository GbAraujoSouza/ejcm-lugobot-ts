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
        try {
            var orders = [];
            var me = inspector.getMe();
            var ballPosition = inspector.getBall().getPosition();
            // by default, I will stay at my tactic position
            var moveDestination = (0, settings_1.getMyExpectedPosition)(inspector, this.mapper, this.number);
            if (this.shouldIHelp(me, inspector.getMyTeamPlayers(), ballPosition, 3)) {
                moveDestination = ballPosition;
            }
            var moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
            var catchOrder = inspector.makeOrderCatch();
            orders.push(moveOrder, catchOrder);
            return orders;
        }
        catch (e) {
            console.log("did not play this turn", e);
            return null;
        }
    };
    MyBot.prototype.onDefending = function (inspector) {
        try {
            var orders = [];
            var me = inspector.getMe();
            var ballPosition = inspector.getBall().getPosition();
            // by default, I will stay at my tactic position
            var moveDestination = (0, settings_1.getMyExpectedPosition)(inspector, this.mapper, this.number);
            if (this.shouldIHelp(me, inspector.getMyTeamPlayers(), ballPosition, 3)) {
                moveDestination = ballPosition;
            }
            var moveOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
            var catchOrder = inspector.makeOrderCatch();
            if (this.holdPosition(inspector)) {
                orders.push(inspector.makeOrderMoveToStop());
                return orders;
            }
            orders.push(moveOrder, catchOrder);
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
            var myOrder = inspector.makeOrderMoveMaxSpeed(attackGoalCenter);
            // tocar bola
            //
            // pegar aliado mais proximo que nao esta na minha regiao
            var lastDistance = lugo4node_1.SPECS.FIELD_WIDTH;
            for (var _i = 0, _a = inspector.getMyTeamPlayers(); _i < _a.length; _i++) {
                var ally = _a[_i];
                var distanceBetweenMeAndPlayer = lugo4node_1.geo.distanceBetweenPoints(me.getPosition(), ally.getPosition());
                if (this.equalRegion(this.mapper.getRegionFromPoint(ally.getPosition()), myRegion)) {
                    continue;
                }
                if (distanceBetweenMeAndPlayer < lastDistance && me.getNumber() != ally.getNumber()) {
                    nearestAlly = ally;
                }
                lastDistance = distanceBetweenMeAndPlayer;
            }
            for (var _b = 0, _c = inspector.getOpponentPlayers(); _b < _c.length; _b++) {
                var opponent = _c[_b];
                if (this.equalRegion(this.mapper.getRegionFromPoint(opponent.getPosition()), myRegion.front()) && opponent.getNumber() != 1) { // o numero 1 e o numero do goleiro
                    myOrder = inspector.makeOrderKickMaxSpeed(nearestAlly.getPosition());
                    break;
                }
            }
            // chutar pro gol
            if (this.isINear(myRegion, opponentGoal, 1)) {
                var goalCorner = this.getGoalCorner(inspector);
                myOrder = inspector.makeOrderKickMaxSpeed(goalCorner);
            }
            orders.push(myOrder);
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
            // if (!me) return orders;
            var ballHolderPosition = (_a = inspector.getBall()) === null || _a === void 0 ? void 0 : _a.getPosition();
            var moveDestination = (0, settings_1.getMyExpectedPosition)(inspector, this.mapper, this.number);
            if (this.shouldIHelp(me, inspector.getMyTeamPlayers(), ballHolderPosition, 3)) {
                moveDestination = ballHolderPosition;
            }
            if (lugo4node_1.geo.distanceBetweenPoints(me.getPosition(), ballHolderPosition) < 3 * lugo4node_1.SPECS.PLAYER_SIZE || this.holdPosition(inspector)) {
                var stopOrder = inspector.makeOrderMoveToStop();
                orders.push(stopOrder);
                return orders;
            }
            var myOrder = inspector.makeOrderMoveMaxSpeed(moveDestination);
            orders.push(myOrder);
            return orders;
        }
        catch (e) {
            console.log("did not play this turn", e);
            return null;
        }
    };
    MyBot.prototype.asGoalkeeper = function (inspector, state) {
        try {
            var orders = [];
            var position = inspector.getBall().getPosition();
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
    MyBot.prototype.shouldIHelp = function (me, myTeam, targetPosition, maxHelpers) {
        var nearestPlayers = 0;
        var myDistance = lugo4node_1.geo.distanceBetweenPoints(me.getPosition(), targetPosition);
        for (var _i = 0, myTeam_1 = myTeam; _i < myTeam_1.length; _i++) {
            var teamMate = myTeam_1[_i];
            if (teamMate.getNumber() != me.getNumber() && lugo4node_1.geo.distanceBetweenPoints(teamMate.getPosition(), targetPosition) < myDistance) {
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
        for (var _i = 0, myPlayers_1 = myPlayers; _i < myPlayers_1.length; _i++) {
            var player = myPlayers_1[_i];
            var distanceBetweenMeAndPlayer = lugo4node_1.geo.distanceBetweenPoints(me.getPosition(), player.getPosition());
            if (distanceBetweenMeAndPlayer < lastDistance && me.getNumber() != player.getNumber()) {
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
        return region1.getCol() == region2.getCol() && region1.getRow() == region2.getRow();
    };
    MyBot.prototype.getGoalCorner = function (inspector) {
        var _a;
        var goalKeeperPosition = (_a = inspector.getOpponentGoalkeeper()) === null || _a === void 0 ? void 0 : _a.getPosition();
        var goalCenter = this.mapper.getAttackGoal().getCenter();
        if ((goalKeeperPosition === null || goalKeeperPosition === void 0 ? void 0 : goalKeeperPosition.getY()) >= goalCenter.getY())
            return this.mapper.getAttackGoal().getBottomPole();
        return this.mapper.getAttackGoal().getTopPole();
    };
    MyBot.prototype.holdPosition = function (inspector) {
        var expectedPosition = (0, settings_1.getMyExpectedPosition)(inspector, this.mapper, this.number);
        return lugo4node_1.geo.distanceBetweenPoints(inspector.getMe().getPosition(), expectedPosition) < lugo4node_1.SPECS.PLAYER_SIZE;
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
        return (topCount > botCount) ? "top" : "bot";
    };
    return MyBot;
}());
exports.MyBot = MyBot;
