import React from "react"
import { BaseSpacer, BaseText, BaseTouchable, BaseView, Icon, QRCodeBottomSheet } from "~Components"
import { VeBetterDaoCard } from "../../Components/VeBetterDao/VeBetterDaoCard"
import { BalanceActivity } from "../Activity/BalanceActivity"
import { TokensTopSection } from "./TokensTopSection"
import { useBottomSheetModal, useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"
import { useI18nContext } from "~i18n"
import { StyleSheet } from "react-native"
import { AddTokenBottomSheet } from "../../Components/Tokens/AddTokenBottomSheet"

const AddTokensCard = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { ref, onOpen, onClose } = useBottomSheetModal()
    const { ref: qrCodeBottomSheetRef } = useBottomSheetModal()

    return (
        <BaseView style={styles.root}>
            <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}>
                {LL.BALANCE_TAB_NO_TOKENS()}
            </BaseText>

            <BaseTouchable style={styles.addTokens} haptics="Light" onPress={onOpen}>
                <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.PURPLE : COLORS.GREY_50}>
                    {LL.MANAGE_TOKEN_ADD_SUGGESTED_TOKENS()}
                </BaseText>
                <Icon name="icon-plus-circle" color={theme.isDark ? COLORS.PURPLE : COLORS.GREY_50} size={20} />
            </BaseTouchable>

            <AddTokenBottomSheet onClose={onClose} bottomSheetRef={ref} qrCodeBottomSheetRef={qrCodeBottomSheetRef} />
            <QRCodeBottomSheet ref={qrCodeBottomSheetRef} />
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderRadius: 12,
            gap: 16,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        },
        addTokens: {
            backgroundColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 42,
            gap: 12,
            borderRadius: 8,
        },
    })

export const Tokens = () => {
    return (
        <BaseView flexDirection="column">
            <TokensTopSection />
            <BaseSpacer height={32} />
            <AddTokensCard />
            <BalanceActivity tab="TOKENS" />
            <BaseSpacer height={40} />
            <VeBetterDaoCard />
        </BaseView>
    )
}
