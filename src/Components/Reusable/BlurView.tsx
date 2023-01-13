import React from 'react'
import {StyleSheet, ViewProps} from 'react-native'
import {BlurView as BV, BlurViewProps} from '@react-native-community/blur'

type Props = {
    cornerRadius?: number
} & BlurViewProps &
    ViewProps

export const BlurView = (props: Props) => {
    return (
        <BV
            style={[
                StyleSheet.absoluteFill,
                {
                    borderTopLeftRadius: props.cornerRadius,
                    borderBottomLeftRadius: props.cornerRadius,
                },
            ]}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
        />
    )
}
