import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import {
    BaseSpacer,
    BaseText,
    BaseTouchableBox,
    BaseView,
    BaseBottomSheet,
} from "~Components"
import { useI18nContext } from "~i18n"
import { useScrollableList, useTheme } from "~Hooks"
import { LANGUAGE } from "~Constants"
import { LanguageUtils } from "~Utils"
import { StyleSheet } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"

type Props = {
    selectedLanguage: LANGUAGE
    onClose: () => void
    handleSelectLanguage: (language: LANGUAGE) => void
}

export const SelectLanguageBottomSheet = React.forwardRef<
    BottomSheetModalMethods,
    Props
>(({ selectedLanguage, handleSelectLanguage }, ref) => {
    const { LL } = useI18nContext()

    const snapPoints = useMemo(() => ["50%", "75%", "90%"], [])

    // Retrieve the list of supported languages in human readable format (e.g. "English", "Spanish"...)
    const supportedLanguages = LanguageUtils.getSupportedLanguages()

    const theme = useTheme()

    const [snapIndex, setSnapIndex] = useState<number>(0)

    const { isListScrollable, viewabilityConfig, onViewableItemsChanged } =
        useScrollableList(supportedLanguages, snapIndex, snapPoints.length)

    const languagesListSeparator = useCallback(
        () => <BaseSpacer height={16} />,
        [],
    )

    const handleSheetChanges = useCallback((index: number) => {
        setSnapIndex(index)
    }, [])

    return (
        <BaseBottomSheet
            snapPoints={snapPoints}
            ref={ref}
            onChange={handleSheetChanges}>
            <BaseView
                flexDirection="row"
                justifyContent="space-between"
                w={100}
                alignItems="center">
                <BaseText typographyFont="subTitle">
                    {LL.SB_SELECT_LANGUAGE()}
                </BaseText>
            </BaseView>
            <BaseSpacer height={16} />
            <BaseView flexDirection="row" style={baseStyles.list}>
                <BottomSheetFlatList
                    data={supportedLanguages}
                    keyExtractor={lang => lang}
                    ItemSeparatorComponent={languagesListSeparator}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig}
                    renderItem={({ item }) => {
                        return (
                            <BaseTouchableBox
                                haptics="Light"
                                action={() => {
                                    handleSelectLanguage(item as LANGUAGE)
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
                    scrollEnabled={isListScrollable}
                />
            </BaseView>
        </BaseBottomSheet>
    )
})

const baseStyles = StyleSheet.create({
    languageContainer: {
        paddingHorizontal: 10,
    },
    list: {
        height: "90%",
    },
})
