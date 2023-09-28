import { useEffect, useState } from "react"
import { StackAnimationTypes } from "react-native-screens"
import { DeviceInfoUtils } from "~Utils"

export const useNavAnimation = () => {
    const [animation, setAnimation] = useState<
        StackAnimationTypes | undefined
    >()

    useEffect(() => {
        async function init() {
            const isSlowDevice = await DeviceInfoUtils.isSlowDevice()
            setAnimation(isSlowDevice ? "none" : "default")
        }
        init()
    }, [])

    return { animation }
}
