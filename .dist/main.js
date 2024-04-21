"use strict";
exports.__esModule = true;
var my_bot_1 = require("./my_bot");
var lugo4node_1 = require("@lugobots/lugo4node");
var settings_1 = require("./settings");
var config = new lugo4node_1.EnvVarLoader();
var mapper = new lugo4node_1.Mapper(settings_1.MAPPER_COLS, settings_1.MAPPER_ROWS, config.getBotTeamSide());
var initialRegion = mapper.getRegion(settings_1.PLAYER_INITIAL_POSITIONS[config.getBotNumber()].Col, settings_1.PLAYER_INITIAL_POSITIONS[config.getBotNumber()].Row);
var lugoClient = (0, lugo4node_1.NewClientFromConfig)(config, initialRegion.getCenter());
var myBot = new my_bot_1.MyBot(config.getBotTeamSide(), config.getBotNumber(), initialRegion.getCenter(), mapper);
lugoClient.playAsBot(myBot).then(function () {
    console.log("Game over");
})["catch"](function (e) {
    console.error(e);
});
