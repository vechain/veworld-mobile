export enum ActivityStatus {
    PENDING = "PENDING",
    REVERTED = "REVERTED",
    SUCCESS = "SUCCESS",
}

export enum ActivityType {
    CONNECTED_APP_TRANSACTION = "CONNECTED_APP_TRANSACTION",
    SIGN_CERT = "SIGN_CERT", // local
    SIGN_TYPED_DATA = "SIGN_TYPED_DATA", // local

    DAPP_TRANSACTION = "DAPP_TRANSACTION",

    // New types
    B3TR_SWAP_VOT3_TO_B3TR = "B3TR_SWAP_VOT3_TO_B3TR",
    B3TR_SWAP_B3TR_TO_VOT3 = "B3TR_SWAP_B3TR_TO_VOT3",
    B3TR_PROPOSAL_SUPPORT = "B3TR_PROPOSAL_SUPPORT",
    B3TR_CLAIM_REWARD = "B3TR_CLAIM_REWARD",
    B3TR_UPGRADE_GM = "B3TR_UPGRADE_GM", //
    B3TR_ACTION = "B3TR_ACTION",
    B3TR_PROPOSAL_VOTE = "B3TR_PROPOSAL_VOTE",
    B3TR_XALLOCATION_VOTE = "B3TR_XALLOCATION_VOTE",
    TRANSFER_VET = "TRANSFER_VET",
    TRANSFER_FT = "TRANSFER_FT",
    TRANSFER_NFT = "TRANSFER_NFT",
    TRANSFER_SF = "TRANSFER_SF",
    SWAP_VET_TO_FT = "SWAP_VET_TO_FT",
    SWAP_FT_TO_VET = "SWAP_FT_TO_VET",
    SWAP_FT_TO_FT = "SWAP_FT_TO_FT",
    UNKNOWN_TX = "UNKNOWN_TX",
    STARGATE_CLAIM_REWARDS_BASE = "STARGATE_CLAIM_REWARDS_BASE",
    STARGATE_CLAIM_REWARDS_DELEGATE = "STARGATE_CLAIM_REWARDS_DELEGATE",
    STARGATE_DELEGATE = "STARGATE_DELEGATE",
    STARGATE_STAKE = "STARGATE_STAKE",
    STARGATE_UNDELEGATE = "STARGATE_UNDELEGATE",
    STARGATE_UNSTAKE = "STARGATE_UNSTAKE",
    STARGATE_DELEGATE_ONLY = "STARGATE_DELEGATE_ONLY",
}

export enum ActivityEvent {
    B3TR_SWAP_VOT3_TO_B3TR = "B3TR_SWAP_VOT3_TO_B3TR",
    B3TR_SWAP_B3TR_TO_VOT3 = "B3TR_SWAP_B3TR_TO_VOT3",
    B3TR_PROPOSAL_SUPPORT = "B3TR_PROPOSAL_SUPPORT",
    B3TR_CLAIM_REWARD = "B3TR_CLAIM_REWARD",
    B3TR_UPGRADE_GM = "B3TR_UPGRADE_GM", //
    B3TR_ACTION = "B3TR_ACTION",
    B3TR_PROPOSAL_VOTE = "B3TR_PROPOSAL_VOTE",
    B3TR_XALLOCATION_VOTE = "B3TR_XALLOCATION_VOTE",
    TRANSFER_VET = "TRANSFER_VET",
    TRANSFER_FT = "TRANSFER_FT",
    TRANSFER_NFT = "TRANSFER_NFT",
    TRANSFER_SF = "TRANSFER_SF",
    SWAP_VET_TO_FT = "SWAP_VET_TO_FT",
    SWAP_FT_TO_VET = "SWAP_FT_TO_VET",
    SWAP_FT_TO_FT = "SWAP_FT_TO_FT",
    UNKNOWN_TX = "UNKNOWN_TX",
    STARGATE_CLAIM_REWARDS_BASE = "STARGATE_CLAIM_REWARDS_BASE",
    STARGATE_CLAIM_REWARDS_DELEGATE = "STARGATE_CLAIM_REWARDS_DELEGATE",
    STARGATE_DELEGATE = "STARGATE_DELEGATE",
    STARGATE_STAKE = "STARGATE_STAKE",
    STARGATE_UNDELEGATE = "STARGATE_UNDELEGATE",
    STARGATE_UNSTAKE = "STARGATE_UNSTAKE",
    STARGATE_DELEGATE_ONLY = "STARGATE_DELEGATE_ONLY",
}

export enum ActivitySearchBy {
    TO = "to",
    FROM = "from",
    ORIGIN = "origin",
    GAS_PAYER = "gasPayer",
}

export enum ActivitySupport {
    AGAINST = "AGAINST",
    FOR = "FOR",
    ABSTAIN = "ABSTAIN",
}
