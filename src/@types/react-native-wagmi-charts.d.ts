// src/@types/react-native-wagmi-charts.d.ts
import "react-native-wagmi-charts"

declare module "react-native-wagmi-charts" {
    // For the direct export
    export interface LineChartGradientProps {
        lastGradientValue?: number
    }

    // For the component namespace structure
    export namespace LineChart {
        // This is likely what's being used in your ChartView.tsx
        interface Gradient {
            props: {
                lastGradientValue?: number
            }
        }
    }
}
