import { AnimatedProp, Color } from "@shopify/react-native-skia"
import { SharedValue } from "react-native-reanimated"

export type DataPoint = {
    timestamp: number
    value: number
}
export type LineChartData = Array<DataPoint>
export interface LineChartContextType {
    data: LineChartData
    activePointIndex: SharedValue<number>
    selectedPoint: DataPoint | null
}

export type LineChartProps = {
    /**
     * The width of the chart dimension
     * @default SCREEN_WIDTH
     */
    width?: number
    /**
     * The height of the chart dimension
     * @default 125
     */
    height?: number

    /**
     * The width of the stroke
     * @default 4
     */
    strokeWidth?: number

    /**
     * Whether to show the highlight while hovering over the chart
     * @default true
     */
    showHighlight?: boolean
    /**
     * Whether to show the cursor line
     * @default true
     */
    showCursor?: boolean
    /**
     * Whether to show the chip with the timestamp
     * @default true
     */
    showChip?: boolean
    /**
     * Whether to show the gradient background
     * @default true
     */
    showGradientBackground?: boolean
    /**
     * The size of the font
     * @default 12
     */
    fontSize?: number
    /**
     * Whether to make the chart interactive
     * @default true
     */
    isInteractive?: boolean

    highlightColor?: string
    cursorColor?: string
    chipBackgroundColor?: string
    chipTextColor?: string
    gradientBackgroundColors?: AnimatedProp<Color[]>
}
