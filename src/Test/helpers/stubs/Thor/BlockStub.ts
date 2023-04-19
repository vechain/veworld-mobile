/**
 * * Mock block method of Connex.Thor
 * Original implementation create a visitor to the block specified by the given revision
 * @param revision block id or number, defaults to current value of status.head.id
 */
export function blockStub(
    _revision?: string | number,
): Connex.Thor.Block.Visitor {
    throw Error("Not implemented")
}
