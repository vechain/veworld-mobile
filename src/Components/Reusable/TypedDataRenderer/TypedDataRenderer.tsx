import React, { ComponentType, PropsWithChildren, useMemo } from "react"
import { BaseView } from "~Components/Base/BaseView"
import { TFonts } from "~Constants"
import { HexUtils } from "~Utils"
import { TabularValueRenderer } from "../TabularValueRenderer"

const Container = ({ children }: PropsWithChildren) => {
    return (
        <BaseView flexDirection="column" gap={12}>
            {children}
        </BaseView>
    )
}

const TypedDataRenderer = ({
    value,
    label,
    testID,
    labelColor,
    textColor,
    iconColor,
    labelRenderer: LabelRenderer,
    typographyFont,
}: {
    value: unknown
    label?: string
    /**
     * Renderer for the label. By default it'll use the default renderer of {@link TabularValueRenderer}
     */
    labelRenderer?: ComponentType<{ label?: string }>
    testID?: string
    /**
     * Color of the label
     */
    labelColor?: string
    /**
     * Color of the text
     */
    textColor?: string
    /**
     * Color of the icon, if the value is an hex value
     */
    iconColor?: string
    /**
     * Typography font for the value
     */
    typographyFont?: TFonts
}) => {
    const isHex = useMemo(() => typeof value === "string" && HexUtils.isValid(value), [value])

    const renderedLabel = useMemo(() => {
        if (LabelRenderer) return <LabelRenderer label={label} />
        if (!label) return ""
        return label
    }, [LabelRenderer, label])

    if (value === null || value === undefined || typeof value === "symbol") return null
    if (typeof value === "object")
        return Object.entries(value).map(([key_, value_]) => (
            <TypedDataRenderer
                value={value_}
                label={label ? `${label}->${key_}` : key_}
                key={label ? `${label}->${key_}` : key_}
                testID={label ? `${label}->${key_}` : key_}
                labelColor={labelColor}
                textColor={textColor}
                iconColor={iconColor}
                labelRenderer={LabelRenderer}
                typographyFont={typographyFont}
            />
        ))

    return (
        <TabularValueRenderer
            label={renderedLabel}
            labelTextColor={labelColor}
            value={
                isHex ? (
                    <TabularValueRenderer.HexValue
                        value={value as string}
                        textColor={textColor}
                        iconColor={iconColor}
                        typographyFont={typographyFont}
                    />
                ) : (
                    <TabularValueRenderer.StringValue
                        value={value.toString()}
                        color={textColor}
                        typographyFont={typographyFont}
                    />
                )
            }
            testID={testID ?? `${label ?? ""}_${typeof value === "string" ? value : value.toString()}`}
        />
    )
}

TypedDataRenderer.Container = Container

export { TypedDataRenderer }
