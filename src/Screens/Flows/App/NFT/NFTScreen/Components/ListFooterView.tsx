import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { NftSkeleton } from "./NftSkeleton"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { selectBlackListedCollections, useAppSelector } from "~Storage/Redux"
import { isEmpty } from "lodash"
import { useTheme } from "~Hooks"

type Props = {
    onGoToBlackListed?: () => void
    isLoading: boolean
    hasNext: boolean
    renderExtraSkeleton?: boolean
    showMargin?: boolean
}

export const ListFooterView = memo(
    ({ onGoToBlackListed, isLoading, hasNext, renderExtraSkeleton, showMargin = false }: Props) => {
        const { LL } = useI18nContext()
        const blackListedCollections = useAppSelector(selectBlackListedCollections)
        const theme = useTheme()

        return (
            <>
                {!isEmpty(blackListedCollections) && onGoToBlackListed && !hasNext && (
                    <BaseTouchableBox
                        containerStyle={baseStyles.marginVertical}
                        action={onGoToBlackListed}
                        children={
                            <>
                                <BaseView
                                    w={100}
                                    h={100}
                                    flexDirection="row"
                                    justifyContent="center"
                                    alignItems="center">
                                    <BaseText typographyFont="bodyBold">{LL.HIDDEN_COLLECTIONS()}</BaseText>
                                    <BaseIcon name="chevron-down" color={theme.colors.text} />
                                </BaseView>
                            </>
                        }
                    />
                )}

                {isLoading && (
                    <NftSkeleton
                        numberOfChildren={NFT_PAGE_SIZE}
                        renderExtra={renderExtraSkeleton}
                        showMargin={showMargin}
                    />
                )}
            </>
        )
    },
)

const baseStyles = StyleSheet.create({
    marginVertical: {
        marginVertical: 18,
    },
})
