import { Dimensions } from "react-native"
import { heightPercentageToDP as hp } from "react-native-responsive-screen"

export const SCREEN_HEIGHT = Dimensions.get("window").height

export const SCREEN_WIDTH = Dimensions.get("window").width

// https://worship.agency/mobile-screen-sizes-for-2021
export const isSmallScreen = SCREEN_HEIGHT <= 667

/** Values to height percentages of the screen
 * to calculate percentages is used the following formula:
 * pixel_value * 100 / 852
 * this refers to the height 852 px of the iPhone 14
 * */

export const valueToHP: Record<number, number> = {
    12: hp("1.40%"),
    16: hp("1.87%"),
    21: hp("2.46%"),
    22: hp("2.58%"),
    24: hp("2.81%"),
    28: hp("3.28%"),
    40: hp("4.69%"),
    60: hp("7.04%"),
    120: hp("14.08%"),
    170: hp("19.95%"),
    180: hp("21.12%"),
    190: hp("22.30%"),
}
