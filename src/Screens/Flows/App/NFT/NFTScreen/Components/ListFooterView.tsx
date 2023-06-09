import React, { memo } from "react"
import { ActivityIndicator, StyleSheet } from "react-native"
import {
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
} from "~Components"
import { useI18nContext } from "~i18n"

type Props = {
    onGoToBlackListed: () => void
    isLoading: boolean
}

// TODO -> show button only if there are blacklisted collections or NFTs
export const ListFooterView = memo(
    ({ onGoToBlackListed, isLoading }: Props) => {
        const { LL } = useI18nContext()

        return (
            <>
                <BaseSpacer height={36} />
                <BaseTouchableBox
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

                {isLoading ? (
                    <ActivityIndicator style={baseStyles.activityIndicator} />
                ) : (
                    <BaseSpacer height={18} />
                )}
            </>
        )
    },
)

const baseStyles = StyleSheet.create({
    activityIndicator: {
        marginVertical: 36,
        transform: [{ scale: 1.2 }],
    },
})
