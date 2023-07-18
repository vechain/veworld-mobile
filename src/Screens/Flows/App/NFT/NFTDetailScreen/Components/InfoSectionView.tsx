import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { isArray, isString } from "lodash"
import { useTheme } from "~Hooks"
import { COLORS } from "~Constants"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchable,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"

interface NFTAttributeData {
    trait_type: string
    value: string | number
}

type Props<T> = {
    title: string
    data: T
    isLastInList?: boolean
    action?: () => void
    isFontReverse?: boolean
    subTtitle?: string
    isDanger?: boolean
}

export const InfoSectionView = <
    T extends NFTAttributeData[] | string | React.JSX.Element,
>({
    title,
    data,
    isLastInList,
    action,
    subTtitle,
    isDanger = false,
}: Props<T>) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    const renderData = useMemo(() => {
        if (action && isString(data)) {
            return (
                <BaseTouchable
                    title={data}
                    underlined
                    action={action}
                    font={"subSubTitle"}
                />
            )
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
            return (
                <>
                    {isDanger ? (
                        <BaseView flexDirection="row">
                            <BaseIcon
                                name="alert-circle-outline"
                                color={COLORS.DARK_RED}
                                size={16}
                            />
                            <BaseSpacer width={4} />
                            <BaseText
                                typographyFont="buttonSecondary"
                                color={COLORS.DARK_RED}>
                                {LL.SEND_INSUFFICIENT_VTHO()} {data}
                            </BaseText>
                        </BaseView>
                    ) : (
                        <BaseText typographyFont="subSubTitle">{data}</BaseText>
                    )}

                    {subTtitle ? (
                        <BaseText mt={4} typographyFont="subSubTitleLight">
                            {subTtitle}
                        </BaseText>
                    ) : null}
                </>
            )
        }

        if (React.isValidElement(data)) {
            return <>{data}</>
        }
    }, [action, data, theme.isDark, isDanger, LL, subTtitle])

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
