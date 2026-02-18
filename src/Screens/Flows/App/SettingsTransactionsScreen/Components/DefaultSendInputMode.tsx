import React, { useCallback, useMemo } from "react"

import { BaseTabs } from "~Components/Base/BaseTabs"
import { useI18nContext } from "~i18n"
import { AmountInputMode } from "~Model"
import { selectDefaultAmountInputMode, setDefaultAmountInputMode, useAppDispatch, useAppSelector } from "~Storage/Redux"

export const DefaultSendInputMode = () => {
    const defaultAmountInputMode = useAppSelector(selectDefaultAmountInputMode)
    const dispatch = useAppDispatch()
    const { LL } = useI18nContext()

    const keys = useMemo(() => [AmountInputMode.FIAT, AmountInputMode.TOKEN], [])

    const labels = useMemo(() => [LL.BD_DEFAULT_AMOUNT_VALUE_CURRENCY(), LL.BD_DEFAULT_AMOUNT_VALUE_TOKEN()], [LL])

    const handleSelectKey = useCallback(
        (key: AmountInputMode) => {
            dispatch(setDefaultAmountInputMode(key))
        },
        [dispatch],
    )

    return (
        <BaseTabs keys={keys} labels={labels} selectedKey={defaultAmountInputMode} setSelectedKey={handleSelectKey} />
    )
}
