import { getLocales } from "react-native-localize"

export const useLocale = () => {
    return getLocales()[0]
}
