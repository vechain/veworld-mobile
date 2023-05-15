import { Dimensions } from "react-native"
import { heightPercentageToDP as hp } from "react-native-responsive-screen"

export const SCREEN_HEIGHT = Dimensions.get("window").height

export const SCREEN_WIDTH = Dimensions.get("window").width

// https://worship.agency/mobile-screen-sizes-for-2021
export const isSmallScreen = SCREEN_HEIGHT <= 667

// Values to height percentages of the screen
export const valueToHP: Record<number, number> = {
    12: hp("1.40%"),
    16: hp("1.87%"),
    21: hp("2.46%"),
    22: hp("2.58%"),
    24: hp("2.81%"),
    28: hp("3.28%"),
    40: hp("4.69%"),
    60: hp("7.04%"),
    170: hp("19.95%"),
    180: hp("21.12%"),
    190: hp("22.30%"),
}
