import React, { ReactElement } from "react"
import Svg, { Defs, Image, Pattern, SvgProps, Use } from "react-native-svg"
import { Rect } from "react-native-svg"

export const PlaceholderSVG = (props: SvgProps): ReactElement => {
    return (
        <Svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            {...props}>
            <Rect width={24} height={24} rx={12} fill="url(#pattern0)" />
            <Defs>
                <Pattern
                    id="pattern0"
                    patternContentUnits="objectBoundingBox"
                    width={1}
                    height={1}>
                    <Use
                        xlinkHref="#image0_3395_25833"
                        transform="scale(.0125)"
                    />
                </Pattern>
                <Image
                    id="image0_3395_25833"
                    width={80}
                    height={80}
                    // @ts-ignore
                    xlinkHref="data:image/png;base64,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"
                />
            </Defs>
        </Svg>
    )
}
