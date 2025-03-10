import { ActivityEvent } from "~Model"

export const filterValues = {
    all: "all",
    b3tr: [
        ActivityEvent.B3TR_ACTION,
        ActivityEvent.B3TR_CLAIM_REWARD,
        ActivityEvent.B3TR_PROPOSAL_SUPPORT,
        ActivityEvent.B3TR_PROPOSAL_VOTE,
        ActivityEvent.B3TR_SWAP_B3TR_TO_VOT3,
        ActivityEvent.B3TR_SWAP_VOT3_TO_B3TR,
        ActivityEvent.B3TR_UPGRADE_GM,
        ActivityEvent.B3TR_XALLOCATION_VOTE,
    ],
    swap: [
        ActivityEvent.B3TR_SWAP_B3TR_TO_VOT3,
        ActivityEvent.B3TR_SWAP_VOT3_TO_B3TR,
        ActivityEvent.SWAP_FT_TO_FT,
        ActivityEvent.SWAP_FT_TO_VET,
        ActivityEvent.SWAP_VET_TO_FT,
    ],
    transfer: [ActivityEvent.TRANSFER_FT, ActivityEvent.TRANSFER_SF, ActivityEvent.TRANSFER_VET],
    nfts: [ActivityEvent.TRANSFER_NFT],
} as const
