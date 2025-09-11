import React, { memo, useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSkeleton, BaseText, BaseTouchable, BaseView, FiatBalance } from "~Components"
import { useTheme } from "~Hooks"
import { ActivityDetail } from "../Type"

export type ActivityDetailContent = ActivityDetail

type Props = {
    activityDetail: ActivityDetailContent
    border?: boolean
    isLoading?: boolean
    testID?: string
}

const ActivityDetailItemSkeleton = () => {
    const theme = useTheme()

    return (
        <BaseSkeleton
            containerStyle={baseStyles.skeletonContainer}
            animationDirection="horizontalLeft"
            boneColor={theme.colors.skeletonBoneColor}
            highlightColor={theme.colors.skeletonHighlightColor}
            layout={[
                {
                    flexDirection: "column",
                    width: 80,
                    height: 22,
                    borderRadius: 12,
                },
            ]}
        />
    )
}

export const ActivityDetailItem: React.FC<Props> = memo(
    ({ activityDetail, border = true, isLoading = false, testID }) => {
        const theme = useTheme()

        const activityDetailValue = useMemo(() => {
            if (isLoading) return <ActivityDetailItemSkeleton />
            if (typeof activityDetail.value === "string")
                return (
                    <BaseText
                        typographyFont={activityDetail.typographyFont}
                        underline={activityDetail.underline}
                        testID={testID ? `${testID}-value` : undefined}>
                        {activityDetail.value ?? ""}
                    </BaseText>
                )
            return activityDetail.value
        }, [activityDetail.typographyFont, activityDetail.underline, activityDetail.value, isLoading, testID])

        return (
            <BaseView
                key={activityDetail.id}
                w={100}
                pt={12}
                style={[
                    baseStyles.container,
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                        borderBottomColor: border ? theme.colors.separator : "",
                        borderBottomWidth: border ? 0.5 : 0,
                    },
                ]}
                justifyContent="flex-start">
                <BaseView>
                    <BaseText typographyFont="body" pb={5}>
                        {activityDetail.eventName ?? ""}
                    </BaseText>
                    {typeof activityDetail.title === "string" ? (
                        <BaseText typographyFont="body" pb={5}>
                            {activityDetail.title}
                        </BaseText>
                    ) : (
                        activityDetail.title
                    )}

                    <BaseTouchable
                        action={activityDetail.onValuePress}
                        disabled={!activityDetail.onValuePress}
                        style={baseStyles.valueContainer}>
                        {activityDetailValue}

                        {activityDetail.valueAdditional && (
                            <FiatBalance
                                typographyFont="buttonSecondary"
                                ml={6}
                                balances={[activityDetail.valueAdditional]}
                                prefix="≈ "
                                testID={testID ? `${testID}-additional` : undefined}
                            />
                        )}
                        {activityDetail.icon && (
                            <BaseView pl={3}>
                                <BaseIcon name={activityDetail.icon} size={12} color={theme.colors.text} />
                            </BaseView>
                        )}
                    </BaseTouchable>
                </BaseView>
            </BaseView>
        )
    },
)

const baseStyles = StyleSheet.create({
    container: {
        minHeight: 65,
    },
    valueContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 12,
    },
    skeletonContainer: {
        width: "100%",
        flexDirection: "column",
    },
})
