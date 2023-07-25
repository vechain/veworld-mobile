import React, { memo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { NftSkeleton } from "./NftSkeleton"
import { NFT_PAGE_SIZE } from "~Constants/Constants/NFT"
import { selectBlackListedCollections, useAppSelector } from "~Storage/Redux"
import { isEmpty } from "lodash"

type Props = {
    onGoToBlackListed?: () => void
    isLoading: boolean
    hasNext: boolean
    renderExtraSkeleton?: boolean
}

export const ListFooterView = memo(
    ({ onGoToBlackListed, isLoading, hasNext, renderExtraSkeleton }: Props) => {
        const { LL } = useI18nContext()
        const blackListedCollections = useAppSelector(
            selectBlackListedCollections,
        )

        return (
            <>
                {!isEmpty(blackListedCollections) &&
                    onGoToBlackListed &&
                    !hasNext && (
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
                                        <BaseText typographyFont="bodyBold">
                                            {LL.HIDDEN_COLLECTIONS()}
                                        </BaseText>
                                        <BaseIcon name="chevron-down" />
                                    </BaseView>
                                </>
                            }
                        />
                    )}

                {isLoading && (
                    <NftSkeleton
                        numberOfChildren={NFT_PAGE_SIZE}
                        renderExtra={renderExtraSkeleton}
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
