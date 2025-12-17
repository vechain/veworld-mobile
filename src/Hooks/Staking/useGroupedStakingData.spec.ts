import { TestWrapper } from "~Test"
import { renderHook } from "@testing-library/react-hooks"
import { useGroupedStakingData } from "./useGroupedStakingData"
import { useUserNodes } from "./useUserNodes"
import { DelegationStatus, NodeInfo } from "~Model/Staking"
import { RootState } from "~Storage/Redux/Types"
import { defaultMainNetwork } from "~Constants"

// Mock the dependency hooks
jest.mock("./useUserNodes")

const mockUseUserNodes = useUserNodes as jest.MockedFunction<typeof useUserNodes>

// Test data
const testUserAddress = "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957"
const testNodes: NodeInfo[] = [
    {
        nodeId: "1",
        nodeLevel: 1,
        xNodeOwner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957", // User owns this node
        isLegacyNode: false,
        vetAmountStaked: "10000000000000000000000",
        accumulatedRewards: "10000000000000000000000",
        delegationStatus: DelegationStatus.ACTIVE,
        validatorId: "1",
    },
    {
        nodeId: "2",
        nodeLevel: 2,
        xNodeOwner: "0x456", // User manages this node
        isLegacyNode: false,
        vetAmountStaked: "20000000000000000000000",
        accumulatedRewards: "20000000000000000000000",
        delegationStatus: DelegationStatus.NONE,
        validatorId: null,
    },
    {
        nodeId: "3",
        nodeLevel: 3,
        xNodeOwner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957", // User owns this node
        isLegacyNode: false,
        vetAmountStaked: "30000000000000000000000",
        accumulatedRewards: "30000000000000000000000",
        delegationStatus: DelegationStatus.EXITING,
        validatorId: "0xfedcba0987654321",
    },
]

const preloadedState: Partial<RootState> = {
    networks: {
        customNetworks: [],
        hardfork: {},
        isNodeError: false,
        selectedNetwork: defaultMainNetwork.id,
        showConversionOtherNets: false,
        showTestNetTag: false,
    },
}

