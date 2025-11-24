import { ReceiptProcessor } from "~Services/AbiService/ReceiptProcessor"
import { handleStargateEvents } from "./StargateEventHandlers"
import { ReceiptOutput } from "~Services/AbiService"

const debugMock = jest.fn()
const errorMock = jest.fn()
const testBloomForAddressMock = jest.fn()
jest.mock("~Utils", () => ({
    debug: (...args: any[]) => debugMock(...args),
    error: (...args: any[]) => errorMock(...args),
    BloomUtils: {
        testBloomForAddress: (...args: any[]) => testBloomForAddressMock(...args),
    },
    AddressUtils: {
        compareAddresses: (a?: string, b?: string) => (a ?? "").toLowerCase() === (b ?? "").toLowerCase(),
    },
}))

jest.mock("~Constants", () => ({
    ERROR_EVENTS: { STARGATE: "STARGATE" },
}))

const defaultStargateConfig = {
    NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xnodeMgmt",
    STARGATE_DELEGATION_CONTRACT_ADDRESS: "0xdelegation",
    STARGATE_NFT_CONTRACT_ADDRESS: "0xnft",
    LEGACY_NODES_CONTRACT_ADDRESS: "0xlegacy",
}

const createThorClient = (expanded?: { transactions: { id: string; origin?: string; outputs: any[] }[] }) => {
    return {
        blocks: {
            getBlockExpanded: jest.fn().mockResolvedValue(expanded ?? { transactions: [] }),
            getBlockCompressed: jest.fn().mockResolvedValue({ transactions: [] }),
        },
        transactions: {
            getTransactionReceipt: jest.fn(),
        },
    } as any
}

