import { Dimensions } from "react-native"
import { PlatformUtils } from "~Common/Utils"

export const SCREEN_HEIGHT = Dimensions.get("window").height

export const SCREEN_WIDTH = Dimensions.get("window").width

export const TAB_HEIGHT = PlatformUtils.isIOS() ? 86 : 68

// https://worship.agency/mobile-screen-sizes-for-2021
export const isSmallScreen = SCREEN_HEIGHT <= 667
