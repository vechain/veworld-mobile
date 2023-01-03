import React, {useRef, useState, useEffect} from 'react'
import {AppState as _Appstate} from 'react-native'

export const AppState = () => {
    const appState = useRef(_Appstate.currentState)
    const [appStateVisible, setAppStateVisible] = useState(appState.current)

    useEffect(() => {
        const subscription = _Appstate.addEventListener(
            'change',
            nextAppState => {
                if (
                    appState.current.match(/inactive|background/) &&
                    nextAppState === 'active'
                ) {
                    console.log('App has come to the foreground!')
                }

                appState.current = nextAppState
                setAppStateVisible(appState.current)
                console.log('AppState', appState.current)
            },
        )

        return () => {
            subscription.remove()
        }
    }, [])

    return <></>
}
