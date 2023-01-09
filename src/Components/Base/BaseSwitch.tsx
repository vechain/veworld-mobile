import {Switch, ViewProps} from 'react-native'
import React, {memo} from 'react'

type Props = {
    trackColors?: string[]
    thumbColor?: string
    disabled?: boolean
    ios_bg?: string
    toggleAction: () => void
    isOn: boolean
} & ViewProps

export const BaseSwitch = memo((props: Props) => {
    console.log(props.isOn)

    return (
        <Switch
            trackColor={{
                false: props.trackColors ? props.trackColors[0] : '#767577',
                true: props.trackColors ? props.trackColors[1] : '#81b0ff',
            }}
            thumbColor={props.isOn ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={props.toggleAction}
            value={props.isOn}
        />
    )
})
