import React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"
import { useTheme } from "~Hooks"

export const B3trLogoSVG = (props: SvgProps) => {
    const { isDark } = useTheme()
    return (
        <Svg xmlns="http://www.w3.org/2000/svg" width={25} height={24} viewBox="0 0 25 24" fill="none" {...props}>
            <Path
                d="M13.602 23.971a1.666 1.666 0 01-.623-3.212c2.62-1.053 4.772-2.455 6.223-4.053 1.14-1.254 1.808-2.582 1.884-3.737.038-.569-.057-1.323-.721-1.7-.937-.528-3.002-.352-5.988 1.73a1.666 1.666 0 01-2.097-2.577c1.473-1.393 2.547-2.678 3.19-3.82.447-.791.679-1.506.668-2.065-.009-.402-.14-.717-.393-.938-.477-.416-1.504-.337-2.197.17-.752.547-1.33 1.512-1.768 2.945L8.66 16.927c-.223.728-.903 1.25-1.665 1.212-.756-.036-1.383-.54-1.54-1.279-.077-.24-.82-2.372-4.865-8.86a1.665 1.665 0 112.828-1.762c1.477 2.37 2.544 4.203 3.311 5.607l1.865-6.102c.656-2.15 1.634-3.674 2.99-4.664A5.71 5.71 0 0114.665.005c1.247-.053 2.408.333 3.271 1.086.961.84 1.507 2.04 1.533 3.382.02 1.016-.254 2.103-.816 3.24 1.26-.1 2.403.122 3.35.656 1.646.928 2.546 2.73 2.409 4.82-.125 1.902-1.099 3.947-2.743 5.756-1.787 1.969-4.362 3.664-7.445 4.904-.204.082-.415.121-.622.121l-.001.002z"
                fill={isDark ? "#EEF3F7" : "#002234"}
            />
        </Svg>
    )
}
