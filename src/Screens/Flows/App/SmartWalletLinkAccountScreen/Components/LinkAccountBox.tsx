import { ListRenderItemInfo, StyleSheet } from "react-native"
import React, { useCallback, useMemo } from "react"
import { SocialProvider } from "~VechainWalletKit"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components/Base"
import { useSmartWallet, useThemedStyles } from "~Hooks"
import { COLORS, ColorThemeType } from "~Constants"
import { IconKey } from "~Model"
import { PlatformUtils } from "~Utils"

type Props = ListRenderItemInfo<SocialProvider> & {
    onUnlink?: (provider: SocialProvider, subject: string) => void
}

const ICON_MAP: Record<string, IconKey> = {
    google: "icon-google",
    apple: "icon-apple",
}

export const LinkAccountBox = ({ item, onUnlink }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { linkedAccounts, linkOAuth, unlinkOAuth } = useSmartWallet()

    const linkedAccount = useMemo(() => linkedAccounts.find(account => account.type === item), [linkedAccounts, item])

    const isDisabled = useMemo(
        /**
         * If there is only one linked account and it is the same as the item, disable the button
         * If on android, disable the button because apple is not supported
         * TODO: Remove the android check when other socials are supported
         */
        () => (linkedAccounts.length === 1 && Boolean(linkedAccount)) || PlatformUtils.isAndroid(),
        [linkedAccounts, linkedAccount],
    )

    const onPress = useCallback(() => {
        if (linkedAccount) {
            if (onUnlink) {
                onUnlink(item, linkedAccount.subject)
                return
            }
            unlinkOAuth(item, linkedAccount.subject)
        } else {
            linkOAuth(item)
        }
    }, [item, linkedAccount, linkOAuth, unlinkOAuth, onUnlink])

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
            <BaseTouchable disabled={isDisabled} action={onPress} style={isDisabled ? styles.disabled : undefined}>
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
        disabled: {
            opacity: 0.5,
        },
    })
