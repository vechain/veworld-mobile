import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { FlatList, ListRenderItemInfo } from "react-native"
import { InfoBottomSheet, Layout } from "~Components"
import { BaseIcon, BaseSpacer, BaseView } from "~Components/Base"
import { useTheme } from "~Hooks/useTheme"
import { Routes } from "~Navigation/Enums"
import { RootStackParamListSettings } from "~Navigation/Stacks"
import { PlatformUtils } from "~Utils"
import { SocialProvider } from "~VechainWalletKit"
import { LinkAccountBox } from "./Components"
import { COLORS } from "~Constants"
import { useBottomSheetModal } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = NativeStackScreenProps<RootStackParamListSettings, Routes.SMART_WALLET_LINK_ACCOUNT>

const LINKED_ACCOUNT_TYPES: SocialProvider[] = ["apple", "google"]

export const SmartWalletLinkAccountScreen = ({ route }: Props) => {
    const { device } = route.params
    const { LL } = useI18nContext()
    const theme = useTheme()

    const { ref: infoBottomSheetRef, onOpen: openInfoBottomSheet } = useBottomSheetModal()

    const availableLinkedAccounts = useMemo(() => {
        return LINKED_ACCOUNT_TYPES.filter(account => {
            //filter out apple on android because it's not supported
            if (PlatformUtils.isAndroid() && account === "apple") {
                return false
            }
            return true
        })
    }, [])

    const renderItem = useCallback((props: ListRenderItemInfo<SocialProvider>) => {
        return <LinkAccountBox {...props} />
    }, [])

    const renderSeparator = useCallback(() => {
        return <BaseSpacer height={16} />
    }, [])

    return (
        <Layout
            title={device.alias}
            headerRightElement={
                <BaseIcon
                    name="icon-info"
                    size={20}
                    color={theme.isDark ? COLORS.GREY_100 : COLORS.GREY_600}
                    action={openInfoBottomSheet}
                />
            }
            body={
                <BaseView flex={1}>
                    <FlatList
                        data={availableLinkedAccounts}
                        renderItem={renderItem}
                        keyExtractor={item => item}
                        ItemSeparatorComponent={renderSeparator}
                    />
                    <InfoBottomSheet
                        bsRef={infoBottomSheetRef}
                        title={LL.BS_INFO_LINKING_ACCOUNTS_TITLE()}
                        description={LL.BS_INFO_LINKING_ACCOUNTS_DESCRIPTION()}
                    />
                </BaseView>
            }
        />
    )
}
