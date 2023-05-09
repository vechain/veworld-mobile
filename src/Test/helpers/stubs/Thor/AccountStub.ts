import { AddressUtils } from "~Common"
import { account1D1 } from "../../data"

/**
 * Mock account method of Connex.Thor
 * Original implementation create a visitor to the account specified by the given address
 * Only implements get() method returning tha balance of account1D1
 * @param addr
 * @returns
 */
export const accountStub =
    ({ shouldCallError = false }) =>
    (addr: string): Connex.Thor.Account.Visitor => {
        return {
            address: addr,
            event(_abi: object): Connex.Thor.Account.Event {
                return {
                    asCriteria(): Connex.Thor.Filter.Criteria<"event"> {
                        return {
                            address:
                                "0x9652aead889e8df7b5717ed984f147c132f85a69",
                            topic0: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                            topic1: undefined,
                            topic2: undefined,
                            topic3: undefined,
                            topic4: undefined,
                        }
                    },
                    filter(_indexedSet) {
                        throw Error("Not implemented")
                    },
                }
            },
            get(): Promise<Connex.Thor.Account> {
                if (AddressUtils.compareAddresses(addr, account1D1.address))
                    return Promise.resolve({
                        balance: "0xaa89ec0ca7be516bee",
                        energy: "0x152d3381bc9876587710",
                        hasCode: true,
                    })

                return Promise.resolve({
                    balance: "0x0",
                    energy: "0x0",
                    hasCode: false,
                })
            },
            getCode(): Promise<Connex.Thor.Account.Code> {
                throw Error("Not implemented")
            },
            getStorage(_key: string): Promise<Connex.Thor.Account.Storage> {
                throw Error("Not implemented")
            },
            method(_abi: object): Connex.Thor.Account.Method {
                return {
                    asClause(
                        ..._args: any[]
                    ): Connex.Thor.Transaction["clauses"][0] {
                        throw Error("Not implemented")
                    },
                    cache(_hints: string[]) {
                        return this
                    },
                    call(
                        ..._args: any[]
                    ): Promise<
                        Connex.VM.Output & Connex.Thor.Account.WithDecoded
                    > {
                        if (shouldCallError) throw new Error("Error")

                        return Promise.resolve({
                            events: [],
                            data: "0x000000000000000000000000000000000000000000000000000009184e72a000",
                            vmError: "",
                            gasUsed: 1234,
                            reverted: false,
                            transfers: [],
                            decoded: ["0x9184e72a000"],
                        })
                    },
                    caller(_addr: string) {
                        return this
                    },
                    gas(_gas: number) {
                        return this
                    },
                    gasPayer(_addr: string) {
                        return this
                    },
                    gasPrice(_gp: string | number) {
                        return this
                    },
                    transact(..._args: any[]): Connex.Vendor.TxSigningService {
                        throw Error("Not implemented")
                    },
                    value(_val: string | number) {
                        return this
                    },
                }
            },
        }
    }
