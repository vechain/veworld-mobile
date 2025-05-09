import { default as React, ReactNode, useCallback, useState } from "react"
import { NativeSyntheticEvent, StyleSheet, TextInputChangeEventData } from "react-native"
import { BaseIcon, BaseRadioButton, BaseTextInput, BaseView } from "~Components/Base"
import { COLORS, ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Option, OptionText } from "./Option"

type Props = {
    selectedDelegationUrl?: string | undefined
    children: (args: { onCancel: () => void; selectedUrl: string | undefined }) => ReactNode
    delegationUrls: string[]
}

export const UrlOption = ({ selectedDelegationUrl, children, delegationUrls }: Props) => {
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
            <Option label={LL.DELEGATE_URL()}>
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
                        <BaseView flexDirection="column" gap={8}>
                            {delegationUrls.slice(0, 3).map(delUrl => (
                                <BaseRadioButton
                                    id={delUrl}
                                    label={delUrl.slice(`${new URL(delUrl).protocol}//`.length)}
                                    isSelected={selectedUrl === delUrl}
                                    onPress={onSelectedUrlChange}
                                    numberOfLines={1}
                                    key={delUrl}
                                    rootStyle={styles.radio}
                                    ellipsizeMode="middle"
                                />
                            ))}
                        </BaseView>
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
            backgroundColor: theme.isDark ? COLORS.PURPLE : theme.colors.neutralVariant.background,
            borderRightWidth: 1,
            borderRightColor: theme.isDark ? COLORS.DARK_PURPLE_DISABLED : theme.colors.neutralVariant.border,
            borderTopLeftRadius: 7,
            borderBottomLeftRadius: 7,
            padding: 14,
        },
        radio: {
            backgroundColor: theme.isDark ? COLORS.PURPLE : theme.colors.radioButton.backgroudColor,
        },
    })
