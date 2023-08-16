import * as React from "react"
import { StyleSheet, View } from "react-native"
import Slider from "@react-native-community/slider"
import { BaseView } from "../BaseView"
import { useTheme } from "~Hooks"

type Props = {
    value: number
    maximumValue?: number
    marks?: number[]
    onChange: (n: number) => void
    testID?: string
}

export const BaseRange = ({
    value,
    onChange,
    marks = [0, 25, 50, 75, 100],
    maximumValue = 100,
    testID,
}: Props) => {
    const theme = useTheme()

    return (
        <BaseView
            flex={1}
            flexDirection="row"
            style={styles.container}
            testID={testID}>
            {marks.map((markValue: number, index: number) => {
                let percentage = (markValue / maximumValue) * 100
                let left: number | string = `${percentage}%`
                let right: number | string = "auto"
                if (percentage === 0 || percentage === 100) {
                    return null
                }
                return (
                    <View
                        key={index}
                        style={[
                            {
                                left,
                                right,
                                backgroundColor: theme.colors.primary,
                            },
                            styles.mark,
                        ]}
                    />
                )
            })}
            <Slider
                value={value}
                onValueChange={onChange}
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.primary}
                thumbTintColor={theme.colors.primary}
                tapToSeek
            />
        </BaseView>
    )
}

const styles = StyleSheet.create({
    container: { paddingVertical: 20, alignItems: "center" },
    slider: { width: "100%" },
    mark: {
        position: "absolute",
        height: 10,
        width: 1,
    },
})
