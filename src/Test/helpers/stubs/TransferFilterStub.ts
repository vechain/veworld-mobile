/*eslint-disable*/
import { account1D1, account1D2 } from "../data"

export default class TransferFilterStub
    implements Connex.Thor.Filter<"transfer">
{
    public range(range: Connex.Thor.Filter.Range): this {
        return this
    }

    public order(order: "asc" | "desc"): this {
        return this
    }

    public cache(hints: string[]): this {
        return this
    }

    public apply(
        offset: number,
        limit: number,
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
}
