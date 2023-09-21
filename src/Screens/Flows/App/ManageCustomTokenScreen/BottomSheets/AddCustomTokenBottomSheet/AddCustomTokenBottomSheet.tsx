import React, { useCallback, useEffect, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseBottomSheet,
    BaseBottomSheetTextInput,
    BaseButton,
    BaseSpacer,
    BaseText,
    BaseView,
    CustomTokenCard,
    useThor,
} from "~Components"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import {
    addOrUpdateCustomTokens,
    addTokenBalance,
    selectVisibleCustomTokens,
    selectOfficialTokens,
    selectSelectedAccount,
    selectSelectedNetwork,
    updateAccountBalances,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { FungibleToken } from "~Model"
import { useAnalyticTracking, useCameraBottomSheet } from "~Hooks"
import { AddressUtils, debug, warn } from "~Utils"
import { getCustomTokenInfo } from "../../Utils"
import { AnalyticsEvent, ScanTarget } from "~Constants"
import { isEmpty } from "lodash"

type Props = {
    tokenAddress?: string
    onClose: () => void
}

const snapPoints = ["40%"]

export const AddCustomTokenBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ tokenAddress, onClose }, ref) => {
    const { LL } = useI18nContext()

    const dispatch = useAppDispatch()

    const track = useAnalyticTracking()

    const network = useAppSelector(selectSelectedNetwork)

    const thorClient = useThor()

    const [newCustomToken, setNewCustomToken] = useState<FungibleToken>()

    const [value, setValue] = useState("")

    const [errorMessage, setErrorMessage] = useState("")

    const officialTokens = useAppSelector(selectOfficialTokens)

    const customTokens = useAppSelector(selectVisibleCustomTokens)

    const account = useAppSelector(selectSelectedAccount)

    // TODO: refactor token checks to a hook #1415
    const handleValueChange = useCallback(
        async (addressRaw: string) => {
            const address = addressRaw.toLowerCase()
            setErrorMessage("")
            setValue(address)
            if (AddressUtils.isValid(address)) {
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
                        if (
                            isEmpty(newToken.decimals) ||
                            isEmpty(newToken.symbol) ||
                            isEmpty(newToken.name)
                        ) {
                            setErrorMessage(
                                LL.MANAGE_CUSTOM_TOKENS_GENERIC_ERROR(),
                            )
                            return
                        }
                        setNewCustomToken(newToken)
                    } else {
                        setErrorMessage(
                            LL.MANAGE_CUSTOM_TOKENS_ERROR_WRONG_ADDRESS(),
                        )
                    }
                } catch (e) {
                    warn("handleValueChange", e)
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

    const { RenderCameraModal, handleOpenCamera } = useCameraBottomSheet({
        onScan: handleValueChange,
        target: ScanTarget.ADDRESS,
    })

    const handleOnDismissModal = () => {
        //don't reset if we are adding a token from SwapCard screen
        if (tokenAddress) return
        setErrorMessage("")
        setValue("")
        setNewCustomToken(undefined)
    }

    const handleAddCustomToken = () => {
        dispatch(
            addOrUpdateCustomTokens({
                network: network.type,
                accountAddress: account.address,
                newTokens: newCustomToken ? [newCustomToken] : [],
            }),
        )
        dispatch(
            addTokenBalance({
                network: network.type,
                accountAddress: account.address,
                balance: {
                    balance: "0",
                    tokenAddress: newCustomToken!!.address,
                    timeUpdated: new Date().toISOString(),
                    isCustomToken: true,
                    isHidden: false,
                },
            }),
        )
        dispatch(updateAccountBalances(thorClient, account.address))
        track(AnalyticsEvent.TOKENS_CUSTOM_TOKEN_ADDED)

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
                <BaseText typographyFont="subSubTitleLight" pt={12}>
                    {LL.MANAGE_CUSTOM_TOKENS_ADD_DESCRIPTION()}
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
                                    ? handleOpenCamera
                                    : () => {
                                          setValue("")
                                          setErrorMessage("")
                                      }
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
            {RenderCameraModal}
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
