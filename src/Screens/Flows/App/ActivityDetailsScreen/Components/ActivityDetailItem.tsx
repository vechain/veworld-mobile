import React, { memo } from "react"
import { ActivityDetail } from "../Type"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { useTheme } from "~Common"
import { StyleSheet } from "react-native"

type Props = {
    activityDetail: ActivityDetail
    border?: boolean
}

export const ActivityDetailItem: React.FC<Props> = memo(
    ({ activityDetail, border = true }) => {
        const theme = useTheme()

        return (
            <BaseView
                key={activityDetail.id}
                w={100}
                flexDirection="row"
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
                        action={
                            activityDetail.onValuePress
                                ? activityDetail.onValuePress
                                : () => {}
                        }
                        disabled={!activityDetail.onValuePress}
                        style={baseStyles.valueContainer}>
                        <BaseText typographyFont="subSubTitle">
                            {activityDetail.value}
                        </BaseText>

                        {activityDetail.valueAdditional && (
                            <BaseText typographyFont="captionRegular">
                                {" "}
                                {activityDetail.valueAdditional}
                            </BaseText>
                        )}
                        {activityDetail.icon && (
                            <BaseView pl={3}>
                                <BaseIcon
                                    name={activityDetail.icon}
                                    size={12}
                                    color={theme.colors.text}
                                />
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
        height: 65,
    },
    valueContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
})
