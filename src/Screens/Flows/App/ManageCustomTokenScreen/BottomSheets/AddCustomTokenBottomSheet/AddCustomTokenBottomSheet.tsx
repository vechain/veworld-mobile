import React, { useCallback, useEffect, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseBottomSheet,
    BaseView,
    useThor,
    BaseButton,
    CustomTokenCard,
    BaseBottomSheetTextInput,
    ScanBottomSheet,
} from "~Components"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import {
    addOrUpdateCustomToken,
    addTokenBalance,
    selectAccountCustomTokens,
    selectFungibleTokens,
    selectNonVechainTokensWithBalances,
    selectSelectedAccount,
    selectSelectedNetwork,
    updateAccountBalances,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { FungibleToken } from "~Model"
import { useBottomSheetModal } from "~Hooks"
import { debug, error, info, AddressUtils } from "~Utils"
import { getCustomTokenInfo } from "../../Utils"
import { ScanTarget } from "~Constants"

type Props = {
    tokenAddress?: string
    onClose: () => void
}

export const AddCustomTokenBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ tokenAddress, onClose }, ref) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const thorClient = useThor()
    const [newCustomToken, setNewCustomToken] = useState<FungibleToken>()
    const [value, setValue] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    const officialTokens = useAppSelector(selectFungibleTokens)
    const customTokens = useAppSelector(selectAccountCustomTokens)
    const account = useAppSelector(selectSelectedAccount)
    const tokenBalances = useAppSelector(selectNonVechainTokensWithBalances)
    // const snapPoints = [visible ? "80%" : "35%"]
    const snapPoints = ["35%"]

    const {
        ref: scanAddressSheetRef,
        onOpen: openScanAddressSheet,
        onClose: closeScanAddressSheetRef,
    } = useBottomSheetModal()

    const handleValueChange = useCallback(
        async (addressRaw: string) => {
            const address = addressRaw.toLowerCase()
            setErrorMessage("")
            setValue(address)
            if (AddressUtils.isValid(address)) {
                debug("Valid address")
                try {
                    // check if it is an official token
                    if (
                        officialTokens
                            .map(token => token.address.toLowerCase())
                            .includes(address)
                    ) {
                        setErrorMessage(
                            LL.MANAGE_CUSTOM_TOKENS_ERROR_OFFICIAL_TOKEN(),
                        )
                        return
                    }
                    // check if already present
                    if (
                        customTokens
                            .map(token => token.address.toLowerCase())
                            .includes(address)
                    ) {
                        setErrorMessage(
                            LL.MANAGE_CUSTOM_TOKENS_ERROR_ALREADY_PRESENT(),
                        )
                        return
                    }
                    const newToken = await getCustomTokenInfo({
                        network,
                        tokenAddress: address,
                        thorClient,
                    })
                    if (newToken) {
                        info(
                            "fetched custom token info: ",
                            JSON.stringify(newToken),
                        )
                        setNewCustomToken(newToken)
                    } else {
                        setErrorMessage(
                            LL.MANAGE_CUSTOM_TOKENS_ERROR_WRONG_ADDRESS(),
                        )
                    }
                } catch (e) {
                    error(e)
                    setErrorMessage(
                        LL.MANAGE_CUSTOM_TOKENS_ERROR_WRONG_ADDRESS(),
                    )
                }
            } else {
                debug("Address not valid yet")
            }
        },
        [
            LL,
            customTokens,
            network,
            officialTokens,
            setNewCustomToken,
            thorClient,
        ],
    )

    const handleOnDismissModal = () => {
        //don't reset if we are adding a token from SwapCard screen
        if (tokenAddress) return
        setErrorMessage("")
        setValue("")
        setNewCustomToken(undefined)
    }

    const handleAddCustomToken = () => {
        dispatch(addOrUpdateCustomToken(newCustomToken!!))
        dispatch(
            addTokenBalance({
                balance: "0",
                accountAddress: account.address,
                tokenAddress: newCustomToken!!.address,
                timeUpdated: new Date().toISOString(),
                position: tokenBalances.length,
                genesisId: network.genesis.id,
            }),
        )
        dispatch(updateAccountBalances(thorClient, account.address))
        onClose()
    }

    // if we are adding a token from SwapCard screen, we need to set the token address
    useEffect(() => {
        if (tokenAddress) handleValueChange(tokenAddress)
    }, [handleValueChange, tokenAddress])

    return (
        <>
            <BaseBottomSheet
                snapPoints={snapPoints}
                ref={ref}
                contentStyle={styles.contentStyle}
                footerStyle={styles.footerStyle}
                onDismiss={handleOnDismissModal}>
                <BaseText typographyFont="subTitleBold">
                    {LL.MANAGE_CUSTOM_TOKENS_ADD_TOKEN_TITLE()}
                </BaseText>
                <BaseSpacer height={24} />
                {newCustomToken ? (
                    <CustomTokenCard token={newCustomToken} />
                ) : (
                    <BaseView flexDirection="row" w={100}>
                        <BaseBottomSheetTextInput
                            containerStyle={styles.inputContainer}
                            value={value}
                            setValue={handleValueChange}
                            placeholder={LL.MANAGE_CUSTOM_TOKENS_ENTER_AN_ADDRESS()}
                            errorMessage={errorMessage}
                            testID="AddCustomTokenBottomSheet-TextInput-Address"
                            rightIcon={value ? "close" : "qrcode-scan"}
                            onIconPress={
                                !value
                                    ? openScanAddressSheet
                                    : () => setValue("")
                            }
                        />
                    </BaseView>
                )}
                <BaseSpacer height={24} />
                <BaseButton
                    haptics="Medium"
                    w={100}
                    title={LL.COMMON_BTN_ADD()}
                    action={handleAddCustomToken}
                    disabled={!newCustomToken}
                />
            </BaseBottomSheet>
            <ScanBottomSheet
                ref={scanAddressSheetRef}
                onClose={closeScanAddressSheetRef}
                onScan={handleValueChange}
                target={ScanTarget.ADDRESS}
            />
        </>
    )
})

const styles = StyleSheet.create({
    contentStyle: { flex: 0.85 },
    footerStyle: { flex: 0.15, paddingBottom: 24 },
    icon: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    inputContainer: {
        width: "100%",
    },
})
