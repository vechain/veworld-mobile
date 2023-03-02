import { colors } from "./Colors"

const light = {
    card: {
        shadowColor: colors.light.primary,

        shadowOffset: {
            height: 0,
            width: 0,
        },
        shadowOpacity: 0.08,
        shadowRadius: 16,
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
}

export type Shadow = typeof dark | typeof light

export const shadows = { light, dark }
