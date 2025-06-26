import { ActivityEvent } from "~Model"

export enum FilterType {
    ALL = "all",
    B3TR = "b3tr",
    SWAP = "swap",
    TRANSFER = "transfer",
    NFTS = "nfts",
    DAPPS = "dapps",
    STAKING = "staking",
    OTHER = "other",
}

export const filterValues = {
    all: {
        type: FilterType.ALL,
        value: Object.values(ActivityEvent),
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
    dapps: { type: FilterType.DAPPS, value: [] },
    staking: {
        type: FilterType.STAKING,
        value: [
            ActivityEvent.STARGATE_DELEGATE,
            ActivityEvent.STARGATE_STAKE,
            ActivityEvent.STARGATE_CLAIM_REWARDS,
            ActivityEvent.STARGATE_UNDELEGATE,
            ActivityEvent.STARGATE_UNSTAKE,
        ],
    },
    other: { type: FilterType.OTHER, value: [ActivityEvent.UNKNOWN_TX] },
} as const

export enum TokenLevelId {
    None,
    Strength,
    Thunder,
    Mjolnir,
    VeThorX,
    StrengthX,
    ThunderX,
    MjolnirX,
    Dawn,
    Lightning,
    Flash,
}

const TOKEN_LEVEL_MAPPING = {
    [TokenLevelId.None]: "None",
    [TokenLevelId.Strength]: "Strength",
    [TokenLevelId.Thunder]: "Thunder",
    [TokenLevelId.Mjolnir]: "Mjolnir",
    [TokenLevelId.VeThorX]: "VeThorX",
    [TokenLevelId.StrengthX]: "StrengthX",
    [TokenLevelId.ThunderX]: "ThunderX",
    [TokenLevelId.MjolnirX]: "MjolnirX",
    [TokenLevelId.Dawn]: "Dawn",
    [TokenLevelId.Lightning]: "Lightning",
    [TokenLevelId.Flash]: "Flash",
} as const

export const getTokenLevelName = (levelId: string): string => {
    const numericLevel = parseInt(levelId, 10)
    return TOKEN_LEVEL_MAPPING[numericLevel as TokenLevelId] || levelId
}
