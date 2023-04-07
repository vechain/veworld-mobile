import React, { Dispatch, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseBottomSheet,
    BaseTextInput,
    BaseView,
    BaseIcon,
    useThor,
    BaseButton,
    CustomTokenCard,
} from "~Components"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import {
    addCustomToken,
    selectCustomTokens,
    selectFungibleTokens,
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { FungibleToken } from "~Model"
import { AddressUtils, debug, error, info, useTheme } from "~Common"
import { getCustomTokenInfo } from "../../Utils"

type Props = {
    onClose: () => void
    setNewCustomToken: Dispatch<React.SetStateAction<FungibleToken | undefined>>
    newCustomToken?: FungibleToken
}

export const AddCustomTokenBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, setNewCustomToken, newCustomToken }, ref) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const thorClient = useThor()
    const snapPoints = useMemo(() => ["35%"], [])
    const [value, setValue] = useState("")
    const theme = useTheme()
    const [errorMessage, setErrorMessage] = useState("")
    const officialTokens = useAppSelector(selectFungibleTokens)
    const customTokens = useAppSelector(selectCustomTokens)

    const handleValueChange = async (address: string) => {
        setErrorMessage("")
        setValue(address)
        if (AddressUtils.isValid(address)) {
            debug("Valid address")
            try {
                // check if it is an official token
                if (
                    officialTokens.map(token => token.address).includes(address)
                ) {
                    setErrorMessage(
                        LL.MANAGE_CUSTOM_TOKENS_ERROR_OFFICIAL_TOKEN(),
                    )
                    return
                }
                // check if already present
                if (
                    customTokens.map(token => token.address).includes(address)
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
                info("fetched custom token info: ", JSON.stringify(newToken))
                setNewCustomToken(newToken)
            } catch (e) {
                error(e)
                setErrorMessage(LL.MANAGE_CUSTOM_TOKENS_ERROR_WRONG_ADDRESS())
            }
        } else {
            debug("Address not valid yet")
        }
    }

    const handleOnDismissModal = () => {
        setErrorMessage("")
        setValue("")
        setNewCustomToken(undefined)
    }

    const handleAddCustomToken = () => {
        dispatch(addCustomToken(newCustomToken!!))
        onClose()
    }

    const onOpenCamera = () => {}

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={ref}
            contentStyle={styles.contentStyle}
            footerStyle={styles.footerStyle}
            onDismiss={handleOnDismissModal}>
            {newCustomToken ? (
                <BaseView
                    justifyContent="space-between"
                    alignItems="stretch"
                    w="100%"
                    h="100%">
                    <BaseView>
                        <BaseText typographyFont="subTitleBold">
                            {LL.MANAGE_CUSTOM_TOKENS_CONFIRM_TOKEN_TITLE()}
                        </BaseText>
                        <BaseSpacer height={24} />
                        <CustomTokenCard token={newCustomToken} />
                    </BaseView>
                    <BaseButton
                        title={LL.COMMON_BTN_ADD()}
                        action={handleAddCustomToken}
                    />
                </BaseView>
            ) : (
                <>
                    <BaseText typographyFont="subTitleBold">
                        {LL.MANAGE_CUSTOM_TOKENS_ADD_TOKEN_TITLE()}
                    </BaseText>
                    <BaseSpacer height={24} />
                    <BaseView flexDirection="row" w="100%">
                        <BaseTextInput
                            containerStyle={styles.inputContainer}
                            value={value}
                            setValue={handleValueChange}
                            placeholder={LL.MANAGE_CUSTOM_TOKENS_ENTER_AN_ADDRESS()}
                            errorMessage={errorMessage}
                        />
                        {!value && (
                            <BaseIcon
                                name={"flip-horizontal"}
                                size={24}
                                color={theme.colors.primary}
                                action={onOpenCamera}
                                style={styles.icon}
                            />
                        )}
                    </BaseView>
                </>
            )}
        </BaseBottomSheet>
    )
})

const styles = StyleSheet.create({
    contentStyle: { flex: 0.85 },
    footerStyle: { flex: 0.15, paddingBottom: 24 },
    icon: {
        position: "absolute",
        right: 10,
    },
    inputContainer: {
        width: "100%",
    },
})
