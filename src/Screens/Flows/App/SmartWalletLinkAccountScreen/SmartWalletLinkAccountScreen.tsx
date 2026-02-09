import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { Layout } from "~Components"
import { BaseButton, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components/Base"
import { COLORS } from "~Constants"
import { useSmartWallet } from "~Hooks/useSmartWallet"
import { useTheme } from "~Hooks/useTheme"
import { IconKey } from "~Model"
import { Routes } from "~Navigation/Enums"
import { RootStackParamListSettings } from "~Navigation/Stacks"
import { PlatformUtils } from "~Utils"
import { SocialProvider } from "~VechainWalletKit"

type Props = NativeStackScreenProps<RootStackParamListSettings, Routes.SMART_WALLET_LINK_ACCOUNT>

const ICON_MAP: Record<string, IconKey> = {
    google: "icon-google",
    apple: "icon-apple",
}

const LINKED_ACCOUNT_TYPES: SocialProvider[] = ["apple", "google"]

export const SmartWalletLinkAccountScreen = ({ route }: Props) => {
    const { device } = route.params
    const { linkedAccounts, linkOAuth, unlinkOAuth } = useSmartWallet()
    const theme = useTheme()

    const availableLinkedAccounts = useMemo(() => {
        return LINKED_ACCOUNT_TYPES.filter(account => {
            if (PlatformUtils.isAndroid() && account === "apple") {
                return false
            }
            return true
        })
    }, [])

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<SocialProvider>) => {
            const linkedAccount = linkedAccounts.find(account => account.type === item)

            const isDisabled = linkedAccounts.length === 1 && Boolean(linkedAccount)

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
                            <BaseText
                                typographyFont="caption"
                                color={theme.isDark ? COLORS.PURPLE_LABEL : COLORS.GREY_500}>
                                {linkedAccount.email}
                            </BaseText>
                        )}
                    </BaseView>
                    <BaseButton
                        size="sm"
                        title={linkedAccount ? "Unlink" : "Link"}
                        action={() => {
                            if (linkedAccount) {
                                unlinkOAuth(item, linkedAccount.subject)
                            } else {
                                linkOAuth(item)
                            }
                        }}
                        disabled={isDisabled}
                    />
                </BaseView>
            )
        },
        [theme.colors.card, theme.isDark, linkedAccounts, linkOAuth, unlinkOAuth],
    )

    const renderSeparator = useCallback(() => {
        return <BaseSpacer height={16} />
    }, [])

    return (
        <Layout
            title={device.alias}
            headerRightElement={<BaseIcon name="icon-info" size={20} color={theme.colors.title} action={() => {}} />}
            body={
                <BaseView flex={1}>
                    <FlatList
                        data={availableLinkedAccounts}
                        renderItem={renderItem}
                        keyExtractor={item => item}
                        ItemSeparatorComponent={renderSeparator}
                    />
                </BaseView>
            }
        />
    )
}
