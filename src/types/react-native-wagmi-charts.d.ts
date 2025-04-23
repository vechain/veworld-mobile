import "react-native-wagmi-charts"

declare module "react-native-wagmi-charts" {
    namespace LineChart {
        // Extend the existing GradientProps interface to add our custom property
        interface GradientProps {
            lastGradientValue?: number
        }
    }
}
