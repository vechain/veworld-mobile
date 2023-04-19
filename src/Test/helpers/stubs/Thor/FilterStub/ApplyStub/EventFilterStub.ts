import { account1D1 } from "~Test/helpers/data"

/**
 * Mock event filter apply method
 * @param _offset
 * @param _limit
 * @returns
 */
export function eventFilterApplyStub(
    _offset: number,
    _limit: number,
): Promise<Connex.Thor.Filter.Row<"event">[]> {
    return new Promise(r =>
        r([
            {
                address: account1D1.address,
                topics: ["empty topic"],
                data: "",
                meta: {
                    blockID: "0x1",
                    blockNumber: 1,
                    blockTimestamp: 12,
                    txID: "0x1",
                    txOrigin: "0x3",
                    clauseIndex: 0,
                },
            },
        ]),
    )
}
