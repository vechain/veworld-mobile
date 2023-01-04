import React from 'react'
import {Translation, BaseStatusBar} from '~Components'
import {SwitchStack} from '~Navigation'

const App = () => {
    return (
        <Translation>
            <BaseStatusBar />
            <SwitchStack />
        </Translation>
    )
}

export default App
