/*eslint-disable*/
import { genesises } from "~Common/Constant/Thor/ThorConstants"
import { account1D1 } from "../data"
import { AddressUtils } from "~Common"
import EventFilterStub from "./EventFilterStub"
import TransferFilterStub from "./TransferFilterStub"

/**
 * A hardcoded Connex.Thor instance to perform cheap mocks in our tests
 *
 * If you need cheap responses, hardcode a simple response
 * If you need an actual response to function properly, mock normally
 */
export class NewThorStub implements Connex.Thor {
    public genesis = genesises.test
    public status = {
        progress: 1,
        head: {
            id: "0x00ce27a27f982a6df6a1c679d22b416feb3f2a13a41188be8b862abd4316f9c5",
            number: 13510562,
            timestamp: 1665136970,
            parentID:
                "0x00ce27a1e9047dbd8c8679830a12ee23f56908879be1b32943e4a3f83072b6da",
            txsFeatures: 1,
            gasLimit: 30000000,
        },
        finalized:
            "0x00ce27a27f982a6df6a1c679d22b416feb3f2a13a41188be8b862abd4316f9c5",
    }

    public account(addr: string): Connex.Thor.Account.Visitor {
        return {
            address: addr,
            event(abi: object): Connex.Thor.Account.Event {
                throw Error("Not implemented")
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
            getStorage(key: string): Promise<Connex.Thor.Account.Storage> {
                throw Error("Not implemented")
            },
            method(abi: object): Connex.Thor.Account.Method {
                return {
                    asClause(
                        ...args: any[]
                    ): Connex.Thor.Transaction["clauses"][0] {
                        throw Error("Not implemented")
                    },
                    cache(hints: string[]) {
                        return this
                    },
                    call(
                        ...args: any[]
                    ): Promise<
                        Connex.VM.Output & Connex.Thor.Account.WithDecoded
                    > {
                        return Promise.resolve({
                            events: [],
                            data: "0x000000000000000000000000000000000000000000000000000009184e72a000",
                            vmError: "",
                            gasUsed: 1234,
                            reverted: false,
                            transfers: [],
                            decoded: [],
                        })
                    },
                    caller(addr: string) {
                        return this
                    },
                    gas(gas: number) {
                        return this
                    },
                    gasPayer(addr: string) {
                        return this
                    },
                    gasPrice(gp: string | number) {
                        return this
                    },
                    transact(...args: any[]): Connex.Vendor.TxSigningService {
                        throw Error("Not implemented")
                    },
                    value(val: string | number) {
                        return this
                    },
                }
            },
        }
    }

    public block(revision?: string | number): Connex.Thor.Block.Visitor {
        throw Error("Not implemented")
    }

    public explain(clauses: Connex.VM.Clause[]): Connex.VM.Explainer {
        return {
            cache(hints: string[]) {
                return this
            },
            caller(addr: string) {
                return this
            },
            execute(): Promise<Connex.VM.Output[]> {
                return Promise.resolve([])
            },
            gas(gas: number) {
                return this
            },
            gasPayer(addr: string) {
                return this
            },
            gasPrice(gp: string | number) {
                return this
            },
        }
    }

    public filter(
        kind: "event" | "transfer",
        criteria: Connex.Thor.Filter.Criteria<"event" | "transfer">[],
    ): Connex.Thor.Filter<"event" | "transfer"> {
        return kind === "event"
            ? new EventFilterStub()
            : new TransferFilterStub()
    }

    public ticker(): Connex.Thor.Ticker {
        throw Error("Not implemented")
    }

    public transaction(id: string): Connex.Thor.Transaction.Visitor {
        return {
            id: "0x9809890",
            get: jest.fn(),
            allowPending: jest.fn(),
            getReceipt: jest.fn(),
        }
    }
}

/**
 * A hardcoded Connex.Thor instance that rejects on get account
 *
 */
export class NewThorGetAccountRejectsStub implements Connex.Thor {
    public genesis = genesises.test
    public status = {
        progress: 1,
        head: {
            id: "0x00ce27a27f982a6df6a1c679d22b416feb3f2a13a41188be8b862abd4316f9c5",
            number: 13510562,
            timestamp: 1665136970,
            parentID:
                "0x00ce27a1e9047dbd8c8679830a12ee23f56908879be1b32943e4a3f83072b6da",
            txsFeatures: 1,
            gasLimit: 30000000,
        },
        finalized:
            "0x00ce27a27f982a6df6a1c679d22b416feb3f2a13a41188be8b862abd4316f9c5",
    }

