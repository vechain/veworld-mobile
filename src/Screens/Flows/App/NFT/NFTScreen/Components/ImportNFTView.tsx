import React from "react"
import { StyleSheet } from "react-native"
import { usePlatformBottomInsets } from "~Hooks"
import { COLORS } from "~Constants"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

export const ImportNFTView = () => {
    const { calculateBottomInsets } = usePlatformBottomInsets()
    const { LL } = useI18nContext()

    // TODO (Vas) (https://github.com/vechainfoundation/veworld-mobile/issues/759) add flows on BaseTouchable
    return (
        <BaseView
            style={{ marginBottom: calculateBottomInsets }}
            borderRadius={16}
            mx={20}
            bg={COLORS.WHITE}
            justifyContent="center"
            alignItems="center">
            <BaseText pt={16}>{LL.DONT_SEE_NFTS()}</BaseText>

            <BaseView flexDirection="row" justifyContent="space-evenly" w={100}>
                <BaseTouchable action={() => {}}>
                    <BaseView
                        my={16}
                        bg={COLORS.LIME_GREEN}
                        justifyContent="center"
                        alignItems="center"
                        borderRadius={16}
                        style={baseStyles.quickNFTActions}>
                        <BaseIcon name="tray-arrow-up" size={38} />
                        <BaseText>{LL.IMPORT_NFT()}</BaseText>
                    </BaseView>
                </BaseTouchable>

                <BaseTouchable action={() => {}}>
                    <BaseView
                        my={16}
                        bg={COLORS.LIME_GREEN}
                        justifyContent="center"
                        alignItems="center"
                        borderRadius={16}
                        style={baseStyles.quickNFTActions}>
                        <BaseIcon name="arrow-down" size={38} />
                        <BaseText>{LL.RECEIVE_NFT()}</BaseText>
                    </BaseView>
                </BaseTouchable>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    quickNFTActions: {
        width: 140,
        height: 100,
    },
})
