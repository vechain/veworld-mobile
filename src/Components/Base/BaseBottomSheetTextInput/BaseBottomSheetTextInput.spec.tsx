import { TestWrapper } from "~Test"
import React from "react"
import { render, screen } from "@testing-library/react-native"
import { BaseBottomSheetTextInput } from "./BaseBottomSheetTextInput"
import { BaseBottomSheet } from "../BaseBottomSheet"
import { BaseView } from "../BaseView"

const testId = "BaseBottomSheetTextInput"
const setValue = jest.fn()
const value = "value"
const placeholder = "placeholder"
const label = "label"
const errorMessage = "errorMessage"
const onChangeText = jest.fn()
const onBlur = jest.fn()
const onFocus = jest.fn()

const findTextByID = async () =>
    await screen.findByTestId(testId, {}, { timeout: 5000 })

describe("BaseCard", () => {
    it("renders correctly - onFocus and onBlur", async () => {
        render(
            <>
                <BaseBottomSheet snapPoints={["50%", "75%", "90%"]}>
                    <BaseView testID="BaseView" />
                    <BaseBottomSheetTextInput
                        value={value}
                        setValue={setValue}
                        placeholder={placeholder}
                        label={label}
                        errorMessage={errorMessage}
                        onChangeText={onChangeText}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        testID={testId}
                    />
                </BaseBottomSheet>
            </>,
            {
                wrapper: TestWrapper,
            },
        )

        await screen.findByTestId("BaseView", {}, { timeout: 2000 })
        await findTextByID()
    })
    it("renders correctly - no onFocus and onBlur", async () => {
        render(
            <BaseBottomSheet snapPoints={["50%", "75%", "90%"]}>
                <BaseView testID="BaseView" />
                <BaseBottomSheetTextInput
                    value={value}
                    setValue={setValue}
                    placeholder={placeholder}
                    label={label}
                    errorMessage={errorMessage}
                    onChangeText={onChangeText}
                    testID={testId}
                />
            </BaseBottomSheet>,
            {
                wrapper: TestWrapper,
            },
        )

        await screen.findByTestId("BaseView", {}, { timeout: 2000 })
        await findTextByID()
    })
})
