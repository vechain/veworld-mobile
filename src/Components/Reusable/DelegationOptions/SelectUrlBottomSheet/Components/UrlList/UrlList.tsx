import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import React from "react"
import { useTheme } from "~Hooks"
import { BaseCard, BaseIcon, BaseSpacer, BaseText, BaseView } from "~Components"
import { selectDelegationUrls, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"

type Props = {
    setAddUrlMode: (s: boolean) => void
    setSelectedDelegationUrl: (s: string) => void
    selectedDelegationUrl?: string
    onCloseBottomSheet: () => void
}
const ItemSeparatorComponent = () => <BaseSpacer height={16} />

export const UrlList = ({
    setAddUrlMode,
    setSelectedDelegationUrl,
    selectedDelegationUrl,
    onCloseBottomSheet,
}: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()
    const delegationUrls = useAppSelector(selectDelegationUrls)

    const handleClickUrl = (url: string) => () => {
        setSelectedDelegationUrl(url)
        onCloseBottomSheet()
    }

    return (
        <BaseView h={100}>
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
                w={100}>
                <BaseText typographyFont="subTitleBold">
                    {LL.SEND_DELEGATION_SELECT_URL()}
                </BaseText>
                <BaseIcon
                    name={"plus"}
                    bg={theme.colors.secondary}
                    action={() => setAddUrlMode(true)}
                    testID="UrlList_addUrlButton"
                />
            </BaseView>
            <BaseSpacer height={16} />
            <BottomSheetFlatList
                data={delegationUrls}
                keyExtractor={(url: string) => url}
                renderItem={({ item }) => (
                    <BaseCard
                        selected={item === selectedDelegationUrl}
                        onPress={handleClickUrl(item)}>
                        <BaseText typographyFont="bodyBold" w={100} py={8}>
                            {item}
                        </BaseText>
                    </BaseCard>
                )}
                ItemSeparatorComponent={ItemSeparatorComponent}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
            />
        </BaseView>
    )
}
