import { DelegationStatus, NodeInfo } from "~Model"

/**
 * Priority order for delegation status sorting.
 * Lower number = higher priority (appears first).
 *
 * Sort order: NONE -> EXITING -> EXITED -> QUEUED -> ACTIVE
 */
const DELEGATION_PRIORITY: Record<DelegationStatus, number> = {
    [DelegationStatus.NONE]: 0,
    [DelegationStatus.EXITING]: 1,
    [DelegationStatus.EXITED]: 2,
    [DelegationStatus.QUEUED]: 3,
    [DelegationStatus.ACTIVE]: 4,
}

/**
 * Sorts nodes by delegation status priority.
 * Nodes without delegation appear first, then exiting, then delegated.
 */
export const sortNodesByDelegationStatus = (nodes: NodeInfo[]): NodeInfo[] => {
    return [...nodes].sort((a, b) => DELEGATION_PRIORITY[a.delegationStatus] - DELEGATION_PRIORITY[b.delegationStatus])
}
