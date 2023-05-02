import { account1D1 } from "../../../../data"

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
                topics: [
                    "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                    "0x000000000000000000000000f077b491b355e64048ce21e3a6fc4751eeea77fa",
                    "0x000000000000000000000000f077b491b355e64048ce21e3a6fc4751eeea77fa",
                ],
                data: "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000",
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
