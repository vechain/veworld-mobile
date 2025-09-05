import { TestWrapper } from "~Test"
import { renderHook } from "@testing-library/react-hooks"
import { useGroupedStakingData } from "./useGroupedStakingData"
import { useUserNodes } from "./useUserNodes"
import { useUserStargateNfts } from "./useUserStargateNfts"
import { NodeInfo, NftData } from "~Model/Staking"
import { RootState } from "~Storage/Redux/Types"
import { defaultMainNetwork } from "~Constants"

// Mock the dependency hooks
jest.mock("./useUserNodes")
jest.mock("./useUserStargateNfts")

const mockUseUserNodes = useUserNodes as jest.MockedFunction<typeof useUserNodes>
const mockUseUserStargateNfts = useUserStargateNfts as jest.MockedFunction<typeof useUserStargateNfts>

// Test data
const testUserAddress = "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957"
const testNodes: NodeInfo[] = [
    {
        nodeId: "1",
        nodeLevel: 1,
        xNodeOwner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957", // User owns this node
        isXNodeHolder: true,
        isXNodeDelegated: false,
        isXNodeDelegator: false,
        isXNodeDelegatee: false,
        delegatee: "",
        isLegacyNode: false,
    },
    {
        nodeId: "2",
        nodeLevel: 2,
        xNodeOwner: "0x456", // User manages this node
        isXNodeHolder: false,
        isXNodeDelegated: true,
        isXNodeDelegator: false,
        isXNodeDelegatee: true,
        delegatee: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        isLegacyNode: false,
    },
    {
        nodeId: "3",
        nodeLevel: 3,
        xNodeOwner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957", // User owns this node
        isXNodeHolder: true,
        isXNodeDelegated: false,
        isXNodeDelegator: false,
        isXNodeDelegatee: false,
        delegatee: "",
        isLegacyNode: false,
    },
    {
        nodeId: "4",
        nodeLevel: 1,
        xNodeOwner: "0x789", // Another managed node
        isXNodeHolder: false,
        isXNodeDelegated: true,
        isXNodeDelegator: false,
        isXNodeDelegatee: true,
        delegatee: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        isLegacyNode: false,
    },
]

