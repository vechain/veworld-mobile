import React, { ReactNode } from "react"
import { View, ViewProps, StyleSheet } from "react-native"
import { BaseText, BaseView, BaseSpacer } from "~Components/Base"

type Props = {
    title?: string
    rightElement?: ReactNode
    hasBottomSpacer?: boolean
} & ViewProps

export const CenteredHeader = ({ title, rightElement, hasBottomSpacer = false, ...otherProps }: Props) => {
    return (
        <View {...otherProps}>
            <BaseView>
                <BaseView flexDirection="row" w={100} py={12} justifyContent="center">
                    <BaseText typographyFont="subSubTitleSemiBold">{title}</BaseText>
                    {rightElement && <BaseView style={styles.rightElementContainer}>{rightElement}</BaseView>}
                </BaseView>
                {hasBottomSpacer && <BaseSpacer height={24} />}
            </BaseView>
        </View>
    )
}

const styles = StyleSheet.create({
    rightElementContainer: {
        position: "absolute",
        right: 0,
        top: 8,
    },
})
