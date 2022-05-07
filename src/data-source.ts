import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entity/User"
import { Game } from './entity/Game'

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'db.sqlite',
    entities: [User, Game],
    synchronize: true,
})
