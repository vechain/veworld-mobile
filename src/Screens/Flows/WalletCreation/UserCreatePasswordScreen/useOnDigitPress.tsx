import { useEffect, useState } from "react"
import produce from "immer"

export const useOnDigitPress = () => {
    const [isPinError, setIsPinError] = useState(false)
    const [isPinRetype, setIsPinRetype] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [userPin, setUserPin] = useState("")
    const [pinMatch, setPinMatch] = useState(false)
    const [pinTypedCounter, setPinTypedCounter] = useState(0)
    const [userPinArray, setUserPinArray] = useState<Array<string | undefined>>(
        Array.from({ length: 6 }),
    )

    const onDigitPress = (digit: string) => {
        // protect for ui overflow
        if (!userPinArray.includes(undefined)) {
            return
        }
        // remove error UI when user re-enters pin
        setIsPinError(false)
        // get index of array element to remove
        const index = userPinArray.findIndex(pin => pin === undefined)

        // set user PIN (logic)
        setUserPin(prevState => {
            const _newState = prevState.concat(digit)
            // return old state if user has alrady typed PIN once
            return pinTypedCounter === 0 ? _newState : prevState
        })

        // set user PIN (UI)
        setUserPinArray(
            produce(draft => {
                if (digit === "*") {
                    const newIndex = index - 1
                    draft[newIndex] = undefined
                } else {
                    draft[index] = digit
                }

                // Pin state (UI) is loaded with 6 "undefined" values in order to have the empty pins printed on screen
                // When the first pin completion is finished from the user we setup logic here
                if (!draft.includes(undefined)) {
                    setPinTypedCounter(prev => prev + 1)
                    setPinMatch(draft.join("") === userPin)
                }
            }),
        )
    }

    // Remove pin for pin confirmation with a small delay
    useEffect(() => {
        if (pinTypedCounter === 1 && !userPinArray.includes(undefined)) {
            setTimeout(() => {
                setUserPinArray(Array.from({ length: 6 }))
            }, 300)
        }
    }, [pinTypedCounter, userPinArray])

    // set ui promt for pin confirmation
    useEffect(() => {
        if (pinTypedCounter === 1) {
            setIsPinRetype(true)
        }
    }, [pinTypedCounter])

    // set ui promt for pin error
    useEffect(() => {
        if (pinTypedCounter === 2 && !pinMatch) {
            setUserPin("")
            setPinMatch(false)
            setPinTypedCounter(0)
            setUserPinArray(Array.from({ length: 6 }))
            setIsPinRetype(false)
            setIsPinError(true)
        }
    }, [pinMatch, pinTypedCounter])

    // set success
    useEffect(() => {
        if (pinTypedCounter === 2 && pinMatch) {
            setIsSuccess(true)
        }
    }, [pinMatch, pinTypedCounter])

    return {
        onDigitPress,
        userPinArray,
        pinMatch,
        pinTypedCounter,
        isSuccess,
        isPinError,
        isPinRetype,
    }
}