describe("useGroupedStakingData", () => {
    beforeEach(() => {
        jest.clearAllMocks()

        // Default mock implementations
        mockUseUserNodes.mockReturnValue({
            data: testNodes,
            isLoading: false,
            isError: false,
            error: null,
        })
    })

    it("should return empty stakingGroups when address is undefined", () => {
        mockUseUserNodes.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        })

        const { result } = renderHook(() => useGroupedStakingData(undefined), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        expect(result.current.stakingGroups).toEqual([])
        expect(result.current.isLoading).toBe(false)
        expect(result.current.totalGroups).toBe(0)
    })

    it("should return empty stakingGroups when no nodes exist", () => {
        mockUseUserNodes.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            error: null,
        })

        const { result } = renderHook(() => useGroupedStakingData(testUserAddress), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        expect(result.current.stakingGroups).toEqual([])
        expect(result.current.isLoading).toBe(false)
        expect(result.current.totalGroups).toBe(0)
    })

    it("should group nodes by ownership type (owned vs managed)", () => {
        const { result } = renderHook(() => useGroupedStakingData(testUserAddress), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        expect(result.current.stakingGroups).toHaveLength(2)
        expect(result.current.totalGroups).toBe(2)

        // Find groups by ownership type
        const ownedGroup = result.current.stakingGroups.find(group => group.isOwner)
        const managedGroup = result.current.stakingGroups.find(group => !group.isOwner)

        expect(ownedGroup).toBeDefined()
        expect(managedGroup).toBeDefined()

        // Check owned group
        expect(ownedGroup!.nodes).toHaveLength(2) // nodes 1 and 3
        expect(ownedGroup!.isOwner).toBe(true)
        expect(ownedGroup!.address).toBe(testUserAddress)
        expect(ownedGroup!.nodes.map(n => n.nodeId).sort()).toEqual(["1", "3"])

        // Check managed group (aggregated from multiple addresses)
        expect(managedGroup!.nodes).toHaveLength(1) // nodes 2
        expect(managedGroup!.isOwner).toBe(false)
        expect(managedGroup!.address).toBe("0x456") // First managed node's owner address
        expect(managedGroup!.nodes.map(n => n.nodeId).sort()).toEqual(["2"])
    })

    it("should prioritize owned nodes first in the order", () => {
        const { result } = renderHook(() => useGroupedStakingData(testUserAddress), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        // First group should be owned nodes (isOwner: true)
        expect(result.current.stakingGroups[0].isOwner).toBe(true)
        expect(result.current.stakingGroups[0].address).toBe(testUserAddress)

        // Second group should be managed nodes (isOwner: false)
        expect(result.current.stakingGroups[1].isOwner).toBe(false)
        expect(result.current.stakingGroups[1].address).toBe("0x456") // First managed node's owner
    })

    it("should handle loading state from nodes", () => {
        mockUseUserNodes.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            error: null,
        })

        const { result } = renderHook(() => useGroupedStakingData(testUserAddress), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.stakingGroups).toEqual([])
    })

    it("should handle loading state from both nodes and NFTs", () => {
        mockUseUserNodes.mockReturnValue({
            data: [],
            isLoading: true,
            isError: false,
            error: null,
        })

        const { result } = renderHook(() => useGroupedStakingData(testUserAddress), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        expect(result.current.isLoading).toBe(true)
        expect(result.current.stakingGroups).toEqual([])
    })

    it("should handle single node owner scenario", () => {
        const singleOwnerNodes: NodeInfo[] = [
            {
                nodeId: "1",
                nodeLevel: 1,
                xNodeOwner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                isLegacyNode: false,
                accumulatedRewards: "0",
                vetAmountStaked: "0",
                delegationStatus: DelegationStatus.ACTIVE,
                validatorId: "0x1234567890abcdef",
            },
            {
                nodeId: "2",
                nodeLevel: 2,
                xNodeOwner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                isLegacyNode: false,
                accumulatedRewards: "0",
                vetAmountStaked: "0",
                delegationStatus: DelegationStatus.ACTIVE,
                validatorId: "0x1234567890abcdef",
            },
        ]

        mockUseUserNodes.mockReturnValue({
            data: singleOwnerNodes,
            isLoading: false,
            isError: false,
            error: null,
        })

        const { result } = renderHook(() => useGroupedStakingData(testUserAddress), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        expect(result.current.stakingGroups).toHaveLength(1)
        expect(result.current.stakingGroups[0].address).toBe(testUserAddress)
        expect(result.current.stakingGroups[0].nodes).toHaveLength(2)
        expect(result.current.stakingGroups[0].isOwner).toBe(true)
    })

    it("should correctly compare addresses case-insensitively", () => {
        const mixedCaseNodes: NodeInfo[] = [
            {
                nodeId: "1",
                nodeLevel: 1,
                xNodeOwner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                isLegacyNode: false,
                accumulatedRewards: "0",
                vetAmountStaked: "0",
                delegationStatus: DelegationStatus.ACTIVE,
                validatorId: "0x1234567890abcdef",
            },
        ]

        mockUseUserNodes.mockReturnValue({
            data: mixedCaseNodes,
            isLoading: false,
            isError: false,
            error: null,
        })

        const { result } = renderHook(() => useGroupedStakingData("0XCF130b42Ae33C5531277B4B7c0F1D994B8732957"), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        expect(result.current.stakingGroups[0].isOwner).toBe(true)
    })

    it("should only return owned group when user has no managed nodes", () => {
        const ownedOnlyNodes: NodeInfo[] = [
            {
                nodeId: "1",
                nodeLevel: 1,
                xNodeOwner: testUserAddress,
                isLegacyNode: false,
                accumulatedRewards: "0",
                vetAmountStaked: "0",
                delegationStatus: DelegationStatus.NONE,
                validatorId: null,
            },
        ]

        mockUseUserNodes.mockReturnValue({
            data: ownedOnlyNodes,
            isLoading: false,
            isError: false,
            error: null,
        })

        const { result } = renderHook(() => useGroupedStakingData(testUserAddress), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        expect(result.current.stakingGroups).toHaveLength(1)
        expect(result.current.stakingGroups[0].isOwner).toBe(true)
        expect(result.current.stakingGroups[0].address).toBe(testUserAddress)
    })

    it("should only return managed group when user has no owned nodes", () => {
        const managedOnlyNodes: NodeInfo[] = [
            {
                nodeId: "1",
                nodeLevel: 1,
                xNodeOwner: "0x456",
                isLegacyNode: false,
                accumulatedRewards: "0",
                vetAmountStaked: "0",
                delegationStatus: DelegationStatus.NONE,
                validatorId: null,
            },
        ]

        mockUseUserNodes.mockReturnValue({
            data: managedOnlyNodes,
            isLoading: false,
            isError: false,
            error: null,
        })

        const { result } = renderHook(() => useGroupedStakingData(testUserAddress), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        expect(result.current.stakingGroups).toHaveLength(1)
        expect(result.current.stakingGroups[0].isOwner).toBe(false)
        expect(result.current.stakingGroups[0].address).toBe("0x456") // The managed node's owner
    })
})
