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
    inactiveColor?: string
    sizeRatio: number
}> = props => {
    const [animVal] = useState(new Animated.Value(0))
    const [animate, setAnimate] = useState(false)
    const [type, setType] = useState(() =>
        getDotStyle({
            idx: props.idx,
            curPage: props.curPage,
            maxPage: props.maxPage,
        }),
    )

    const [dotColor, setDotColor] = useState<string>(() => {
        //Dot is the current selected
        if (props.curPage === props.idx) {
            return props.activeColor
        }

        return props.inactiveColor ?? props.activeColor
    })

    //Get the previous values
    const prevType = usePrevious(type)
    const prevDotColor = usePrevious<string>(dotColor)

    /*
     - Checks whether the dot should animate its appearance changes based on changes to its type state and sets the animate state accordingly.
     - Updates the dotColor state based on whether the dot is currently the active page or not. Finally,
     - it updates the type state to the next appearance based on the current props.
    */
    useEffect(() => {
        const nextType = getDotStyle({
            idx: props.idx,
            curPage: props.curPage,
            maxPage: props.maxPage,
        })

        const nextAnimate =
            nextType.size !== (prevType?.size || 3) ||
            nextType.opacity !== (prevType?.opacity || 0.2)
        if (props.curPage === props.idx) {
            setDotColor(props.activeColor)
        } else {
            setDotColor(props.inactiveColor ?? props.activeColor)
        }

        setType(nextType)
        setAnimate(nextAnimate)
    }, [
        prevType?.opacity,
        prevType?.size,
        props.activeColor,
        props.curPage,
        props.idx,
        props.inactiveColor,
        props.maxPage,
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
                (prevType?.size || 3) * props.sizeRatio,
                type.size * props.sizeRatio,
            ],
        })

        const sizeWidth = animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [
                props.curPage === props.idx
                    ? (prevType?.size || 3) * props.sizeRatio * 2.5
                    : (prevType?.size || 3) * props.sizeRatio,
                props.curPage === props.idx
                    ? type.size * props.sizeRatio * 2.5
                    : type.size * props.sizeRatio,
            ],
        })

        const backgroundColor = animVal.interpolate({
            inputRange: [0, 1],
            outputRange: [prevDotColor ?? props.activeColor, dotColor],
        })

        return {
            width: sizeWidth,
            height: sizeHeight,
            backgroundColor,
            borderRadius: animVal.interpolate({
                inputRange: [0, 1],
                outputRange: [
                    (prevType?.size || 3) * props.sizeRatio * 0.5,
                    type.size * props.sizeRatio * 0.5,
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
        props.activeColor,
        props.curPage,
        props.idx,
        props.sizeRatio,
        type.opacity,
        type.size,
    ])

    if (props.curPage < 3) {
        if (props.idx >= 5) return <EmptyDot sizeRatio={props.sizeRatio} />
    } else if (props.curPage < 4) {
        if (props.idx > 5) return <EmptyDot sizeRatio={props.sizeRatio} />
    }

    return (
        <Animated.View
            style={[
                {
                    margin: 3 * props.sizeRatio,
                },
                animStyle,
            ]}
        />
    )
}

export default Dot
