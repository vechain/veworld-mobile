import React from 'react'
import {useI18nContext} from '~i18n'
import {BaseText, BaseView} from '~Components'

export const TestScreen = () => {
    const {LL} = useI18nContext()

    return (
        <BaseView>
            <BaseText>{LL.HI({name: 'VeChain'})}</BaseText>
        </BaseView>
    )
}
