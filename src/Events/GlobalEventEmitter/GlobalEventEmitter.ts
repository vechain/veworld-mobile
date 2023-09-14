import { EventEmitter } from "events"

export const LOCK_APP_EVENT = "lock-application"

const eventEmitter = new EventEmitter()

export default eventEmitter
