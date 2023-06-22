import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { isArray, isString } from "lodash"
import { useTheme } from "~Hooks"
import { COLORS } from "~Constants"
import { BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"

interface NFTAttributeData {
    trait_type: string
    value: string | number
}

type Props<T> = {
    title: string
    data: T
    isLastInList?: boolean
    action?: () => void
}

export const InfoSectionView = <T extends NFTAttributeData[] | string>({
    title,
    data,
    isLastInList,
    action,
}: Props<T>) => {
    const theme = useTheme()

    const renderData = useMemo(() => {
        if (action && isString(data)) {
            return <BaseTouchable title={data} underlined action={action} />
        }

        if (isArray(data)) {
            return (
                <BaseView w={100} flexWrap="wrap" flexDirection="row">
                    {data.map(_data => (
                        <BaseView
                            key={_data.trait_type}
                            bg={
                                theme.isDark
                                    ? COLORS.DARK_PURPLE_DISABLED
                                    : COLORS.WHITE
                            }
                            py={8}
                            px={12}
                            mr={8}
                            mb={8}
                            borderRadius={16}
                            justifyContent="space-between">
                            <BaseText typographyFont="smallCaption">
                                {_data.trait_type}
                            </BaseText>
                            <BaseText typographyFont="captionBold">
                                {_data.value}
                            </BaseText>
                        </BaseView>
                    ))}
                </BaseView>
            )
        }

        if (isString(data)) {
            return <BaseText typographyFont="subSubTitle">{data}</BaseText>
        }
    }, [data, theme, action])

    return (
        <BaseView>
            <BaseText mb={4}>{title}</BaseText>
            {renderData}

            {isLastInList && <BaseSpacer height={8} />}

            {!isLastInList && (
                <BaseView
                    my={12}
                    style={baseStyles.border}
                    w={100}
                    bg={theme.isDark ? COLORS.WHITE : COLORS.DARK_PURPLE}
                />
            )}
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    border: {
        height: 1,
    },
})
