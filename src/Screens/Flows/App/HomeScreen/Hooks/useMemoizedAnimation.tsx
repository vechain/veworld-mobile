import { useEffect, useMemo, useState } from "react"
import {
    FadeInRight,
    FadeOutLeft,
    FadeOutRight,
    SlideInLeft,
    SlideInRight,
} from "react-native-reanimated"

export const useMemoizedAnimation = () => {
    const [firstLoad, setFirstLoad] = useState(true)

    useEffect(() => {
        setFirstLoad(false)
    }, [])

    const coinListEnter = useMemo(
        () =>
            firstLoad
                ? FadeInRight.delay(220).duration(250)
                : SlideInLeft.duration(200),
        [firstLoad],
    )
    const coinListExit = useMemo(() => FadeOutLeft.duration(200), [])

    const NFTListEnter = useMemo(() => SlideInRight.duration(200), [])
    const NFTListExit = useMemo(() => FadeOutRight.duration(200), [])

    return { coinListEnter, coinListExit, NFTListEnter, NFTListExit }
}
