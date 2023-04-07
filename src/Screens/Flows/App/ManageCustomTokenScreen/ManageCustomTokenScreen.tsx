import React, { useState } from "react"
import { useBottomSheetModal, useTheme } from "~Common"
import {
    BackButtonHeader,
    BaseIcon,
    BaseSafeArea,
    BaseScrollView,
    BaseSpacer,
    BaseText,
    BaseView,
    CustomTokenCard,
} from "~Components"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import { AddCustomTokenBottomSheet } from "./BottomSheets"
import { StyleSheet } from "react-native"
import { selectCustomTokens, useAppSelector } from "~Storage/Redux"

export const ManageCustomTokenScreen = () => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const [newCustomToken, setNewCustomToken] = useState<FungibleToken>()
    const customTokens = useAppSelector(selectCustomTokens)

    const {
        ref: addCustomTokenSheetRef,
        onOpen: openAddCustomTokenSheet,
        onClose: closeAddCustomTokenSheet,
    } = useBottomSheetModal()

    return (
        <BaseSafeArea grow={1}>
            <BackButtonHeader />
            <BaseView flexDirection="row" mx={20}>
                <BaseText typographyFont="subTitleBold">
                    {LL.MANAGE_TOKEN_MANAGE_CUSTOM()}
                </BaseText>
                <BaseIcon
                    name={"plus"}
                    size={32}
                    bg={theme.colors.secondary}
                    action={openAddCustomTokenSheet}
                />
            </BaseView>
            <BaseSpacer height={24} />
            <BaseScrollView
                containerStyle={styles.scrollViewContainer}
                style={styles.scrollView}>
                {customTokens.map(token => (
                    <CustomTokenCard
                        token={token}
                        key={token.address}
                        containerStyle={styles.card}
                    />
                ))}
            </BaseScrollView>
            <AddCustomTokenBottomSheet
                ref={addCustomTokenSheetRef}
                onClose={closeAddCustomTokenSheet}
                setNewCustomToken={setNewCustomToken}
                newCustomToken={newCustomToken}
            />
        </BaseSafeArea>
    )
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flex: 1,
        width: "100%",
        marginBottom: 60,
    },
    scrollView: {
        paddingHorizontal: 20,
        width: "100%",
    },
    card: {
        marginVertical: 7,
    },
})