const NODE_MGMT = "0xnodeMgmt"
const createEvent = (overrides?: Partial<{ address: string; topics: string[] }>) => ({
    address: overrides?.address ?? NODE_MGMT,
    topics: overrides?.topics ?? ["0xnodeDelegatedSig"],
    data: "0x",
})
describe("StargateEventHandlers - handleStargateEvents", () => {
    const network = { type: "mainnet" } as any
    const beat = { id: "0xBEAT", bloom: "0x", k: 0, number: 100 } as any

    beforeEach(() => {
        jest.clearAllMocks()
        testBloomForAddressMock.mockReturnValue(true)
    })

    it("returns early and logs when NodeManagement contract address is missing", async () => {
        const thor = createThorClient()
        const refetch = jest.fn()

        await handleStargateEvents({
            beat,
            network,
            thor,
            invalidateStargateData: refetch,
            managedAddresses: [],
            stargateConfig: {
                // Missing NODE_MANAGEMENT_CONTRACT_ADDRESS on purpose
                STARGATE_DELEGATION_CONTRACT_ADDRESS: "0xdelegation",
                STARGATE_NFT_CONTRACT_ADDRESS: "0xnft",
                LEGACY_NODES_CONTRACT_ADDRESS: "0xlegacy",
            },
            genericReceiptProcessor: new ReceiptProcessor([]),
        })

        expect(refetch).not.toHaveBeenCalled()
        expect(thor.blocks.getBlockExpanded).not.toHaveBeenCalled()
        expect(debugMock).toHaveBeenCalledWith(
            "STARGATE",
            expect.stringContaining("No NodeManagement contract address found"),
        )
    })

    it("logs when expanded block has no transactions", async () => {
        const thor = {
            blocks: {
                getBlockExpanded: jest.fn().mockResolvedValue({ transactions: [] }),
            },
            transactions: { getTransactionReceipt: jest.fn() },
        } as any
        const refetch = jest.fn()

        await handleStargateEvents({
            beat,
            network,
            thor,
            invalidateStargateData: refetch,
            managedAddresses: [],
            stargateConfig: defaultStargateConfig,
            genericReceiptProcessor: new ReceiptProcessor([]),
        })

        expect(refetch).not.toHaveBeenCalled()
        const debugHadNoTxLog = debugMock.mock.calls.some(
            args => args[0] === "STARGATE" && String(args[1]).includes("No transactions found in block"),
        )
        expect(debugHadNoTxLog).toBe(true)
    })

    it("returns early when no network config", async () => {
        const thor = createThorClient()
        const refetch = jest.fn()

        await handleStargateEvents({
            beat,
            network,
            thor,
            invalidateStargateData: refetch,
            managedAddresses: [],
            stargateConfig: {},
            genericReceiptProcessor: new ReceiptProcessor([]),
        })

        expect(refetch).not.toHaveBeenCalled()
        expect(thor.blocks.getBlockExpanded).not.toHaveBeenCalled()
    })

    it("returns early when bloom has no Stargate contracts", async () => {
        testBloomForAddressMock.mockReturnValue(false)
        const thor = createThorClient()
        const refetch = jest.fn()

        await handleStargateEvents({
            beat,
            network,
            thor,
            invalidateStargateData: refetch,
            managedAddresses: [],
            stargateConfig: defaultStargateConfig,
            genericReceiptProcessor: new ReceiptProcessor([]),
        })

        expect(refetch).not.toHaveBeenCalled()
        expect(thor.blocks.getBlockExpanded).not.toHaveBeenCalled()
    })

    it("triggers refetch per matching NodeDelegated event for managed owner", async () => {
        jest.useFakeTimers()

        class MockedReceiptProcessor extends ReceiptProcessor {
            analyzeReceipt(): ReceiptOutput[] {
                return [
                    {
                        clauseIndex: 0,
                        name: "NodeDelegated(indexed uint256,indexed address,bool)",
                        params: { nodeId: 123n, delegatee: "0xDELEGATEE", delegated: true },
                        address: NODE_MGMT,
                    },
                ]
            }
        }

        const thor = createThorClient({
            transactions: [
                {
                    id: "tx1",
                    origin: "0xOWNER",
                    outputs: [{ events: [createEvent()] }],
                },
            ],
        })
        const refetch = jest.fn()

        await handleStargateEvents({
            beat,
            network,
            thor,
            invalidateStargateData: refetch,
            managedAddresses: ["0xOWNER"],
            stargateConfig: defaultStargateConfig,
            genericReceiptProcessor: new MockedReceiptProcessor([]),
        })

        // Fast-forward timers to trigger the setTimeout
        jest.runAllTimers()

        expect(refetch).toHaveBeenCalledTimes(1) // Called for owner (as origin)

        jest.useRealTimers()
    })

    it("ignores events when contract address mismatch", async () => {
        class MockedReceiptProcessor extends ReceiptProcessor {
            analyzeReceipt(): ReceiptOutput[] {
                return [
                    {
                        clauseIndex: 0,
                        name: "NodeDelegated(indexed uint256,indexed address,bool)",
                        params: { nodeId: 123n, delegatee: "0xDELEGATEE", delegated: true },
                        address: "0xother",
                    },
                ]
            }
        }
        const thor = createThorClient({
            transactions: [
                { id: "tx1", origin: "0xOWNER", outputs: [{ events: [createEvent({ address: "0xother" })] }] },
            ],
        })
        const refetch = jest.fn()

        await handleStargateEvents({
            beat,
            network,
            thor,
            invalidateStargateData: refetch,
            managedAddresses: ["0xOWNER"],
            stargateConfig: defaultStargateConfig,
            genericReceiptProcessor: new MockedReceiptProcessor([]),
        })

        expect(refetch).not.toHaveBeenCalled()
    })

    it("continues processing when individual transactions have errors", async () => {
        jest.useFakeTimers()

        // Mock receipt processor to throw on first call, succeed on second
        const analyzeReceiptMock = jest
            .fn()
            .mockImplementationOnce(() => {
                throw new Error("tx processing error")
            })
            .mockImplementationOnce(() => [
                {
                    clauseIndex: 0,
                    name: "NodeDelegated(indexed uint256,indexed address,bool)",
                    params: { nodeId: "123", delegatee: "0xDELEGATEE", delegated: true },
                    address: NODE_MGMT,
                },
            ])

        class MockedReceiptProcessor extends ReceiptProcessor {
            analyzeReceipt(...args: any[]): ReceiptOutput[] {
                return analyzeReceiptMock(...args)
            }
        }

        const thor = createThorClient({
            transactions: [
                {
                    id: "tx1",
                    origin: "0xOWNER",
                    outputs: [{ events: [createEvent()] }],
                },
                {
                    id: "tx2",
                    origin: "0xOWNER",
                    outputs: [{ events: [createEvent()] }],
                },
            ],
        })
        const refetch = jest.fn()

        await handleStargateEvents({
            beat,
            network,
            thor,
            invalidateStargateData: refetch,
            managedAddresses: ["0xOWNER"],
            stargateConfig: defaultStargateConfig,
            genericReceiptProcessor: new MockedReceiptProcessor([]),
        })

        // Fast-forward timers to trigger the setTimeout
        jest.runAllTimers()

        expect(refetch).toHaveBeenCalledTimes(1) // Called for the owner
        expect(analyzeReceiptMock).toHaveBeenCalledTimes(2)

        jest.useRealTimers()
    })
})
