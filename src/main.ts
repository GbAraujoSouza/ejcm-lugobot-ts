import { MyBot } from './my_bot'
import {EnvVarLoader, Mapper, NewClientFromConfig, NewDefaultStarter} from '@lugobots/lugo4node'
import {MAPPER_COLS, MAPPER_ROWS, PLAYER_INITIAL_POSITIONS} from "./settings";

const config = new EnvVarLoader()

const mapper = new Mapper(MAPPER_COLS, MAPPER_ROWS, config.getBotTeamSide())

const initialRegion = mapper.getRegion(PLAYER_INITIAL_POSITIONS[config.getBotNumber()].Col, PLAYER_INITIAL_POSITIONS[config.getBotNumber()].Row)

const lugoClient = NewClientFromConfig(config, initialRegion.getCenter())

const myBot = new MyBot(
    config.getBotTeamSide(),
    config.getBotNumber(),
    initialRegion.getCenter(),
    mapper,
)

lugoClient.playAsBot(myBot).then(() => {
    console.log("Game over")
}).catch(e => {
    console.error(e)
})

