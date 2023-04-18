/*eslint-disable*/
import { account1D1 } from "../data"

export default class EventFilterStub implements Connex.Thor.Filter<"event"> {
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
}
