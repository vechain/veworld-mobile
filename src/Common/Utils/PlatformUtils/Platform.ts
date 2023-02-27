import { Platform } from "react-native"

const isIOS = () => {
    return Platform.OS === "ios"
}
const isAndroid = () => {
    return Platform.OS === "android"
}

export { isIOS, isAndroid }
