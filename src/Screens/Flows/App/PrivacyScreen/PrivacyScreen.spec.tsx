import React from "react"
import { TestWrapper } from "~Test"
import { PrivacyScreen } from "./PrivacyScreen"
import { render, screen } from "@testing-library/react-native"
import * as LocalAuthentication from "expo-local-authentication"

jest.spyOn(LocalAuthentication, "hasHardwareAsync").mockResolvedValue(true)
jest.spyOn(
    LocalAuthentication,
    "supportedAuthenticationTypesAsync",
).mockResolvedValue([1])
jest.spyOn(LocalAuthentication, "isEnrolledAsync").mockResolvedValue(true)
jest.spyOn(LocalAuthentication, "getEnrolledLevelAsync").mockResolvedValue(1)
jest.spyOn(LocalAuthentication, "authenticateAsync").mockResolvedValue({
    success: true,
})

const findElement = async () =>
    await screen.findByText("Privacy and Security", {}, { timeout: 5000 })

describe("PrivacyScreen", () => {
    it("should render correctly", async () => {
        render(<PrivacyScreen />, {
            wrapper: TestWrapper,
        })
        await findElement()
    })
})
