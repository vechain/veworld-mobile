import type { DelegationStatus, NodeInfo } from "~Model"
import { sortNodesByDelegationStatus } from "./sortNodesByDelegationStatus"

const createNode = (
    nodeId: string,
    delegationStatus: DelegationStatus,
    validatorId: string | null = null,
): NodeInfo => ({
    nodeId,
    nodeLevel: 1,
    xNodeOwner: "0x123",
    isLegacyNode: false,
    vetAmountStaked: "1000000000000000000000",
    accumulatedRewards: "0",
    delegationStatus,
    validatorId,
})

describe("sortNodesByDelegationStatus", () => {
    it("should sort nodes with NONE status first", () => {
        const nodes = [
            createNode("1", "ACTIVE", "0xvalidator"),
            createNode("2", "NONE"),
            createNode("3", "EXITING", "0xvalidator"),
        ]

        const sorted = sortNodesByDelegationStatus(nodes)

        expect(sorted[0].nodeId).toBe("2") // NONE
        expect(sorted[1].nodeId).toBe("3") // EXITING
        expect(sorted[2].nodeId).toBe("1") // ACTIVE
    })

    it("should sort EXITING before EXITED", () => {
        const nodes = [createNode("1", "EXITED"), createNode("2", "EXITING", "0xvalidator")]

        const sorted = sortNodesByDelegationStatus(nodes)

        expect(sorted[0].nodeId).toBe("2") // EXITING
        expect(sorted[1].nodeId).toBe("1") // EXITED
    })

    it("should sort delegated nodes (QUEUED, ACTIVE) last", () => {
        const nodes = [
            createNode("1", "ACTIVE", "0xvalidator"),
            createNode("2", "QUEUED", "0xvalidator"),
            createNode("3", "NONE"),
        ]

        const sorted = sortNodesByDelegationStatus(nodes)

        expect(sorted[0].nodeId).toBe("3") // NONE
        expect(sorted[1].nodeId).toBe("2") // QUEUED
        expect(sorted[2].nodeId).toBe("1") // ACTIVE
    })

    it("should maintain correct order: NONE -> EXITING -> EXITED -> QUEUED -> ACTIVE", () => {
        const nodes = [
            createNode("1", "ACTIVE", "0xvalidator"),
            createNode("2", "QUEUED", "0xvalidator"),
            createNode("3", "EXITED"),
            createNode("4", "EXITING", "0xvalidator"),
            createNode("5", "NONE"),
        ]

        const sorted = sortNodesByDelegationStatus(nodes)

        expect(sorted[0].nodeId).toBe("5") // NONE
        expect(sorted[1].nodeId).toBe("4") // EXITING
        expect(sorted[2].nodeId).toBe("3") // EXITED
        expect(sorted[3].nodeId).toBe("2") // QUEUED
        expect(sorted[4].nodeId).toBe("1") // ACTIVE
    })

    it("should not mutate the original array", () => {
        const nodes = [createNode("1", "ACTIVE", "0xvalidator"), createNode("2", "NONE")]

        const sorted = sortNodesByDelegationStatus(nodes)

        expect(nodes[0].nodeId).toBe("1") // Original unchanged
        expect(sorted[0].nodeId).toBe("2") // Sorted has NONE first
    })

    it("should handle empty array", () => {
        const sorted = sortNodesByDelegationStatus([])

        expect(sorted).toEqual([])
    })

    it("should handle single node", () => {
        const nodes = [createNode("1", "ACTIVE", "0xvalidator")]

        const sorted = sortNodesByDelegationStatus(nodes)

        expect(sorted).toHaveLength(1)
        expect(sorted[0].nodeId).toBe("1")
    })

    it("should maintain relative order for nodes with same status", () => {
        const nodes = [createNode("1", "NONE"), createNode("2", "NONE"), createNode("3", "NONE")]

        const sorted = sortNodesByDelegationStatus(nodes)

        // Same status nodes should maintain their relative order (stable sort)
        expect(sorted[0].nodeId).toBe("1")
        expect(sorted[1].nodeId).toBe("2")
        expect(sorted[2].nodeId).toBe("3")
    })
})
