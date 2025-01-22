import React, { ReactNode } from "react"
import { View, ViewProps, StyleSheet } from "react-native"
import { BaseText, BaseView, BaseSpacer } from "~Components/Base"
import { useTheme } from "~Hooks"

type Props = {
    title?: string
    rightElement?: ReactNode
    hasBottomSpacer?: boolean
} & ViewProps

export const CenteredHeader = ({ title, rightElement, hasBottomSpacer = false, ...otherProps }: Props) => {
    const theme = useTheme()

    return (
        <View {...otherProps}>
            <BaseView>
                <BaseView flexDirection="row" w={100} style={styles.headerContainer} justifyContent="space-between">
                    <BaseSpacer width={24} />
                    <BaseText color={theme.colors.title} typographyFont="subTitleSemiBold">
                        {title}
                    </BaseText>
                    <BaseView style={styles.rightContainer}>
                        <BaseView style={styles.rightContent}>{rightElement}</BaseView>
                    </BaseView>
                </BaseView>
                {hasBottomSpacer && <BaseSpacer height={24} />}
            </BaseView>
        </View>
    )
}

const styles = StyleSheet.create({
    rightContainer: {
        width: 24,
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    rightContent: {
        position: "absolute",
    },
    headerContainer: {
        height: 48,
    },
})
