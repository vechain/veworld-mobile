import { ActivityEvent } from "~Model"

export enum FilterType {
    ALL = "all",
    B3TR = "b3tr",
    SWAP = "swap",
    TRANSFER = "transfer",
    NFTS = "nfts",
}

export const filterValues = {
    all: {
        type: FilterType.ALL,
        value: Object.values(ActivityEvent).filter(value => value !== ActivityEvent.UNKNOWN_TX),
    },
    b3tr: {
        type: FilterType.B3TR,
        value: [
            ActivityEvent.B3TR_ACTION,
            ActivityEvent.B3TR_CLAIM_REWARD,
            ActivityEvent.B3TR_PROPOSAL_SUPPORT,
            ActivityEvent.B3TR_PROPOSAL_VOTE,
            ActivityEvent.B3TR_SWAP_B3TR_TO_VOT3,
            ActivityEvent.B3TR_SWAP_VOT3_TO_B3TR,
            ActivityEvent.B3TR_UPGRADE_GM,
            ActivityEvent.B3TR_XALLOCATION_VOTE,
        ],
    },
    swap: {
        type: FilterType.SWAP,
        value: [
            ActivityEvent.B3TR_SWAP_B3TR_TO_VOT3,
            ActivityEvent.B3TR_SWAP_VOT3_TO_B3TR,
            ActivityEvent.SWAP_FT_TO_FT,
            ActivityEvent.SWAP_FT_TO_VET,
            ActivityEvent.SWAP_VET_TO_FT,
        ],
    },
    transfer: {
        type: FilterType.TRANSFER,
        value: [ActivityEvent.TRANSFER_FT, ActivityEvent.TRANSFER_SF, ActivityEvent.TRANSFER_VET],
    },
    nfts: { type: FilterType.NFTS, value: [ActivityEvent.TRANSFER_NFT] },
} as const
