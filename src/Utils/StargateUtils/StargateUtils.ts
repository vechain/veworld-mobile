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

export const getTokenLevelName = (levelId: TokenLevelId): string => {
    return TOKEN_LEVEL_MAPPING[levelId] || ""
}
