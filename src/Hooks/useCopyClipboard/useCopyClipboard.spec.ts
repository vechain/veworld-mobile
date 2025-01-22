import { act, renderHook } from "@testing-library/react-hooks"
import * as Clipboard from "expo-clipboard"
import { showSuccessToast } from "~Components"
import * as logger from "~Utils/Logger/Logger"
import { useCopyClipboard } from "./useCopyClipboard"

jest.mock("expo-clipboard", () => ({
    setStringAsync: jest.fn(() => Promise.resolve()),
}))

jest.mock("~Components", () => ({
    showSuccessToast: jest.fn(),
}))

jest.mock("~i18n", () => ({
    useI18nContext: jest.fn(() => ({
        LL: {
            SUCCESS_GENERIC: () => "Success",
            NOTIFICATION_COPIED_CLIPBOARD: ({ name }: { name: string }) => `${name} copied to clipboard`,
        },
    })),
}))

describe("useCopyClipboard", () => {
    it("should copy to clipboard and show toast on success", async () => {
        const text = "text to copy"
        const labelName = "label name"

        const { result } = renderHook(() => useCopyClipboard())

        await act(async () => {
            result.current.onCopyToClipboard(text.toUpperCase(), labelName)
        })

        expect(Clipboard.setStringAsync).toHaveBeenCalledWith(text.toUpperCase())
        expect(showSuccessToast).toHaveBeenCalled()
    })

    it("should handle error when copying to clipboard fails", async () => {
        const debugSpy = jest.spyOn(logger, "debug").mockImplementation(() => {})

        const error = new Error("Failed to copy")

        ;(Clipboard.setStringAsync as jest.Mock).mockRejectedValueOnce(error)

        const { result } = renderHook(() => useCopyClipboard())

        await act(async () => {
            result.current.onCopyToClipboard("text", "label")
        })

        expect(debugSpy).toHaveBeenCalledTimes(1)
    })

    it("should copy text in uppercase", async () => {
        const text = "0x740144c427beac6daab4b35ae1b10d3e3ca524b0"
        const labelName = "address"

        const { result } = renderHook(() => useCopyClipboard())

        await act(async () => {
            result.current.onCopyToClipboard(text, labelName)
        })

        expect(Clipboard.setStringAsync).toHaveBeenCalledWith(text.toUpperCase())
    })
})