const testNfts: NftData[] = [
    {
        tokenId: "1",
        levelId: "1",
        vetAmountStaked: "10000000000000000000000",
        isDelegated: false,
        accumulatedRewards: "10000000000000000000000",
        claimableRewards: "5000000000000000000000",
    },
    {
        tokenId: "2",
        levelId: "2",
        vetAmountStaked: "20000000000000000000000",
        isDelegated: true,
        accumulatedRewards: "20000000000000000000000",
        claimableRewards: "10000000000000000000000",
    },
    {
        tokenId: "3",
        levelId: "3",
        vetAmountStaked: "30000000000000000000000",
        isDelegated: false,
        accumulatedRewards: "30000000000000000000000",
        claimableRewards: "15000000000000000000000",
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
            stargateNodes: testNodes,
            isLoading: false,
            isError: false,
            error: null,
        })

        mockUseUserStargateNfts.mockReturnValue({
            ownedStargateNfts: testNfts,
            isLoading: false,
            refetch: jest.fn(),
            error: null,
            isError: false,
            hasCallErrors: false,
        })
    })

    it("should return empty stakingGroups when address is undefined", () => {
        mockUseUserNodes.mockReturnValue({
            data: [],
            stargateNodes: [],
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
            stargateNodes: [],
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
        expect(managedGroup!.nodes).toHaveLength(2) // nodes 2 and 4
        expect(managedGroup!.isOwner).toBe(false)
        expect(managedGroup!.address).toBe("0x456") // First managed node's owner address
        expect(managedGroup!.nodes.map(n => n.nodeId).sort()).toEqual(["2", "4"])
    })

    it("should correctly filter NFTs for each group", () => {
        const { result } = renderHook(() => useGroupedStakingData(testUserAddress), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        const ownedGroup = result.current.stakingGroups.find(group => group.isOwner)
        const managedGroup = result.current.stakingGroups.find(group => !group.isOwner)

        // Owned group should have NFTs for nodes 1 and 3
        expect(ownedGroup!.nfts).toHaveLength(2)
        expect(ownedGroup!.nfts.map(nft => nft.tokenId).sort()).toEqual(["1", "3"])

        // Managed group should have NFT for node 2 (node 4 doesn't have a matching NFT in test data)
        expect(managedGroup!.nfts).toHaveLength(1)
        expect(managedGroup!.nfts[0].tokenId).toBe("2")
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
            stargateNodes: [],
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

    it("should handle loading state from NFTs", () => {
        mockUseUserStargateNfts.mockReturnValue({
            ownedStargateNfts: [],
            isLoading: true,
            refetch: jest.fn(),
            error: null,
            isError: false,
            hasCallErrors: false,
        })

        const { result } = renderHook(() => useGroupedStakingData(testUserAddress), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        expect(result.current.isLoading).toBe(true)

        // Groups should still be created even when NFTs are loading
        expect(result.current.stakingGroups).toHaveLength(2)
        expect(result.current.stakingGroups[0].isLoading).toBe(true)
    })

    it("should handle loading state from both nodes and NFTs", () => {
        mockUseUserNodes.mockReturnValue({
            data: [],
            stargateNodes: [],
            isLoading: true,
            isError: false,
            error: null,
        })

        mockUseUserStargateNfts.mockReturnValue({
            ownedStargateNfts: [],
            isLoading: true,
            refetch: jest.fn(),
            error: null,
            isError: false,
            hasCallErrors: false,
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

    it("should handle nodes without matching NFTs", () => {
        // NFTs that don't match any node IDs
        mockUseUserStargateNfts.mockReturnValue({
            ownedStargateNfts: [
                {
                    tokenId: "999", // No matching node
                    levelId: "1",
                    vetAmountStaked: "10000000000000000000000",
                    isDelegated: false,
                    accumulatedRewards: "10000000000000000000000",
                },
            ],
            isLoading: false,
            refetch: jest.fn(),
            error: null,
            isError: false,
            hasCallErrors: false,
        })

        const { result } = renderHook(() => useGroupedStakingData(testUserAddress), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        // Groups should still be created but with empty NFT arrays
        expect(result.current.stakingGroups).toHaveLength(2)
        result.current.stakingGroups.forEach(group => {
            expect(group.nfts).toEqual([])
        })
    })

    it("should handle single node owner scenario", () => {
        const singleOwnerNodes: NodeInfo[] = [
            {
                nodeId: "1",
                nodeLevel: 1,
                xNodeOwner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                isXNodeHolder: true,
                isXNodeDelegated: false,
                isXNodeDelegator: false,
                isXNodeDelegatee: false,
                delegatee: "",
                isLegacyNode: false,
            },
            {
                nodeId: "2",
                nodeLevel: 2,
                xNodeOwner: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                isXNodeHolder: true,
                isXNodeDelegated: false,
                isXNodeDelegator: false,
                isXNodeDelegatee: false,
                delegatee: "",
                isLegacyNode: false,
            },
        ]

        mockUseUserNodes.mockReturnValue({
            data: singleOwnerNodes,
            stargateNodes: singleOwnerNodes,
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
                isXNodeHolder: true,
                isXNodeDelegated: false,
                isXNodeDelegator: false,
                isXNodeDelegatee: false,
                delegatee: "",
                isLegacyNode: false,
            },
        ]

        mockUseUserNodes.mockReturnValue({
            data: mixedCaseNodes,
            stargateNodes: mixedCaseNodes,
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
                isXNodeHolder: true,
                isXNodeDelegated: false,
                isXNodeDelegator: false,
                isXNodeDelegatee: false,
                delegatee: "",
                isLegacyNode: false,
            },
        ]

        mockUseUserNodes.mockReturnValue({
            data: ownedOnlyNodes,
            stargateNodes: ownedOnlyNodes,
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
                isXNodeHolder: false,
                isXNodeDelegated: true,
                isXNodeDelegator: false,
                isXNodeDelegatee: true,
                delegatee: testUserAddress,
                isLegacyNode: false,
            },
        ]

        mockUseUserNodes.mockReturnValue({
            data: managedOnlyNodes,
            stargateNodes: managedOnlyNodes,
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

    it("should aggregate managed NFTs from multiple owner addresses", () => {
        const multiOwnerManagedNodes: NodeInfo[] = [
            {
                nodeId: "1",
                nodeLevel: 1,
                xNodeOwner: "0x456",
                isXNodeHolder: false,
                isXNodeDelegated: true,
                isXNodeDelegator: false,
                isXNodeDelegatee: true,
                delegatee: testUserAddress,
                isLegacyNode: false,
            },
            {
                nodeId: "2",
                nodeLevel: 2,
                xNodeOwner: "0x789",
                isXNodeHolder: false,
                isXNodeDelegated: true,
                isXNodeDelegator: false,
                isXNodeDelegatee: true,
                delegatee: testUserAddress,
                isLegacyNode: false,
            },
            {
                nodeId: "3",
                nodeLevel: 3,
                xNodeOwner: "0xABC",
                isXNodeHolder: false,
                isXNodeDelegated: true,
                isXNodeDelegator: false,
                isXNodeDelegatee: true,
                delegatee: testUserAddress,
                isLegacyNode: false,
            },
        ]

        const multiOwnerNfts: NftData[] = [
            {
                tokenId: "1",
                levelId: "1",
                vetAmountStaked: "10000000000000000000000",
                isDelegated: true,
                accumulatedRewards: "5000000000000000000000",
                claimableRewards: "2500000000000000000000",
            },
            {
                tokenId: "2",
                levelId: "2",
                vetAmountStaked: "20000000000000000000000",
                isDelegated: true,
                accumulatedRewards: "10000000000000000000000",
                claimableRewards: "5000000000000000000000",
            },
            {
                tokenId: "3",
                levelId: "3",
                vetAmountStaked: "30000000000000000000000",
                isDelegated: true,
                accumulatedRewards: "15000000000000000000000",
                claimableRewards: "7500000000000000000000",
            },
        ]

        mockUseUserNodes.mockReturnValue({
            data: multiOwnerManagedNodes,
            stargateNodes: multiOwnerManagedNodes,
            isLoading: false,
            isError: false,
            error: null,
        })

        mockUseUserStargateNfts.mockReturnValue({
            ownedStargateNfts: multiOwnerNfts,
            isLoading: false,
            refetch: jest.fn(),
            error: null,
            isError: false,
            hasCallErrors: false,
        })

        const { result } = renderHook(() => useGroupedStakingData(testUserAddress), {
            wrapper: TestWrapper,
            initialProps: {
                preloadedState,
            },
        })

        expect(result.current.stakingGroups).toHaveLength(1)
        const managedGroup = result.current.stakingGroups[0]

        expect(managedGroup.isOwner).toBe(false)
        expect(managedGroup.address).toBe("0x456") // First managed node's owner address
        expect(managedGroup.nodes).toHaveLength(3)
        expect(managedGroup.nfts).toHaveLength(3)
        expect(managedGroup.nodes.map(n => n.nodeId).sort()).toEqual(["1", "2", "3"])
        expect(managedGroup.nfts.map(n => n.tokenId).sort()).toEqual(["1", "2", "3"])
    })
})
