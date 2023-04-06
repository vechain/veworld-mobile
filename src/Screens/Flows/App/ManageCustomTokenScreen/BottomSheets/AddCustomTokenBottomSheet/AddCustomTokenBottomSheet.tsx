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
} from "~Components"
import { StyleSheet } from "react-native"
import { useI18nContext } from "~i18n"
import {
    selectSelectedNetwork,
    useAppDispatch,
    useAppSelector,
} from "~Storage/Redux"
import { FungibleToken } from "~Model"
import { AddressUtils, debug, error, info, useTheme, warn } from "~Common"
import { getCustomTokenInfo } from "../../Utils"

type Props = {
    onClose: () => void
    setNewCustomToken: Dispatch<React.SetStateAction<FungibleToken | undefined>>
}

export const AddCustomTokenBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ onClose, setNewCustomToken }, ref) => {
    const { LL } = useI18nContext()
    const dispatch = useAppDispatch()
    const network = useAppSelector(selectSelectedNetwork)
    const thorClient = useThor()
    const snapPoints = useMemo(() => ["30%"], [])
    const [value, setValue] = useState("")
    const theme = useTheme()
    const [isError, setIsError] = useState(false)

    const handleValueChange = async (newValue: string) => {
        setIsError(false)
        setValue(newValue)
        if (AddressUtils.isValid(newValue)) {
            debug("Valid address")
            try {
                const newToken = await getCustomTokenInfo({
                    network,
                    tokenAddress: newValue,
                    thorClient,
                })
                info("fetched custom token info: ", JSON.stringify(newToken))
                setNewCustomToken(newToken)
            } catch (e) {
                error(e)
                setIsError(true)
            }
        } else {
            debug("Address not valid yet")
        }
    }

    const onOpenCamera = () => {}
    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={ref}
            contentStyle={styles.contentStyle}
            footerStyle={styles.footerStyle}>
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
                    errorMessage={
                        isError
                            ? LL.MANAGE_CUSTOM_TOKENS_WRONG_ADDRESS()
                            : undefined
                    }
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
