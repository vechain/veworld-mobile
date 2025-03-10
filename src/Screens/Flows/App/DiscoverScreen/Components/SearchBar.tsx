import React from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { BaseTextInput, BaseView } from "~Components"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"

type Props = {
    onTextChange: (text: string) => void
    filteredSearch?: string
}

// forwardRef<BottomSheetModalMethods, Props>(({onTextChange, filteredSearch}: Props, ref) => {})

export const SearchBar = ({ onTextChange, filteredSearch }: Props) => {
    const { LL } = useI18nContext()
    const { styles } = useThemedStyles(baseStyles)

    return (
        <BaseView w={100} flexDirection="row" px={24} py={12}>
            <BaseView flex={1}>
                <Animated.View>
                    <BaseTextInput
                        placeholder={LL.DISCOVER_SEARCH()}
                        onChangeText={onTextChange}
                        value={filteredSearch}
                        style={styles.searchBar}
                    />
                </Animated.View>
            </BaseView>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        searchBar: {
            paddingVertical: 10,
            paddingRight: 35,
            height: 40,
        },
        searchIconContainer: {
            borderColor: theme.colors.text,
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            width: 40,
            height: 40,
        },
    })
