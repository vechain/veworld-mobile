import * as Localization from "expo-localization"

export const useLocale = () => {
    return Localization.getLocales()[0]
}
