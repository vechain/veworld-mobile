import { BottomSheetFlatList } from "@gorhom/bottom-sheet"
import { default as React, ReactNode, useCallback, useState } from "react"
import { NativeSyntheticEvent, StyleSheet, TextInputChangeEventData } from "react-native"
import { BaseIcon, BaseRadioButton, BaseSpacer, BaseTextInput } from "~Components/Base"
import { ColorThemeType } from "~Constants"
import { FlatListScrollPropsType, useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Option, OptionText } from "./Option"

type Props = {
    selectedDelegationUrl?: string | undefined
    children: (args: { onCancel: () => void; selectedUrl: string | undefined }) => ReactNode
    flatListProps: FlatListScrollPropsType
    delegationUrls: string[]
}

const ItemSeparatorComponent = () => <BaseSpacer height={8} />

export const UrlOption = ({ selectedDelegationUrl, children, flatListProps, delegationUrls }: Props) => {
    const { LL } = useI18nContext()
    const { styles, theme } = useThemedStyles(baseStyles)

    const [url, setUrl] = useState(selectedDelegationUrl)
    const [selectedUrl, setSelectedUrl] = useState<string | undefined>(undefined)

    const onCancel = useCallback(() => {
        setUrl(selectedDelegationUrl)
    }, [selectedDelegationUrl])

    const onChange = useCallback((e: NativeSyntheticEvent<TextInputChangeEventData>) => {
        setSelectedUrl(undefined)
        setUrl(e.nativeEvent.text)
    }, [])

    const onSelectedUrlChange = useCallback((id: string) => {
        setSelectedUrl(id)
        setUrl("")
    }, [])

    return (
        <>
            <Option label={LL.DELEGATE_URL()} style={styles.list}>
                <BaseTextInput
                    value={url}
                    onChange={onChange}
                    leftIcon={<BaseIcon haptics="Light" name={"icon-link"} size={20} color={theme.colors.textLight} />}
                    leftIconStyle={styles.linkIconStyle}
                    leftIconAdornment={false}
                    placeholder={LL.DELEGATE_URL_PLACEHOLDER()}
                />
                {delegationUrls.length > 0 && (
                    <>
                        <OptionText>{LL.DELEGATE_URL_SELECT()}</OptionText>
                        <BottomSheetFlatList
                            data={delegationUrls.slice(0, 3)}
                            keyExtractor={delUrl => delUrl}
                            ItemSeparatorComponent={ItemSeparatorComponent}
                            renderItem={({ item }) => {
                                return (
                                    <BaseRadioButton
                                        id={item}
                                        label={item}
                                        isSelected={selectedUrl === item}
                                        onPress={onSelectedUrlChange}
                                        numberOfLines={1}
                                    />
                                )
                            }}
                            style={styles.list}
                            {...flatListProps}
                        />
                    </>
                )}
            </Option>
            {children({ onCancel, selectedUrl: selectedUrl ? selectedUrl : url })}
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        list: {
            flex: 1,
        },
        linkIconStyle: {
            backgroundColor: theme.colors.neutralVariant.background,
            borderRightWidth: 1,
            borderRightColor: theme.colors.neutralVariant.border,
            borderTopLeftRadius: 7,
            borderBottomLeftRadius: 7,
            padding: 14,
        },
    })
