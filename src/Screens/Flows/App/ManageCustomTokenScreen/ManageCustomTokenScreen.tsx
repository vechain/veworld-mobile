import React, { useState } from "react"
import { useBottomSheetModal, useTheme } from "~Common"
import {
    BackButtonHeader,
    BaseIcon,
    BaseSafeArea,
    BaseSpacer,
    BaseText,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"
import { FungibleToken } from "~Model"
import { AddCustomTokenBottomSheet } from "./BottomSheets"

export const ManageCustomTokenScreen = () => {
    const theme = useTheme()
    const { LL } = useI18nContext()
    const [newCustomToken, setNewCustomToken] = useState<FungibleToken>()

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
            <AddCustomTokenBottomSheet
                ref={addCustomTokenSheetRef}
                onClose={closeAddCustomTokenSheet}
                setNewCustomToken={setNewCustomToken}
            />
        </BaseSafeArea>
    )
}
