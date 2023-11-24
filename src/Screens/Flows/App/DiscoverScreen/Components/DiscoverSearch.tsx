import { DiscoveryDApp } from "~Constants"
import React from "react"
import { BaseTextInput, BaseView } from "~Components"
import { useI18nContext } from "~i18n"
import { NativeSyntheticEvent, TextInputChangeEventData } from "react-native"

type Props = {
    dapps: DiscoveryDApp[]
    onFilteredDApps: (dapps: DiscoveryDApp[]) => void
}

export const DiscoverSearch: React.FC<Props> = ({ dapps, onFilteredDApps }) => {
    const { LL } = useI18nContext()

    const cleanString = (str: string) => {
        return str.toLowerCase().replaceAll(" ", "")
    }

    const onTextChange = (event: NativeSyntheticEvent<TextInputChangeEventData>) => {
        const { text } = event.nativeEvent

        const filteredDApps = dapps.filter(dapp => {
            return (
                cleanString(dapp.name).includes(cleanString(text)) || cleanString(dapp.href).includes(cleanString(text))
            )
        })

        onFilteredDApps(filteredDApps)
    }

    return (
        <BaseView>
            <BaseTextInput placeholder={LL.DISCOVER_SEARCH()} onChange={onTextChange} />
        </BaseView>
    )
}
