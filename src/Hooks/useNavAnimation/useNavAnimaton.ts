import { useEffect, useState } from "react"
import { StackAnimationTypes } from "react-native-screens"
import { DeviceUtils, PlatformUtils } from "~Utils"

export const useNavAnimation = () => {
    const [animation, setAnimation] = useState<StackAnimationTypes | undefined>()

    useEffect(() => {
        async function init() {
            const isSlowDevice = await DeviceUtils.isSlowDevice()

            if (PlatformUtils.isAndroid()) {
                setAnimation(isSlowDevice ? "none" : "default")
            } else {
                setAnimation("default")
            }
        }
        init()
    }, [])

    return { animation }
}