    public account(addr: string): Connex.Thor.Account.Visitor {
        return {
            address: addr,
            event(abi: object): Connex.Thor.Account.Event {
                throw Error("Not implemented")
            },
            get(): Promise<Connex.Thor.Account> {
                return Promise.reject("Forced Reject")
            },
            getCode(): Promise<Connex.Thor.Account.Code> {
                throw Error("Not implemented")
            },
            getStorage(key: string): Promise<Connex.Thor.Account.Storage> {
                throw Error("Not implemented")
            },
            method(abi: object): Connex.Thor.Account.Method {
                throw Error("Not implemented")
            },
        }
    }

    public block(revision?: string | number): Connex.Thor.Block.Visitor {
        throw Error("Not implemented")
    }

    public explain(clauses: Connex.VM.Clause[]): Connex.VM.Explainer {
        throw Error("Not implemented")
    }

    public filter(
        kind: "event" | "transfer",
        criteria: Connex.Thor.Filter.Criteria<"event" | "transfer">[],
    ): Connex.Thor.Filter<"event" | "transfer"> {
        return kind === "event"
            ? new EventFilterStub()
            : new TransferFilterStub()
    }

    public ticker(): Connex.Thor.Ticker {
        throw Error("Not implemented")
    }

    public transaction(id: string): Connex.Thor.Transaction.Visitor {
        throw Error("Not implemented")
    }
}

/**
 * A hardcoded Connex.Thor instance that rejects on get account
 *
 */
export const mockNewThorGetAccountRejects = (
    revert: boolean = false,
    vmError: boolean = false,
): Connex.Thor => {
    return {
        genesis: genesises.test,
        status: {
            progress: 1,
            head: {
                id: "0x00ce27a27f982a6df6a1c679d22b416feb3f2a13a41188be8b862abd4316f9c5",
                number: 13510562,
                timestamp: 1665136970,
                parentID:
                    "0x00ce27a1e9047dbd8c8679830a12ee23f56908879be1b32943e4a3f83072b6da",
                txsFeatures: 1,
                gasLimit: 30000000,
            },
            finalized:
                "0x00ce27a27f982a6df6a1c679d22b416feb3f2a13a41188be8b862abd4316f9c5",
        },
        account(addr: string): Connex.Thor.Account.Visitor {
            return {
                address: addr,
                event(abi: object): Connex.Thor.Account.Event {
                    throw Error("Not implemented")
                },
                get(): Promise<Connex.Thor.Account> {
                    return Promise.reject("Forced Reject")
                },
                getCode(): Promise<Connex.Thor.Account.Code> {
                    throw Error("Not implemented")
                },
                getStorage(key: string): Promise<Connex.Thor.Account.Storage> {
                    throw Error("Not implemented")
                },
                method(abi: object): Connex.Thor.Account.Method {
                    throw Error("Not implemented")
                },
            }
        },
        block(revision?: string | number): Connex.Thor.Block.Visitor {
            throw Error("Not implemented")
        },
        explain(clauses: Connex.VM.Clause[]): Connex.VM.Explainer {
            return {
                cache(hints: string[]) {
                    return this
                },
                caller(addr: string) {
                    return this
                },
                execute(): Promise<Connex.VM.Output[]> {
                    return Promise.resolve([
                        {
                            data: "data",
                            vmError: vmError ? "vmError" : "",
                            gasUsed: 1,
                            reverted: revert,
                            revertReason: revert ? "revertReason" : "",
                            events: [],
                            transfers: [],
                        },
                    ])
                },
                gas(gas: number) {
                    return this
                },
                gasPayer(addr: string) {
                    return this
                },
                gasPrice(gp: string | number) {
                    return this
                },
            }
        },
        filter(
            kind: "event" | "transfer",
            criteria: Connex.Thor.Filter.Criteria<"event" | "transfer">[],
        ): Connex.Thor.Filter<"event" | "transfer"> {
            return kind === "event"
                ? new EventFilterStub()
                : new TransferFilterStub()
        },

        ticker(): Connex.Thor.Ticker {
            throw Error("Not implemented")
        },
        transaction(id: string): Connex.Thor.Transaction.Visitor {
            throw Error("Not implemented")
        },
    }
}
