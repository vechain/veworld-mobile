import { useEffect, useMemo, useState } from "react"
import { ComplexAnimationBuilder } from "react-native-reanimated"

type AnimationType<T extends ComplexAnimationBuilder> = T

type Props<T extends ComplexAnimationBuilder> = {
    enteringAnimation: AnimationType<T>
    enteringDelay?: number
    enteringDuration?: number
    exitingAnimation: AnimationType<T>
    exitingDelay?: number
    exitingDuration?: number
}
export const useMemoizedAnimation = <T extends ComplexAnimationBuilder>({
    enteringAnimation,
    enteringDelay = 0,
    enteringDuration = 200,
    exitingAnimation,
    exitingDelay = 0,
    exitingDuration = 200,
}: Props<T>) => {
    const [firstLoad, setFirstLoad] = useState(true)

    useEffect(() => {
        setFirstLoad(false)
    }, [])

    const animateEntering = useMemo(
        () =>
            firstLoad
                ? enteringAnimation
                      .delay(enteringDelay)
                      .duration(enteringDuration)
                : enteringAnimation.duration(enteringDuration),
        [firstLoad, enteringAnimation, enteringDelay, enteringDuration],
    )

    const animateExiting = useMemo(
        () =>
            firstLoad
                ? exitingAnimation.delay(exitingDelay).duration(exitingDuration)
                : exitingAnimation.duration(exitingDuration),
        [firstLoad, exitingAnimation, exitingDelay, exitingDuration],
    )

    return { animateEntering, animateExiting }
}
