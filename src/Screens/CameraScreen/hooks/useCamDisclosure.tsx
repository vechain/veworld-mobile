import { useNavigation } from "@react-navigation/native"
import { useCallback, useEffect, useState } from "react"

export const useCamDisclosure = () => {
    const nav = useNavigation()
    const [isActive, setIsActive] = useState(false)

    useEffect(() => setIsActive(true), [])

    const onClose = useCallback(() => {
        setIsActive(false)
        // https://github.com/mrousavy/react-native-vision-camera/issues/905
        setTimeout(() => {
            nav.goBack()
        }, 10)
    }, [nav])

    return { onClose, isActive }
}
