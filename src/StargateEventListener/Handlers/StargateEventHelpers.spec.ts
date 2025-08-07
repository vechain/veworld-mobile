import { handleNodeDelegatedEvent } from "./StargateEventHandlers"

// Mock thor-devkit ABI Event to control signature and decoding
jest.mock("thor-devkit", () => ({
    abi: {
        Event: class MockEvent {
            public signature: string
            constructor(_abi: any) {
                this.signature = "0xnodeDelegatedSig"
            }
            decode() {
                return {
                    nodeId: { toString: () => "123" },
                    delegatee: "0xDELEGATEE",
                    isDelegated: true,
                }
            }
        },
    },
}))

// Mocks for config and utils
const getStargateNetworkConfigMock = jest.fn()
jest.mock("~Constants/Constants/Staking", () => ({
    getStargateNetworkConfig: (...args: any[]) => getStargateNetworkConfigMock(...args),
}))

const debugMock = jest.fn()
const errorMock = jest.fn()
const testBloomForAddressMock = jest.fn()
jest.mock("~Utils", () => ({
    debug: (...args: any[]) => debugMock(...args),
    error: (...args: any[]) => errorMock(...args),
    BloomUtils: {
        testBloomForAddress: (...args: any[]) => testBloomForAddressMock(...args),
    },
}))

jest.mock("~Constants", () => ({
    ERROR_EVENTS: { STARGATE: "STARGATE" },
}))

const createThorClient = (receiptsByTx: Record<string, any>) => {
    return {
        blocks: {
            getBlockCompressed: jest.fn().mockResolvedValue({ transactions: Object.keys(receiptsByTx) }),
        },
        transactions: {
            getTransactionReceipt: jest.fn((txId: string) => {
                const response = receiptsByTx[txId]
                if (response instanceof Error) {
                    return Promise.reject(response)
                }
                return Promise.resolve(response)
            }),
        },
    } as any
}

const createEvent = (overrides?: Partial<{ address: string; topics: string[] }>) => ({
    address: overrides?.address ?? "0xnodeMgmt",
    topics: overrides?.topics ?? ["0xnodeDelegatedSig"],
    data: "0x",
})
describe("StargateEventHandlers - handleNodeDelegatedEvent", () => {
    const network = { type: "mainnet" } as any
    const beat = { id: "0xBEAT", bloom: "0x", k: 0, number: 100 } as any

    beforeEach(() => {
        jest.clearAllMocks()
        getStargateNetworkConfigMock.mockReturnValue({
            NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xnodeMgmt",
            STARGATE_DELEGATION_CONTRACT_ADDRESS: "0xdelegation",
            STARGATE_NFT_CONTRACT_ADDRESS: "0xnft",
            LEGACY_NODES_CONTRACT_ADDRESS: "0xlegacy",
        })
        testBloomForAddressMock.mockReturnValue(true)
    })

    it("returns early when no network config", async () => {
        getStargateNetworkConfigMock.mockReturnValue(undefined)
        const thor = createThorClient({})
        const refetch = jest.fn()

        await handleNodeDelegatedEvent({ beat, network, thor, refetchStargateData: refetch })

        expect(refetch).not.toHaveBeenCalled()
        expect(thor.blocks.getBlockCompressed).not.toHaveBeenCalled()
    })

    it("returns early when bloom has no Stargate contracts", async () => {
        testBloomForAddressMock.mockReturnValue(false)
        const thor = createThorClient({})
        const refetch = jest.fn()

        await handleNodeDelegatedEvent({ beat, network, thor, refetchStargateData: refetch })

        expect(refetch).not.toHaveBeenCalled()
        expect(thor.blocks.getBlockCompressed).not.toHaveBeenCalled()
    })

    it("triggers refetch per matching NodeDelegated event", async () => {
        const receipt = {
            outputs: [
                {
                    events: [createEvent()],
                },
            ],
        }
        const thor = createThorClient({ tx1: receipt })
        const refetch = jest.fn()

        await handleNodeDelegatedEvent({ beat, network, thor, refetchStargateData: refetch })

        expect(refetch).toHaveBeenCalledTimes(1)
    })

    it("ignores events with wrong topic signature or address", async () => {
        const wrongSignature = { outputs: [{ events: [createEvent({ topics: ["0xWRONG"] })] }] }
        const wrongAddress = { outputs: [{ events: [createEvent({ address: "0xother" })] }] }
        const thor = createThorClient({ tx1: wrongSignature, tx2: wrongAddress })
        const refetch = jest.fn()

        await handleNodeDelegatedEvent({ beat, network, thor, refetchStargateData: refetch })

        expect(refetch).not.toHaveBeenCalled()
    })

    it("continues processing when a transaction errors", async () => {
        const goodReceipt = { outputs: [{ events: [createEvent()] }] }
        const thor = createThorClient({ tx1: new Error("boom"), tx2: goodReceipt })
        const refetch = jest.fn()

        await handleNodeDelegatedEvent({ beat, network, thor, refetchStargateData: refetch })

        expect(refetch).toHaveBeenCalledTimes(1)
        // ensure both txs were attempted
        expect(thor.transactions.getTransactionReceipt).toHaveBeenCalledTimes(2)
    })
})
