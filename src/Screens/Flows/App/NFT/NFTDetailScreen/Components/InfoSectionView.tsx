import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { isArray, isString } from "lodash"
import { useTheme } from "~Common"
import { COLORS } from "~Common/Theme"
import { BaseSpacer, BaseText, BaseView } from "~Components"

interface NFTAttributeData {
    trait_type: string
    value: string | number
}

type Props<T> = {
    title: string
    data: T
    isLastInList?: boolean
}

export const InfoSectionView = <
    T extends NFTAttributeData[] | string | number,
>({
    title,
    data,
    isLastInList,
}: Props<T>) => {
    const theme = useTheme()

    const renderData = useMemo(() => {
        if (isArray(data)) {
            return (
                <BaseText typographyFont="subSubTitle">
                    {data.map(_data => (
                        <BaseView
                            key={_data.trait_type}
                            w={100}
                            my={4}
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center">
                            <BaseText typographyFont="subSubTitle">
                                {_data.trait_type}
                            </BaseText>
                            <BaseText>{_data.value}</BaseText>
                        </BaseView>
                    ))}
                </BaseText>
            )
        } else if (isString(data)) {
            return <BaseText typographyFont="subSubTitle">{data}</BaseText>
        }
    }, [data])

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
