import { act, fireEvent, render, screen, userEvent } from "@testing-library/react-native"
import { ethers } from "ethers"
import React from "react"
import { DerivationPath } from "~Constants"
import { DEVICE_TYPE, LocalAccountWithDevice } from "~Model"
import { DelegationType } from "~Model/Delegation"
import { TestWrapper } from "~Test"
import { RenderedOption } from "./RenderedOption"

const flatListScrollProps = {
    onViewableItemsChanged: jest.fn(),
    scrollEnabled: true,
    showsHorizontalScrollIndicator: false,
    showsVerticalScrollIndicator: true,
    viewabilityConfig: { itemVisiblePercentThreshold: 100 },
}

describe("RenderedOption", () => {
    it(`should render correctly for ${DelegationType.NONE}`, () => {
        const onReset = jest.fn()
        const onClose = jest.fn()
        const setNoDelegation = jest.fn()
        render(
            <RenderedOption
                selectedOption={DelegationType.NONE}
                flatListScrollProps={flatListScrollProps}
                onReset={onReset}
                onClose={onClose}
                setNoDelegation={setNoDelegation}
                setSelectedDelegationAccount={jest.fn()}
                setSelectedDelegationUrl={jest.fn()}
                accounts={[]}
                delegationUrls={[]}
            />,
            { wrapper: TestWrapper },
        )

        act(() => {
            fireEvent.press(screen.getByTestId("RENDERED_OPTION_BUTTON_BAR_CANCEL"))
        })

        expect(onClose).toHaveBeenCalled()
        expect(onReset).toHaveBeenCalled()

        act(() => {
            fireEvent.press(screen.getByTestId("RENDERED_OPTION_BUTTON_BAR_APPLY"))
        })

        expect(onClose).toHaveBeenCalled()
        expect(setNoDelegation).toHaveBeenCalled()
    })

    it(`should render correctly for ${DelegationType.ACCOUNT}`, () => {
        const onReset = jest.fn()
        const onClose = jest.fn()
        const setSelectedDelegationAccount = jest.fn()
        const wallet = ethers.Wallet.createRandom()
        const accounts: LocalAccountWithDevice[] = [
            {
                address: wallet.address,
                alias: "TEST 1",
                device: {
                    wallet: wallet.address,
                    type: DEVICE_TYPE.LOCAL_MNEMONIC,
                    alias: "LOCAL 1",
                    index: 0,
                    position: 0,
                    rootAddress: wallet.address,
                    derivationPath: DerivationPath.VET,
                },
                index: 0,
                rootAddress: wallet.address,
                visible: true,
            },
        ]
        render(
            <RenderedOption
                selectedOption={DelegationType.ACCOUNT}
                flatListScrollProps={flatListScrollProps}
                onReset={onReset}
                onClose={onClose}
                setNoDelegation={jest.fn()}
                setSelectedDelegationAccount={setSelectedDelegationAccount}
                setSelectedDelegationUrl={jest.fn()}
                accounts={accounts}
                delegationUrls={[]}
            />,
            { wrapper: TestWrapper },
        )

        act(() => {
            fireEvent.press(screen.getByTestId("RENDERED_OPTION_BUTTON_BAR_CANCEL"))
        })

        expect(onClose).toHaveBeenCalled()
        expect(onReset).toHaveBeenCalled()

        act(() => {
            fireEvent.press(screen.getByTestId("DELEGATE_ACCOUNT_CARD_RADIO"))
        })

        act(() => {
            fireEvent.press(screen.getByTestId("RENDERED_OPTION_BUTTON_BAR_APPLY"))
        })

        expect(onClose).toHaveBeenCalled()
        expect(setSelectedDelegationAccount).toHaveBeenCalledWith(accounts[0])
    })

    it(`should render correctly for ${DelegationType.URL}`, () => {
        const onReset = jest.fn()
        const onClose = jest.fn()
        const setSelectedDelegationUrl = jest.fn()
        const delegationUrls: string[] = ["https://test.vechain.org/12"]
        render(
            <RenderedOption
                selectedOption={DelegationType.URL}
                flatListScrollProps={flatListScrollProps}
                onReset={onReset}
                onClose={onClose}
                setNoDelegation={jest.fn()}
                setSelectedDelegationAccount={jest.fn()}
                setSelectedDelegationUrl={setSelectedDelegationUrl}
                accounts={[]}
                delegationUrls={delegationUrls}
            />,
            { wrapper: TestWrapper },
        )

        act(() => {
            fireEvent.press(screen.getByTestId("RENDERED_OPTION_BUTTON_BAR_CANCEL"))
        })

        expect(onClose).toHaveBeenCalled()
        expect(onReset).toHaveBeenCalled()

        act(() => {
            fireEvent.press(
                screen.getByTestId(
                    `URL_OPTION_${new URL(delegationUrls[0]).hostname}_${new URL(delegationUrls[0]).pathname}`,
                ),
            )
        })

        act(() => {
            fireEvent.press(screen.getByTestId("RENDERED_OPTION_BUTTON_BAR_APPLY"))
        })

        expect(onClose).toHaveBeenCalled()
        expect(setSelectedDelegationUrl).toHaveBeenCalledWith(delegationUrls[0])
    })

    it(`should render correctly for ${DelegationType.URL} when typing in the url`, async () => {
        const onReset = jest.fn()
        const onClose = jest.fn()
        const setSelectedDelegationUrl = jest.fn()
        const delegationUrls: string[] = []
        render(
            <RenderedOption
                selectedOption={DelegationType.URL}
                flatListScrollProps={flatListScrollProps}
                onReset={onReset}
                onClose={onClose}
                setNoDelegation={jest.fn()}
                setSelectedDelegationAccount={jest.fn()}
                setSelectedDelegationUrl={setSelectedDelegationUrl}
                accounts={[]}
                delegationUrls={delegationUrls}
            />,
            { wrapper: TestWrapper },
        )

        act(() => {
            fireEvent.press(screen.getByTestId("RENDERED_OPTION_BUTTON_BAR_CANCEL"))
        })

        expect(onClose).toHaveBeenCalled()
        expect(onReset).toHaveBeenCalled()

        await act(async () => {
            await userEvent.type(screen.getByTestId("URL_OPTION_INPUT"), "https://test.vechain.org/12")
        })

        act(() => {
            fireEvent.press(screen.getByTestId("RENDERED_OPTION_BUTTON_BAR_APPLY"))
        })

        expect(onClose).toHaveBeenCalled()
        expect(setSelectedDelegationUrl).toHaveBeenCalledWith("https://test.vechain.org/12")
    })
})
