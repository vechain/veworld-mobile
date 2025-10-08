import React, { useMemo } from "react"
import { BaseText, BaseTouchable, BaseView, Icon, QRCodeBottomSheet } from "~Components"
import { AddTokenBottomSheet } from "./AddTokenBottomSheet"
import { COLORS, ColorThemeType } from "~Constants"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import { useThemedStyles, useBottomSheetModal, useHasAnyVeBetterActions } from "~Hooks"
import { BigNutils } from "~Utils"
import { useSortedTokensByFiatValue } from "~Hooks/useSortedTokensByFiatValue"

export const AddTokensCard = () => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)
    const { ref, onOpen } = useBottomSheetModal()
    const { ref: qrCodeBottomSheetRef } = useBottomSheetModal()

    const { data: hasAnyVeBetterActions } = useHasAnyVeBetterActions()
    const { tokens } = useSortedTokensByFiatValue()

    const hasTokensWithBalance = useMemo(() => tokens.some(token => !BigNutils(token.balance.balance).isZero), [tokens])

    const isNewUserWithNoTokens = useMemo(
        () => !hasAnyVeBetterActions && !hasTokensWithBalance,
        [hasAnyVeBetterActions, hasTokensWithBalance],
    )

    return isNewUserWithNoTokens ? (
        <BaseView style={styles.root}>
            <BaseText typographyFont="captionMedium" color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_700}>
                {LL.BALANCE_TAB_NO_TOKENS()}
            </BaseText>

            <BaseTouchable style={styles.addTokens} haptics="Light" onPress={onOpen} testID="add-tokens-button">
                <BaseText typographyFont="bodySemiBold" color={theme.isDark ? COLORS.PURPLE : COLORS.GREY_50}>
                    {LL.MANAGE_TOKEN_ADD_SUGGESTED_TOKENS()}
                </BaseText>
                <Icon name="icon-plus-circle" color={theme.isDark ? COLORS.PURPLE : COLORS.GREY_50} size={20} />
            </BaseTouchable>

            <AddTokenBottomSheet bottomSheetRef={ref} qrCodeBottomSheetRef={qrCodeBottomSheetRef} />
            <QRCodeBottomSheet ref={qrCodeBottomSheetRef} />
        </BaseView>
    ) : null
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        root: {
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 8,
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
