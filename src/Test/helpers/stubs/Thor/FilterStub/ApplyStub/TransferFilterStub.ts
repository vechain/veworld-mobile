import { account1D1, account1D2 } from "~Test/helpers/data"

/**
 * Mock transfer filter apply method
 * @param _offset
 * @param _limit
 * @returns
 * @category Test
 */
export function transferFilterApplyStub(
    _offset: number,
    _limit: number,
): Promise<Connex.Thor.Filter.Row<"transfer">[]> {
    return new Promise(r =>
        r([
            {
                sender: account1D2.address,
                recipient: account1D1.address,
                amount: "0x122323",
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
