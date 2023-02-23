import { useEffect, useMemo, useState } from "react"
import { FadeInRight, SlideInLeft, SlideInRight } from "react-native-reanimated"

export const useMeoizedAnimation = () => {
    const [firstLoad, setFirstLoad] = useState(true)

    useEffect(() => {
        setFirstLoad(false)
    }, [])

    const coinListEnter = useMemo(
        () =>
            firstLoad
                ? FadeInRight.delay(220).duration(250)
                : SlideInLeft.delay(50).duration(200),
        [firstLoad],
    )
    const coinListExit = useMemo(() => SlideInRight.delay(50).duration(200), [])

    const NFTListEnter = useMemo(() => SlideInRight.delay(50).duration(200), [])
    const NFTListExit = useMemo(() => SlideInLeft.delay(50).duration(200), [])

    return { coinListEnter, coinListExit, NFTListEnter, NFTListExit }
}
