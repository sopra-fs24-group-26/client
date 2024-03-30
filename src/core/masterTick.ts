import { int } from "definitions/utils";
import { EventEmitter } from "utilities/EventEmitter";

const RateSeconds: int = 3;

export const MasterTick: EventEmitter = new EventEmitter();

setInterval(() => MasterTick.emit(), RateSeconds * 1000);
