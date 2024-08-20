import React, { memo } from "react"
import { ActivityDetail } from "../Type"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { useTheme } from "~Hooks"
import { StyleSheet } from "react-native"
import FiatBalance from "../../HomeScreen/Components/AccountCard/FiatBalance"

export type ActivityDetailContent = ActivityDetail

type Props = {
    activityDetail: ActivityDetailContent
    border?: boolean
}

export const ActivityDetailItem: React.FC<Props> = memo(({ activityDetail, border = true }) => {
    const theme = useTheme()

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
                    {activityDetail.title}
                </BaseText>

                <BaseTouchable
                    action={activityDetail.onValuePress}
                    disabled={!activityDetail.onValuePress}
                    style={baseStyles.valueContainer}>
                    <BaseText typographyFont={activityDetail.typographyFont} underline={activityDetail.underline}>
                        {activityDetail.value}
                    </BaseText>

                    {activityDetail.valueAdditional && (
                        <FiatBalance
                            typographyFont="buttonSecondary"
                            ml={6}
                            balances={[activityDetail.valueAdditional]}
                            prefix="≈ "
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
})

const baseStyles = StyleSheet.create({
    container: {
        minHeight: 65,
    },
    valueContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 12,
    },
})
