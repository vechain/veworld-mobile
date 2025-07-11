import { AbiManager, IndexableEvent } from "./AbiManager"

export class GenericAbiManager extends AbiManager {
    _loadAbis(): Promise<IndexableEvent[]> {}
}
