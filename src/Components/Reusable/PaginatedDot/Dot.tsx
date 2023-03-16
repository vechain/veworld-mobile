import React, { useEffect, useMemo, useState } from "react"
import { Animated } from "react-native"
import { usePrevious } from "~Common"
import EmptyDot from "./EmptyDot"
import { getDotStyle } from "./DotUtils"

const Dot: React.FC<{
    idx: number
    curPage: number
    maxPage: number
    activeColor: string
    inactiveDotColor?: string
    sizeRatio: number
}> = props => {
    const { idx, curPage, maxPage, activeColor, inactiveDotColor, sizeRatio } =
        props

    const [animVal] = useState(new Animated.Value(0))
    const [animate, setAnimate] = useState(false)
    const [type, setType] = useState(() =>
        getDotStyle({
            idx: idx,
            curPage: curPage,
            maxPage: maxPage,
        }),
    )

    const [dotColor, setDotColor] = useState<string>(() => {
        //Dot is the current selected
        if (curPage === idx) {
            return activeColor
        }

        return inactiveDotColor ?? activeColor
    })

    //Get the previous values
    const prevType = usePrevious(type)
    const prevDotColor = usePrevious<string>(dotColor)

    /*
     - Checks whether the dot should animate its appearance changes based on changes to its type state and sets the animate state accordingly.
     - Updates the dotColor state based on whether the dot is currently the active page or not. Finally,
     - it updates the type state to the next appearance based on the current
    */
    useEffect(() => {
        const nextType = getDotStyle({
            idx: idx,
            curPage: curPage,
            maxPage: maxPage,
        })

        const nextAnimate =
            nextType.size !== (prevType?.size || 3) ||
            nextType.opacity !== (prevType?.opacity || 0.2)
        if (curPage === idx) {
            setDotColor(activeColor)
        } else {
            setDotColor(inactiveDotColor ?? activeColor)
        }

        setType(nextType)
        setAnimate(nextAnimate)
    }, [
        prevType?.opacity,
        prevType?.size,
        activeColor,
        curPage,
        idx,
        inactiveDotColor,
        maxPage,
    ])

    useEffect(() => {
        if (!animate) return

        animVal.setValue(0)
        Animated.timing(animVal, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
        }).start()
    }, [animVal, animate, prevType, type])

    const animStyle = useMemo(() => {
        const sizeHeight = animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [
                (prevType?.size || 3) * sizeRatio,
                type.size * sizeRatio,
            ],
        })

        const sizeWidth = animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [
                curPage === idx
                    ? (prevType?.size || 3) * sizeRatio * 2.5
                    : (prevType?.size || 3) * sizeRatio,
                curPage === idx
                    ? type.size * sizeRatio * 2.5
                    : type.size * sizeRatio,
            ],
        })

        const backgroundColor = animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [prevDotColor ?? activeColor, dotColor],
        })

        return {
            width: sizeWidth,
            height: sizeHeight,
            backgroundColor,
            borderRadius: animVal.interpolate({
                inputRange: [0, 1],
                outputRange: [
                    (prevType?.size || 3) * sizeRatio * 0.5,
                    type.size * sizeRatio * 0.5,
                ],
            }),
            opacity: animVal.interpolate({
                inputRange: [0, 1],
                outputRange: [prevType?.opacity || 0.2, type.opacity],
            }),
        }
    }, [
        animVal,
        dotColor,
        prevDotColor,
        prevType?.opacity,
        prevType?.size,
        activeColor,
        curPage,
        idx,
        sizeRatio,
        type.opacity,
        type.size,
    ])

    if (curPage < 3) {
        if (idx >= 5) return <EmptyDot sizeRatio={sizeRatio} />
    } else if (curPage < 4) {
        if (idx > 5) return <EmptyDot sizeRatio={sizeRatio} />
    }

    return (
        <Animated.View
            style={[
                {
                    margin: 3 * sizeRatio,
                },
                animStyle,
            ]}
        />
    )
}

export default Dot
