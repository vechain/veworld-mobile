import React from "react"
import { BaseSpacer, BaseText, BaseView, ChangeAccountButtonPill, SelectedNetworkViewer } from "~Components"
import { useI18nContext } from "~i18n"
import { StyleSheet } from "react-native"

type Props = {
    openSelectAccountBottomSheet: () => void
}

export const NftScreenHeader = ({ openSelectAccountBottomSheet }: Props) => {
    const { LL } = useI18nContext()

    return (
        <BaseView style={styles.header}>
            <BaseText typographyFont="subTitleSemiBold">{LL.TITLE_NFTS()}</BaseText>
            <BaseView flexDirection="row" justifyContent="space-between" alignItems="center">
                <SelectedNetworkViewer />
                <BaseSpacer width={8} />
                <ChangeAccountButtonPill action={openSelectAccountBottomSheet} />
            </BaseView>
        </BaseView>
    )
}

const styles = StyleSheet.create({
    header: {
        height: 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
})
