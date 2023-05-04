import { Dimensions } from "react-native"

export const SCREEN_HEIGHT = Dimensions.get("window").height

export const SCREEN_WIDTH = Dimensions.get("window").width

// https://worship.agency/mobile-screen-sizes-for-2021
export const isSmallScreen = SCREEN_HEIGHT <= 667
