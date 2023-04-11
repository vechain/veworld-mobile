import { Image, StyleSheet, ViewProps } from "react-native"
import React, { memo } from "react"
import { FungibleToken, Token } from "~Model"
import {
    BaseCard,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { ColorThemeType, useThemedStyles } from "~Common"

type Props = {
    token: FungibleToken | Token
    action: () => void
    selected?: boolean
}

export const OfficialTokenCard = memo(
    ({ token, style, action, selected }: Props & ViewProps) => {
        const { styles } = useThemedStyles(baseStyles(selected))
        return (
            <BaseTouchableBox
                action={action}
                containerStyle={[styles.container, style]}>
                <BaseCard
                    style={styles.card}
                    containerStyle={styles.imageShadow}>
                    {/* @ts-ignore */}
                    <Image source={{ uri: token.icon }} style={styles.image} />
                </BaseCard>
                <BaseSpacer width={16} />
                <BaseView flexDirection="column">
                    <BaseText typographyFont="buttonPrimary">
                        {token.name}
                    </BaseText>
                    <BaseText typographyFont="captionRegular">
                        {token.symbol}
                    </BaseText>
                </BaseView>
            </BaseTouchableBox>
        )
    },
)

const baseStyles = (selected?: boolean) => (theme: ColorThemeType) =>
    StyleSheet.create({
        imageShadow: {
            width: "auto",
        },
        container: {
            width: "100%",
            marginVertical: 7,
            borderWidth: selected ? 1 : 0,
            borderRadius: 16,
            borderColor: theme.colors.text,
        },
        card: {
            padding: 10,
        },
        image: { width: 20, height: 20 },
    })
