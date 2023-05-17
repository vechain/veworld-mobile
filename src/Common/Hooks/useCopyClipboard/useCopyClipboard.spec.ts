import { act, renderHook } from "@testing-library/react-hooks"
import { useCopyClipboard } from "./useCopyClipboard"
import * as Clipboard from "expo-clipboard"
import { showInfoToast } from "~Components"
import * as logger from "~Common/Logger/Logger"

jest.mock("expo-clipboard", () => ({
    setStringAsync: jest.fn(() => Promise.resolve()),
}))

jest.mock("~Components", () => ({
    showInfoToast: jest.fn(),
}))

jest.mock("~i18n", () => ({
    useI18nContext: jest.fn(() => ({
        LL: {
            SUCCESS_GENERIC: () => "Success",
            NOTIFICATION_COPIED_CLIPBOARD: ({ name }: { name: string }) =>
                `${name} copied to clipboard`,
        },
    })),
}))

describe("useCopyClipboard", () => {
    it("should copy to clipboard and show toast on success", async () => {
        const text = "text to copy"
        const labelName = "label name"

        const { result } = renderHook(() => useCopyClipboard())

        await act(async () => {
            result.current.onCopyToClipboard(text, labelName)
        })

        expect(Clipboard.setStringAsync).toHaveBeenCalledWith(text)
        expect(showInfoToast).toHaveBeenCalled()
    })

    it("should handle error when copying to clipboard fails", async () => {
        const debugSpy = jest
            .spyOn(logger, "debug")
            .mockImplementation(() => {})

        const error = new Error("Failed to copy")

        ;(Clipboard.setStringAsync as jest.Mock).mockRejectedValueOnce(error)

        const { result } = renderHook(() => useCopyClipboard())

        await act(async () => {
            result.current.onCopyToClipboard("text", "label")
        })

        expect(debugSpy).toHaveBeenCalledTimes(1)
    })
})
