import { ListRenderItemInfo } from "@react-native/virtualized-lists/Lists/VirtualizedList"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback, useMemo } from "react"
import { FlatList, StyleSheet, TouchableOpacity } from "react-native"
import { BaseSpacer, BaseText, BaseView, Layout, SendVot3WarningBottomSheet } from "~Components"
import { ColorThemeType, VeDelegate, VET, VTHO } from "~Constants"
import { useBottomSheetModal, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { useSendableTokensWithBalance } from "~Hooks/useSendableTokensWithBalance"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectBalanceVisible, selectNetworkVBDTokens, useAppSelector } from "~Storage/Redux"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import { BridgeTokenCard, TokenCard, VechainTokenCard } from "../../HomeScreen/Components"

type Props = NativeStackNavigationProp<RootStackParamListHome, Routes.SELECT_TOKEN_SEND>

export const SelectTokenSendScreen = () => {
    const { LL } = useI18nContext()
    const tokens = useSendableTokensWithBalance()
    const isBalanceVisible = useAppSelector(selectBalanceVisible)
    const { VOT3, B3TR } = useAppSelector(state => selectNetworkVBDTokens(state))
    const { ref: vot3WarningRef, onOpen: openVot3Warning, onClose: closeVot3Warning } = useBottomSheetModal()

    const filteredTokens = useMemo(() => {
        // VeDelegate is not a real token, and cannot be sent
        return tokens.filter(token => token.symbol !== VeDelegate.symbol)
    }, [tokens])

    const nav = useNavigation<Props>()

    const { styles } = useThemedStyles(baseStyles)

    const tokenWithInfoVET = useTokenWithCompleteInfo(VET)
    const tokenWithInfoVTHO = useTokenWithCompleteInfo(VTHO)
    const tokenWithInfoB3TR = useTokenWithCompleteInfo(B3TR)
    const tokenWithInfoVOT3 = useTokenWithCompleteInfo(VOT3)

    const handleClickToken = useCallback(
        (token: FungibleTokenWithBalance) => async () => {
            if (compareAddresses(VOT3.address, token.address)) {
                openVot3Warning()
                return
            }
            nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                token,
            })
        },
        [VOT3.address, nav, openVot3Warning],
    )

    const handleVot3Confirm = () => {
        const vot3Token = filteredTokens.find(token => compareAddresses(VOT3.address, token.address))
        closeVot3Warning()
        if (vot3Token) {
            nav.navigate(Routes.INSERT_ADDRESS_SEND, {
                token: vot3Token,
            })
        }
    }

    const renderTokenCard = useCallback(
        (item: FungibleTokenWithBalance) => {
            switch (item.address.toLowerCase()) {
                case VTHO.address.toLowerCase():
                    return (
                        <VechainTokenCard
                            isAnimation={false}
                            isBalanceVisible={isBalanceVisible}
                            tokenWithInfo={tokenWithInfoVTHO}
                        />
                    )
                case VET.address.toLowerCase():
                    return (
                        <VechainTokenCard
                            isAnimation={false}
                            isBalanceVisible={isBalanceVisible}
                            tokenWithInfo={tokenWithInfoVET}
                            alignWithFiatBalance="center"
                        />
                    )
                case B3TR.address.toLowerCase():
                    return (
                        <VechainTokenCard
                            isAnimation={false}
                            isBalanceVisible={isBalanceVisible}
                            tokenWithInfo={tokenWithInfoB3TR}
                        />
                    )
                case VOT3.address.toLowerCase():
                    return (
                        <VechainTokenCard
                            isAnimation={false}
                            isBalanceVisible={isBalanceVisible}
                            tokenWithInfo={tokenWithInfoVOT3}
                        />
                    )
                default:
                    return item.crossChainProvider ? (
                        <BridgeTokenCard tokenWithBalance={item} isBalanceVisible={isBalanceVisible} isEdit={false} />
                    ) : (
                        <TokenCard tokenWithBalance={item} isEdit={false} isBalanceVisible={isBalanceVisible} />
                    )
            }
        },
        [
            B3TR.address,
            VOT3.address,
            tokenWithInfoB3TR,
            tokenWithInfoVET,
            tokenWithInfoVOT3,
            tokenWithInfoVTHO,
            isBalanceVisible,
        ],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<FungibleTokenWithBalance>) => {
            return (
                <TouchableOpacity
                    onPress={handleClickToken(item)}
                    key={item.address}
                    style={styles.tokenContainer}
                    testID={item.symbol}>
                    {renderTokenCard(item)}
                </TouchableOpacity>
            )
        },
        [handleClickToken, renderTokenCard, styles.tokenContainer],
    )

    const renderItemSeparator = useCallback(() => <BaseSpacer height={8} />, [])

    return (
        <Layout
            safeAreaTestID="Select_Token_Send_Screen"
            title={LL.SEND_TOKEN_TITLE()}
            body={
                <BaseView>
                    <BaseView>
                        <BaseText typographyFont="subSubTitleLight">{LL.SEND_TOKEN_SELECT_ASSET()}</BaseText>
                        <BaseSpacer height={24} />
                    </BaseView>
                    {filteredTokens.length ? (
                        <FlatList
                            data={filteredTokens}
                            renderItem={renderItem}
                            ItemSeparatorComponent={renderItemSeparator}
                        />
                    ) : (
                        <BaseText m={20}>{LL.BD_NO_TOKEN_FOUND()}</BaseText>
                    )}
                    <SendVot3WarningBottomSheet
                        ref={vot3WarningRef}
                        onConfirm={handleVot3Confirm}
                        onClose={closeVot3Warning}
                    />
                </BaseView>
            }
        />
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        tokenContainer: {
            backgroundColor: theme.colors.card,
            paddingVertical: 16,
            height: 72,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            opacity: 1,
        },
    })
