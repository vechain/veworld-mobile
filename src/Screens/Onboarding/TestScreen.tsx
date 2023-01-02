import React from 'react'
import {useI18nContext} from '~i18n'
import {VWText, VWView} from '~Components'

export const TestScreen = () => {
    const {LL} = useI18nContext()

    return (
        <VWView>
            <VWText>{LL.HI({name: 'VeChain'})}</VWText>
        </VWView>
    )
}
