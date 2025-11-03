import React, { useCallback, useMemo, useState } from "react"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { BaseSpacer, BaseText, BaseTouchableBox, BaseView, BaseBottomSheet } from "~Components"
import { Locales, useI18nContext } from "~i18n"
import { useScrollableList, useThemedStyles } from "~Hooks"
import { StyleSheet } from "react-native"
import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { languages } from "~Model"
import { COLORS, ColorThemeType } from "~Constants"

type Props = {
    selectedLanguage: Locales
    handleSelectLanguage: (language: Locales) => void
}

export const SelectLanguageBottomSheet = React.forwardRef<BottomSheetModalMethods, Props>(
    ({ selectedLanguage, handleSelectLanguage }, ref) => {
        const { LL } = useI18nContext()

        const snapPoints = useMemo(() => ["50%", "75%", "90%"], [])

        const { styles, theme } = useThemedStyles(baseStyles)

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
                    <BaseText typographyFont="subSubTitleSemiBold">{LL.SB_SELECT_LANGUAGE()}</BaseText>
                </BaseView>
                <BaseSpacer height={16} />
                <BaseView flexDirection="row" style={styles.list}>
                    <BottomSheetFlatList
                        data={languages}
                        keyExtractor={({ code }) => code}
                        ItemSeparatorComponent={languagesListSeparator}
                        onViewableItemsChanged={onViewableItemsChanged}
                        viewabilityConfig={viewabilityConfig}
                        renderItem={({ item }) => {
                            const isSelected = item.code === selectedLanguage

                            return (
                                <BaseTouchableBox
                                    haptics="Light"
                                    action={() => {
                                        handleSelectLanguage(item.code as Locales)
                                    }}
                                    containerStyle={styles.languageContainer}
                                    innerContainerStyle={[
                                        styles.innerContainer,
                                        isSelected && styles.selectedInnerContainer,
                                    ]}>
                                    <BaseText color={theme.colors.text} style={isSelected && styles.selectedItem}>
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

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        languageContainer: {
            paddingHorizontal: 10,
            borderRadius: 12,
        },
        innerContainer: {
            borderRadius: 12,
            backgroundColor: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        },
        selectedInnerContainer: {
            backgroundColor: theme.isDark ? COLORS.LIME_GREEN : COLORS.PURPLE,
        },
        list: {
            height: "95%",
        },
        selectedItem: {
            color: theme.isDark ? COLORS.PURPLE : COLORS.WHITE,
        },
    })
