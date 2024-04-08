import { TileInformation } from "definitions/information";
import { Nullable } from "definitions/utils";
import GeneralManager from "./GeneralManager";

class TileManager {
    public getAll(): Nullable<TileInformation[]> {
        return GeneralManager.getTiles();
    }
}

export default new TileManager();
