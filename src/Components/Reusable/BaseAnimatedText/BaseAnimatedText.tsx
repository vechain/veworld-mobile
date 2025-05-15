import Animated from "react-native-reanimated"
import { BaseText } from "~Components/Base/BaseText"
import ReanimatedUtils from "~Utils/ReanimatedUtils"

export const BaseAnimatedText = Animated.createAnimatedComponent(ReanimatedUtils.wrapFunctionComponent(BaseText))
