import * as Localization from "expo-localization"

export const useDecimalSeparator = () => {
    const { decimalSeparator } = Localization.getLocales()[0]
    return decimalSeparator
}
