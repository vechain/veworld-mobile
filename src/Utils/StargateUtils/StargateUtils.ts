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

const REVERSE_TOKEN_LEVEL_MAPPING = Object.fromEntries(
    Object.entries(TOKEN_LEVEL_MAPPING).map(([key, value]) => [value, parseInt(key, 10)]),
) as Record<(typeof TOKEN_LEVEL_MAPPING)[keyof typeof TOKEN_LEVEL_MAPPING], TokenLevelId>

export type StargateLevelName = keyof typeof REVERSE_TOKEN_LEVEL_MAPPING

export const getTokenLevelName = (levelId: TokenLevelId): string => {
    return TOKEN_LEVEL_MAPPING[levelId] || ""
}

/**
 * Get level id from level name
 * @param levelId Level name
 * @returns Level ID from name
 */
export const getTokenLevelId = (levelName: StargateLevelName) => {
    return REVERSE_TOKEN_LEVEL_MAPPING[levelName]
}
