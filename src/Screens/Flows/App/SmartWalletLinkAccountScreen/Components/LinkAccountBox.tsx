import { ListRenderItemInfo, StyleSheet } from "react-native"
import React, { useCallback, useMemo } from "react"
import { SocialProvider } from "~VechainWalletKit"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { useSmartWallet, useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"
import { IconKey } from "~Model"

type Props = ListRenderItemInfo<SocialProvider>

const ICON_MAP: Record<string, IconKey> = {
    google: "icon-google",
    apple: "icon-apple",
}

export const LinkAccountBox = ({ item }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { linkedAccounts, linkOAuth, unlinkOAuth } = useSmartWallet()

    const linkedAccount = useMemo(() => linkedAccounts.find(account => account.type === item), [linkedAccounts, item])

    const isDisabled = useMemo(
        () => linkedAccounts.length === 1 && Boolean(linkedAccount),
        [linkedAccounts, linkedAccount],
    )

    const onPress = useCallback(() => {
        if (linkedAccount) {
            unlinkOAuth(item, linkedAccount.subject)
        } else {
            linkOAuth(item)
        }
    }, [item, linkedAccount, linkOAuth, unlinkOAuth])

    return (
        <BaseView
            flexDirection="row"
            alignItems="center"
            gap={12}
            px={16}
            py={12}
            borderRadius={12}
            bg={theme.colors.card}>
            <BaseIcon
                name={ICON_MAP[item]}
                size={16}
                iconPadding={4}
                bg={theme.isDark ? COLORS.PURPLE_DISABLED : COLORS.LIGHT_GRAY}
                color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_500}
            />

            <BaseView flex={1} gap={4}>
                <BaseText typographyFont="bodySemiBold" textTransform="capitalize">
                    {item}
                </BaseText>
                {linkedAccount?.email && (
                    <BaseText typographyFont="caption" color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_500}>
                        {linkedAccount.email}
                    </BaseText>
                )}
            </BaseView>
            <BaseTouchable disabled={isDisabled} action={onPress}>
                <BaseIcon
                    name={linkedAccount ? "icon-unlink" : "icon-link"}
                    style={styles.linkBtn}
                    bg={theme.isDark ? theme.colors.cardBorder : theme.colors.transparent}
                    color={theme.isDark ? theme.colors.text : theme.colors.alertDescription}
                    size={16}
                    px={16}
                    py={12}
                    borderRadius={6}
                />
            </BaseTouchable>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        linkBtn: {
            borderWidth: 1,
            borderColor: theme.colors.actionBanner.buttonBorder,
        },
    })
