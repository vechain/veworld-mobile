import { handleNodeDelegatedEvent } from "./StargateEventHandlers"

// Mock receipt processor to avoid real ABI decoding
const getReceiptProcessorMock = jest.fn()
jest.mock("~Services/AbiService", () => ({
    getReceiptProcessor: (...args: any[]) => getReceiptProcessorMock(...args),
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
    AddressUtils: {
        compareAddresses: (a?: string, b?: string) => (a ?? "").toLowerCase() === (b ?? "").toLowerCase(),
    },
}))

jest.mock("~Constants", () => ({
    ERROR_EVENTS: { STARGATE: "STARGATE" },
}))

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
describe("StargateEventHandlers - handleNodeDelegatedEvent", () => {
    const network = { type: "mainnet" } as any
    const beat = { id: "0xBEAT", bloom: "0x", k: 0, number: 100 } as any

    beforeEach(() => {
        jest.clearAllMocks()
        getReceiptProcessorMock.mockReset()
        getReceiptProcessorMock.mockReturnValue({ analyzeReceipt: () => [] })
        getStargateNetworkConfigMock.mockReturnValue({
            NODE_MANAGEMENT_CONTRACT_ADDRESS: "0xnodeMgmt",
            STARGATE_DELEGATION_CONTRACT_ADDRESS: "0xdelegation",
            STARGATE_NFT_CONTRACT_ADDRESS: "0xnft",
            LEGACY_NODES_CONTRACT_ADDRESS: "0xlegacy",
        })
        testBloomForAddressMock.mockReturnValue(true)
    })

    it("returns early and logs when NodeManagement contract address is missing", async () => {
        getStargateNetworkConfigMock.mockReturnValue({
            // Missing NODE_MANAGEMENT_CONTRACT_ADDRESS on purpose
            STARGATE_DELEGATION_CONTRACT_ADDRESS: "0xdelegation",
            STARGATE_NFT_CONTRACT_ADDRESS: "0xnft",
            LEGACY_NODES_CONTRACT_ADDRESS: "0xlegacy",
        })
        const thor = createThorClient()
        const refetch = jest.fn()

        await handleNodeDelegatedEvent({ beat, network, thor, refetchStargateData: refetch, managedAddresses: [] })

        expect(refetch).not.toHaveBeenCalled()
        expect(thor.blocks.getBlockExpanded).not.toHaveBeenCalled()
        expect(debugMock).toHaveBeenCalledWith(
            "STARGATE",
            expect.stringContaining("No NodeManagement contract address found"),
        )
    })

    it("logs error when handler throws during processing", async () => {
        // Force error before parsing by making receipt processor creation throw
        getReceiptProcessorMock.mockImplementation(() => {
            throw new Error("receipt error")
        })

        const thor = createThorClient()

        await handleNodeDelegatedEvent({ beat, network, thor, refetchStargateData: jest.fn(), managedAddresses: [] })

        expect(errorMock).toHaveBeenCalledWith("STARGATE", "Error handling NodeDelegated event:", expect.any(Error))
    })

    it("logs when expanded block has no transactions", async () => {
        const thor = {
            blocks: {
                getBlockExpanded: jest.fn().mockResolvedValue({ transactions: [] }),
            },
            transactions: { getTransactionReceipt: jest.fn() },
        } as any
        const refetch = jest.fn()

        await handleNodeDelegatedEvent({ beat, network, thor, refetchStargateData: refetch, managedAddresses: [] })

        expect(refetch).not.toHaveBeenCalled()
        const debugHadNoTxLog = debugMock.mock.calls.some(
            args => args[0] === "STARGATE" && String(args[1]).includes("No transactions found in block"),
        )
        expect(debugHadNoTxLog).toBe(true)
    })

    it("returns early when no network config", async () => {
        getStargateNetworkConfigMock.mockReturnValue(undefined)
        const thor = createThorClient()
        const refetch = jest.fn()

        await handleNodeDelegatedEvent({ beat, network, thor, refetchStargateData: refetch, managedAddresses: [] })

        expect(refetch).not.toHaveBeenCalled()
        expect(thor.blocks.getBlockExpanded).not.toHaveBeenCalled()
    })

    it("returns early when bloom has no Stargate contracts", async () => {
        testBloomForAddressMock.mockReturnValue(false)
        const thor = createThorClient()
        const refetch = jest.fn()

        await handleNodeDelegatedEvent({ beat, network, thor, refetchStargateData: refetch, managedAddresses: [] })

        expect(refetch).not.toHaveBeenCalled()
        expect(thor.blocks.getBlockExpanded).not.toHaveBeenCalled()
    })

    it("triggers refetch per matching NodeDelegated event for managed owner", async () => {
        jest.useFakeTimers()

        getReceiptProcessorMock.mockReturnValue({
            analyzeReceipt: () => [
                {
                    clauseIndex: 0,
                    name: "NodeDelegated(indexed uint256,indexed address,bool)",
                    params: { nodeId: "123", delegatee: "0xDELEGATEE", delegated: true },
                    address: NODE_MGMT,
                },
            ],
        })
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

        await handleNodeDelegatedEvent({
            beat,
            network,
            thor,
            refetchStargateData: refetch,
            managedAddresses: ["0xOWNER"],
        })

        // Fast-forward timers to trigger the setTimeout
        jest.runAllTimers()

        expect(refetch).toHaveBeenCalledTimes(2) // Called for both owner and delegatee

        jest.useRealTimers()
    })

    it("ignores events when contract address mismatch", async () => {
        getReceiptProcessorMock.mockReturnValue({
            analyzeReceipt: () => [
                {
                    clauseIndex: 0,
                    name: "NodeDelegated(indexed uint256,indexed address,bool)",
                    params: { nodeId: "123", delegatee: "0xDELEGATEE", delegated: true },
                    address: "0xother",
                },
            ],
        })
        const thor = createThorClient({
            transactions: [
                { id: "tx1", origin: "0xOWNER", outputs: [{ events: [createEvent({ address: "0xother" })] }] },
            ],
        })
        const refetch = jest.fn()

        await handleNodeDelegatedEvent({
            beat,
            network,
            thor,
            refetchStargateData: refetch,
            managedAddresses: ["0xOWNER"],
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

        getReceiptProcessorMock.mockReturnValue({
            analyzeReceipt: analyzeReceiptMock,
        })

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

        await handleNodeDelegatedEvent({
            beat,
            network,
            thor,
            refetchStargateData: refetch,
            managedAddresses: ["0xOWNER"],
        })

        // Fast-forward timers to trigger the setTimeout
        jest.runAllTimers()

        expect(refetch).toHaveBeenCalledTimes(2) // Called for both owner and delegatee
        expect(analyzeReceiptMock).toHaveBeenCalledTimes(2)

        jest.useRealTimers()
    })
})
