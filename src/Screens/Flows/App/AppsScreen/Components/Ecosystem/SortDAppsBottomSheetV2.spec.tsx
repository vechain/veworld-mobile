import { act, fireEvent, render, screen } from "@testing-library/react-native"
import React, { RefObject } from "react"
import { TestWrapper } from "~Test"

import { SortDAppsBottomSheetV2 } from "./SortDAppsBottomSheetV2"
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"

describe("SortDAppsBottomSheetV2", () => {
    it("should render correctly", async () => {
        const bsRef = { current: undefined! } as RefObject<BottomSheetModalMethods>
        const onSortChange = jest.fn()
        render(<SortDAppsBottomSheetV2 selectedSort="alphabetic_asc" bsRef={bsRef} onSortChange={onSortChange} />, {
            wrapper: TestWrapper,
        })

        await act(() => {
            fireEvent.press(screen.getByTestId("RadioButton-alphabetic_desc"))
        })

        await act(() => {
            fireEvent.press(screen.getByTestId("SORT_DAPPS_BOTTOM_SHEET_V2_APPLY"))
        })

        expect(onSortChange).toHaveBeenCalledWith("alphabetic_desc")
        expect(onSortChange.mock.calls).toHaveLength(1)

        await act(() => {
            fireEvent.press(screen.getByTestId("RadioButton-newest"))
        })

        await act(() => {
            fireEvent.press(screen.getByTestId("SORT_DAPPS_BOTTOM_SHEET_V2_CANCEL"))
        })

        //toHaveBeenCalledWith doesn't consume the mock call, so we need to check the length of mock calls
        expect(onSortChange.mock.calls).toHaveLength(1)
    })
})
