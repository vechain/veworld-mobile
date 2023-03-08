import { colors } from "./Colors"

const light = {
    card: {
        shadowColor: colors.light.primary,

        shadowOffset: {
            height: 0,
            width: 0,
        },
        shadowOpacity: 0.08,
        shadowRadius: 10,
    },
    bottom: {
        shadowColor: colors.light.primary,
        shadowOffset: {
            height: 0,
            width: 0,
        },
        shadowOpacity: 0.16,
        shadowRadius: 16,
    },

    nftCard: {
        shadowColor: colors.light.primary,

        shadowOffset: {
            height: 0,
            width: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
}

const dark = {
    card: {},

    bottom: {
        shadowColor: colors.dark.primary,
        shadowOffset: {
            height: -4,
            width: 0,
        },
        shadowOpacity: 0.08,
        shadowRadius: 16,
    },

    nftCard: {
        shadowColor: colors.dark.primary,

        shadowOffset: {
            height: 0,
            width: 0,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
}

export type Shadow = typeof dark | typeof light

export const shadows = { light, dark }
