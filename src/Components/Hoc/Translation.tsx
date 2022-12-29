import React from 'react'
import {TypesafeI18n} from '~i18n'
import '../../Common/polyfill'

type Props = {
    children: React.ReactNode
}

export const Translation = ({children}: Props) => {
    // todo -> get locale changes from Appstate to dynamically update locale prop
    return <TypesafeI18n locale="en">{children}</TypesafeI18n>
}
