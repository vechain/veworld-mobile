import { act, renderHook } from "@testing-library/react-hooks"
import { useNavigation } from "@react-navigation/native"
import { Transaction } from "@vechain/sdk-core"

import { TestHelpers, TestWrapper } from "~Test"
import { Routes } from "~Navigation"
import { AnalyticsEvent } from "~Constants"

import { useTransactionCallbacks } from "./useTransactionCallbacks"

jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
}))

const addPendingTransferTransactionActivity = jest
    .fn()
    .mockImplementation(payload => ({ type: "activities/addPendingTransferTransactionActivity", payload }))

jest.mock("~Storage/Redux", () => ({
    ...jest.requireActual("~Storage/Redux"),
    addPendingTransferTransactionActivity: (...args: any[]) => addPendingTransferTransactionActivity(...args),
}))

describe("useTransactionCallbacks", () => {
    it("should work correctly with the transaction failure", () => {
        const navigate = jest.fn()
        const onFailure = jest.fn()
        ;(useNavigation as jest.Mock).mockReturnValue({ navigate })
        const { result } = renderHook(
            () => useTransactionCallbacks({ token: TestHelpers.data.VETWithBalance, onFailure }),
            {
                wrapper: TestWrapper,
            },
        )

        act(() => {
            result.current.onTransactionFailure()
        })

        expect(navigate).not.toHaveBeenCalled()
        expect(onFailure).toHaveBeenCalled()
    })
    it("should work correctly with the transaction success", async () => {
        const navigate = jest.fn()
        const onFailure = jest.fn()
        ;(useNavigation as jest.Mock).mockReturnValue({ navigate })
        const { result } = renderHook(
            () => useTransactionCallbacks({ token: TestHelpers.data.VETWithBalance, onFailure }),
            {
                wrapper: TestWrapper,
            },
        )

        await act(async () => {
            await result.current.onTransactionSuccess(
                Transaction.of({
                    blockRef: "0x00ce27a27f982a6d",
                    chainTag: 39,
                    clauses: [
                        {
                            data: "0x",
                            to: "0x435933c8064b4Ae76bE665428e0307eF2cCFBD68",
                            value: "0x1043561a8829300000",
                        },
                    ],
                    dependsOn: null,
                    expiration: 100,
                    gas: 0,
                    gasPriceCoef: 127,
                    nonce: "0x1234ab",
                }),
            )
        })

        expect(navigate).toHaveBeenCalledWith(Routes.HOME)
        expect(onFailure).not.toHaveBeenCalled()
        expect(addPendingTransferTransactionActivity).toHaveBeenCalledWith(expect.any(Transaction), {
            medium: AnalyticsEvent.SEND,
            signature: AnalyticsEvent.LOCAL,
            subject: AnalyticsEvent.NATIVE_TOKEN,
            context: AnalyticsEvent.SEND,
        })
    })
})
