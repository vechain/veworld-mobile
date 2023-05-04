import { renderHook, act } from "@testing-library/react-hooks"
import { Keyboard } from "react-native"
import { useKeyboard } from "./useKeyboard"

describe("useKeyboard", () => {
    it("should set visible to true when keyboard is shown", () => {
        let keyboardListener = jest.spyOn(Keyboard, "addListener") as jest.Mock
        const { result } = renderHook(() => useKeyboard())

        expect(result.current.visible).toBe(false)
        act(() => {
            const keyboardDidShow = keyboardListener.mock.calls[0][1]
            keyboardDidShow()
        })

        expect(result.current.visible).toBe(true)
        act(() => {
            const keyboardDidHide = keyboardListener.mock.calls[1][1]
            keyboardDidHide()
        })
        expect(result.current.visible).toBe(false)
    })
})
