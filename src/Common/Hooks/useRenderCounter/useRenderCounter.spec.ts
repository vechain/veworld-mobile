import { renderHook } from "@testing-library/react-hooks"
import { useRenderCounter } from "./useRenderCounter"
import * as logger from "~Common/Logger/Logger"

describe("useRenderCounter", () => {
    it("should log the number of renders", () => {
        const debugSpy = jest
            .spyOn(logger, "debug")
            .mockImplementation(() => {})
        const { rerender } = renderHook(() => useRenderCounter("Test View"))

        expect(debugSpy).toHaveBeenCalledTimes(1)
        expect(debugSpy).toHaveBeenCalledWith(
            "Test View has rendered : 0 times.",
        )

        rerender()
        expect(debugSpy).toHaveBeenCalledTimes(2)
        expect(debugSpy).toHaveBeenCalledWith(
            "Test View has rendered : 1 times.",
        )

        rerender()
        expect(debugSpy).toHaveBeenCalledTimes(3)
        expect(debugSpy).toHaveBeenCalledWith(
            "Test View has rendered : 2 times.",
        )

        debugSpy.mockRestore()
    })
})
