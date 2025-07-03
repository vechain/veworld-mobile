import React, { useRef } from "react"
import { renderHook } from "@testing-library/react-hooks"
import { SwipeableRow } from "./SwipeableRow"
import { FlatList } from "react-native-gesture-handler"
import { SwipeableItemImperativeRef } from "react-native-swipeable-item"
import { TestWrapper, TestHelpers } from "~Test"
import { render, screen } from "@testing-library/react-native"
import { BaseText } from "~Components"

const { account1D1, account2D1 } = TestHelpers.data

const mockHandleTrashIconPress = jest.fn()

describe("SwipableRow", () => {
    it("renders correctly", () => {
        const { result } = renderHook(() => useRef<Map<string, SwipeableItemImperativeRef>>(new Map()))

        render(
            <FlatList
                data={[account1D1, account2D1]}
                renderItem={({ item }) => (
                    <SwipeableRow
                        item={item}
                        itemKey={item.address}
                        handleTrashIconPress={mockHandleTrashIconPress}
                        swipeableItemRefs={result.current}>
                        <BaseText>{item.alias}</BaseText>
                    </SwipeableRow>
                )}
            />,
            {
                wrapper: TestWrapper,
            },
        )

        expect(screen.getByText(account1D1.alias)).toBeOnTheScreen()
        expect(screen.getByText(account2D1.alias)).toBeOnTheScreen()
    })
})
