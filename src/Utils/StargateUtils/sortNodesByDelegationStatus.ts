import { DelegationStatus, NodeInfo } from "~Model"

/**
 * Priority order for delegation status sorting.
 * Lower number = higher priority (appears first).
 *
 * Sort order: NONE -> EXITING -> EXITED -> QUEUED -> ACTIVE
 */
const DELEGATION_PRIORITY: Record<DelegationStatus, number> = {
    NONE: 0,
    EXITING: 1,
    EXITED: 2,
    QUEUED: 3,
    ACTIVE: 4,
}

/**
 * Sorts nodes by delegation status priority.
 * Nodes without delegation appear first, then exiting, then delegated.
 */
export const sortNodesByDelegationStatus = (nodes: NodeInfo[]): NodeInfo[] => {
    return [...nodes].sort((a, b) => DELEGATION_PRIORITY[a.delegationStatus] - DELEGATION_PRIORITY[b.delegationStatus])
}
