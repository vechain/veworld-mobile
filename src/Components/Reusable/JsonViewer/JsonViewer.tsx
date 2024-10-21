import React, { useCallback, useMemo } from "react"
import { StyleSheet } from "react-native"
import JSONTree, { Renderable, JSONTreeProps } from "react-native-json-tree"
import { BaseText, BaseView, CopyToClipboardAddress } from "~Components"
import { useThemedStyles } from "~Hooks"
import { AddressUtils } from "~Utils"
import { isIOS } from "~Utils/PlatformUtils/PlatformUtils"

type Props = {
    data: Record<string, unknown>
}

export const JsonViewer: React.FC<Props> = ({ data }) => {
    const { styles, theme } = useThemedStyles(baseStyles)

    const renderJsonKey = useCallback((labels: string[]) => {
        return <BaseText typographyFont="bodyBold">{`${labels[0]}:`}</BaseText>
    }, [])

    const renderJsonValue = useCallback(
        (element: Renderable) => {
            if (typeof element === "string") {
                const parsedValue = element.toString().replaceAll('"', "")
                if (parsedValue && AddressUtils.isValid(parsedValue))
                    return <CopyToClipboardAddress address={parsedValue} />

                return (
                    <BaseText typographyFont="body" style={styles.valueElement}>
                        {element.toString()}
                    </BaseText>
                )
            }
            return element?.toString()
        },
        [styles.valueElement],
    )

    const jsonViewerTheme: JSONTreeProps["theme"] = useMemo(
        () => ({
            base00: theme.colors.card,
            tree: {
                paddingTop: 16,
                borderRadius: 16,
                paddingLeft: 8,
            },
            arrowContainer: {
                opacity: 0,
                pointerEvents: "none",
                paddingLeft: 4,
            },
            arrow: {
                display: "none",
            },
            value: {
                flexWrap: "wrap",
            },
            valueLabel: {
                lineHeight: isIOS() ? 1 : undefined,
            },
            nestedNodeLabel: {
                pointerEvents: "none",
            },
            nestedNodeItemString: {
                display: "none",
                pointerEvents: "none",
            },
        }),
        [theme.colors.card],
    )

    return (
        <BaseView>
            <JSONTree
                data={data}
                hideRoot
                theme={jsonViewerTheme}
                shouldExpandNode={() => true}
                invertTheme={false}
                labelRenderer={renderJsonKey}
                valueRenderer={renderJsonValue}
            />
        </BaseView>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        valueElement: {
            opacity: 0.7,
        },
    })
