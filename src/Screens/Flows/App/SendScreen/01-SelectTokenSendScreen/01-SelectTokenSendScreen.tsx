import { ListRenderItemInfo } from "@react-native/virtualized-lists/Lists/VirtualizedList"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import React, { useCallback } from "react"
import { FlatList, StyleSheet } from "react-native"
import { TouchableOpacity } from "react-native-gesture-handler"
import { BaseSpacer, BaseText, BaseView, Layout, SendVot3WarningBottomSheet } from "~Components"
import { B3TR, ColorThemeType, VET, VTHO } from "~Constants"
import { useBottomSheetModal, useThemedStyles, useTokenWithCompleteInfo } from "~Hooks"
import { useI18nContext } from "~i18n"
import { FungibleTokenWithBalance } from "~Model"
import { RootStackParamListHome, Routes } from "~Navigation"
import { selectNetworkVBDTokens, selectSendableTokensWithBalance, useAppSelector } from "~Storage/Redux"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import { TokenCard, VechainTokenCard } from "../../HomeScreen/Components"

type Props = NativeStackNavigationProp<RootStackParamListHome, Routes.SELECT_TOKEN_SEND>

export const SelectTokenSendScreen = () => {
    const { LL } = useI18nContext()
    const tokens = useAppSelector(selectSendableTokensWithBalance)
    const { VOT3 } = useAppSelector(state => selectNetworkVBDTokens(state))
    const { ref: vot3WarningRef, onOpen: openVot3Warning, onClose: closeVot3Warning } = useBottomSheetModal()

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
        const vot3Token = tokens.find(token => compareAddresses(VOT3.address, token.address))
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
                    return <VechainTokenCard isAnimation={false} isBalanceVisible tokenWithInfo={tokenWithInfoVTHO} />
                case VET.address.toLowerCase():
                    return (
                        <VechainTokenCard
                            isAnimation={false}
                            isBalanceVisible
                            tokenWithInfo={tokenWithInfoVET}
                            alignWithFiatBalance="center"
                        />
                    )
                case B3TR.address.toLowerCase():
                    return <VechainTokenCard isAnimation={false} isBalanceVisible tokenWithInfo={tokenWithInfoB3TR} />
                case VOT3.address.toLowerCase():
                    return <VechainTokenCard isAnimation={false} isBalanceVisible tokenWithInfo={tokenWithInfoVOT3} />
                default:
                    return <TokenCard tokenWithBalance={item} isEdit={false} isBalanceVisible />
            }
        },
        [VOT3.address, tokenWithInfoB3TR, tokenWithInfoVET, tokenWithInfoVOT3, tokenWithInfoVTHO],
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
                    {tokens.length ? (
                        <FlatList data={tokens} renderItem={renderItem} ItemSeparatorComponent={renderItemSeparator} />
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
