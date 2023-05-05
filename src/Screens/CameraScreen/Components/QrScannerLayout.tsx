import React from "react"
import { Dimensions, StyleSheet, View } from "react-native"
import { Mask, Rect, Svg, Defs } from "react-native-svg"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "~Common"

const deviceWidth = SCREEN_WIDTH
const deviceHeight = SCREEN_HEIGHT
const QR_SCAN_SQUARE_SIZE = Dimensions.get("window").width - 40

type Props = { color: string }

export const QrScannerLayout = ({ color }: Props) => (
    <View style={baseStyles.container}>
        <Svg height="100%" width="100%">
            <Defs>
                <Mask id="mask" x="0" y="0" height="100%" width="100%">
                    <Rect height="100%" width="100%" fill="#fff" />
                    <Rect
                        x={deviceWidth / 2 - QR_SCAN_SQUARE_SIZE / 2}
                        y={deviceHeight / 2 - QR_SCAN_SQUARE_SIZE / 2}
                        rx="50"
                        ry="50"
                        width={QR_SCAN_SQUARE_SIZE}
                        height={QR_SCAN_SQUARE_SIZE}
                        stroke="white"
                        fill="black"
                        strokeWidth="5"
                    />
                </Mask>
            </Defs>
            <Rect
                height="100%"
                width="100%"
                fill={color}
                mask="url(#mask)"
                fill-opacity="0"
            />
        </Svg>
    </View>
)

const baseStyles = StyleSheet.create({
    container: {
        position: "absolute",
        width: deviceWidth,
        height: deviceHeight,
    },
})
