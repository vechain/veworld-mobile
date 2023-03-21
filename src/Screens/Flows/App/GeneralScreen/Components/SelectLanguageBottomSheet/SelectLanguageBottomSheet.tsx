import React, { useCallback, useMemo } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import BaseBottomSheet from "~Components/Base/BaseBottomSheet"
import { BaseSpacer, BaseText, BaseTouchableBox, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { useSupportedLanguages, useTheme } from "~Common"
import { FlashList } from "@shopify/flash-list"
import { StyleSheet } from "react-native"

type Props = {
    selectedLanguage: string
    onClose: () => void
    handleSelectLanguage: (language: string) => void
}

export const SelectLanguageBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ selectedLanguage, handleSelectLanguage }, ref) => {
    const { LL } = useI18nContext()

    const snapPoints = useMemo(() => ["50%", "75%", "90%"], [])

    const languagesListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    // Retrieve the list of supported languages in human readable format (e.g. "English", "Spanish"...)
    const supportedLanguages = useSupportedLanguages()

    const theme = useTheme()

    return (
        <BaseBottomSheet snapPoints={snapPoints} ref={ref}>
            <BaseView
                orientation="row"
                justify="space-between"
                w={100}
                align="center">
                <BaseText typographyFont="subTitle">
                    {LL.SB_SELECT_LANGUAGE()}
                </BaseText>
            </BaseView>
            <BaseSpacer height={16} />
            <BaseView h={100} w={100}>
                <FlashList
                    data={supportedLanguages}
                    keyExtractor={lang => lang}
                    ItemSeparatorComponent={languagesListSeparator}
                    renderItem={({ item }) => {
                        return (
                            <BaseTouchableBox
                                action={() => {
                                    handleSelectLanguage(item)
                                }}
                                containerStyle={baseStyles.languageContainer}
                                innerContainerStyle={{
                                    backgroundColor:
                                        item === selectedLanguage
                                            ? theme.colors.primary
                                            : theme.colors.card,
                                }}>
                                <BaseText
                                    color={
                                        item === selectedLanguage
                                            ? theme.colors.textReversed
                                            : theme.colors.text
                                    }>
                                    {item}
                                </BaseText>
                            </BaseTouchableBox>
                        )
                    }}
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    estimatedItemSize={supportedLanguages.length}
                    estimatedListSize={{
                        height: 184,
                        width:
                            152 * supportedLanguages.length +
                            (supportedLanguages.length - 1) * 16,
                    }}
                />
            </BaseView>
            <BaseSpacer height={16} />
            <BaseView h={100} w={100} />
        </BaseBottomSheet>
    )
})

const baseStyles = StyleSheet.create({
    languageContainer: {
        paddingHorizontal: 10,
    },
})
