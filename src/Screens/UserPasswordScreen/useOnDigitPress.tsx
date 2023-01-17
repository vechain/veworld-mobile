import { useEffect, useState } from "react"
import produce from "immer"

export const useOnDigitPress = () => {
    const [IsPINErorr, setIsPINErorr] = useState(false)
    const [IsPINRetype, setIsPINRetype] = useState(false)
    const [IsSuccess, setIsSuccess] = useState(false)
    const [UserPin, setUserPin] = useState("")
    const [PINMatch, setPINMatch] = useState(false)
    const [PINTypedCounter, setPINTypedCounter] = useState(0)
    const [UserPinArray, setUserPinArray] = useState<Array<string | undefined>>(
        Array.from({ length: 6 }),
    )

    const onDigitPress = (digit: string) => {
        // protect for ui overflow
        if (!UserPinArray.includes(undefined)) {
            return
        }
        // remove error UI when user re-enters pin
        setIsPINErorr(false)
        // get index of array element to remove
        const index = UserPinArray.findIndex(pin => pin === undefined)

        // set user PIN (logic)
        setUserPin(prevState => {
            const _newState = prevState.concat(digit)
            // return old state if user has alrady typed PIN once
            return PINTypedCounter === 0 ? _newState : prevState
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
                    setPINTypedCounter(prev => prev + 1)
                    setPINMatch(draft.join("") === UserPin)
                }
            }),
        )
    }

    // Remove pin for pin confirmation with a small delay
    useEffect(() => {
        if (PINTypedCounter === 1 && !UserPinArray.includes(undefined)) {
            setTimeout(() => {
                setUserPinArray(Array.from({ length: 6 }))
            }, 300)
        }
    }, [PINTypedCounter, UserPinArray])

    // set ui promt for pin confirmation
    useEffect(() => {
        if (PINTypedCounter === 1) {
            setIsPINRetype(true)
        }
    }, [PINTypedCounter])

    // set ui promt for pin error
    useEffect(() => {
        if (PINTypedCounter === 2 && !PINMatch) {
            setUserPin("")
            setPINMatch(false)
            setPINTypedCounter(0)
            setUserPinArray(Array.from({ length: 6 }))
            setIsPINRetype(false)
            setIsPINErorr(true)
        }
    }, [PINMatch, PINTypedCounter])

    // set success
    useEffect(() => {
        if (PINTypedCounter === 2 && PINMatch) {
            setIsSuccess(true)
        }
    }, [PINMatch, PINTypedCounter])

    return {
        IsPINErorr,
        IsPINRetype,
        onDigitPress,
        UserPinArray,
        PINMatch,
        PINTypedCounter,
        IsSuccess,
    }
}
