import React from "react"
import { StyleSheet } from "react-native"
import { usePlatformBottomInsets } from "~Hooks"
import { COLORS } from "~Constants"
import { BaseIcon, BaseText, BaseTouchable, BaseView } from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    onImportPress: () => void
}

export const ImportNFTView = ({ onImportPress }: Props) => {
    const { calculateBottomInsets } = usePlatformBottomInsets()
    const { LL } = useI18nContext()

    return (
        <BaseView
            style={{ marginBottom: calculateBottomInsets }}
            mx={20}
            justifyContent="center"
            alignItems="center">
            <BaseView flexDirection="row" justifyContent="space-evenly" w={100}>
                {/* TODO (Vas)
                (https://github.com/vechainfoundation/veworld-mobile/issues/759)
                add flows on BaseTouchable */}
                <BaseTouchable action={onImportPress}>
                    <BaseView
                        bg={COLORS.LIME_GREEN}
                        justifyContent="center"
                        alignItems="center"
                        borderRadius={16}
                        style={baseStyles.quickNFTActions}>
                        <BaseIcon name="arrow-down" size={38} />
                        <BaseText
                            color={COLORS.PURPLE}
                            typographyFont="bodyMedium">
                            {LL.RECEIVE_NFT()}
                        </BaseText>
                    </BaseView>
                </BaseTouchable>
            </BaseView>
            <BaseText pt={24} typographyFont="subSubTitleLight">
                {LL.DONT_SEE_NFTS_1()}
            </BaseText>
            <BaseText pt={6} typographyFont="subSubTitleLight">
                {LL.DONT_SEE_NFTS_2()}
            </BaseText>
        </BaseView>
    )
}

const baseStyles = StyleSheet.create({
    quickNFTActions: {
        width: 140,
        height: 100,
    },
})
