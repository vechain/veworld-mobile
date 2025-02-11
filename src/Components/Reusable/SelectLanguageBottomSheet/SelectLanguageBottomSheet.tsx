import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseSpacer, BaseText, BaseTouchableBox, BaseView, BaseBottomSheet } from "~Components"
import { Locales, useI18nContext } from "~i18n"
import { useScrollableList, useTheme } from "~Hooks"
import { StyleSheet } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { languages } from "~Model"

type Props = {
    selectedLanguage: Locales
    handleSelectLanguage: (language: Locales) => void
}

export const SelectLanguageBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ selectedLanguage, handleSelectLanguage }, ref) => {
        const { LL } = useI18nContext()

        const snapPoints = useMemo(() => ["50%", "75%", "90%"], [])

        const theme = useTheme()

        const [snapIndex, setSnapIndex] = useState<number>(0)

        const { isListScrollable, viewabilityConfig, onViewableItemsChanged } = useScrollableList(
            languages,
            snapIndex,
            snapPoints.length,
        )

        const languagesListSeparator = useCallback(() => <BaseSpacer height={16} />, [])

        const handleSheetChanges = useCallback((index: number) => {
            setSnapIndex(index)
        }, [])

        return (
            <BaseBottomSheet snapPoints={snapPoints} ref={ref} onChange={handleSheetChanges}>
                <BaseView flexDirection="row" justifyContent="space-between" w={100} alignItems="center">
                    <BaseText typographyFont="subTitle">{LL.SB_SELECT_LANGUAGE()}</BaseText>
                </BaseView>
                <BaseSpacer height={16} />
                <BaseView flexDirection="row" style={baseStyles.list}>
                    <BottomSheetFlatList
                        data={languages}
                        keyExtractor={({ code }) => code}
                        ItemSeparatorComponent={languagesListSeparator}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        renderItem={({ item }) => {
                            return (
                                <BaseTouchableBox
                                    haptics="Light"
                                    action={() => {
                                        handleSelectLanguage(item.code as Locales)
                                    }}
                                    containerStyle={baseStyles.languageContainer}
                                    innerContainerStyle={{
                                        backgroundColor:
                                            item.code === selectedLanguage ? theme.colors.primary : theme.colors.card,
                                    }}>
                                    <BaseText
                                        color={
                                            item.code === selectedLanguage
                                                ? theme.colors.textReversed
                                                : theme.colors.text
                                        }>
                                        {item.name}
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
    },
)

const baseStyles = StyleSheet.create({
    languageContainer: {
        paddingHorizontal: 10,
    },
    list: {
        height: "95%",
    },
})
