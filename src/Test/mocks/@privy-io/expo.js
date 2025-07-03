/**
 * Mock for the @privy-io/expo package
 */

import React from "react"

// Mock wallet object
const mockWallet = {
    address: "0x1234567890123456789012345678901234567890",
    getProvider: jest.fn().mockResolvedValue({
        request: jest.fn().mockResolvedValue("0x1234567890123456789012345678901234567890"),
    }),
}

// Mock user object
const mockUser = {
    id: "test-user-id",
    email: "test@example.com",
}

// Mock hooks - using direct function definitions
function usePrivy() {
    return {
        user: mockUser,
        logout: jest.fn().mockResolvedValue(undefined),
    }
}

function useEmbeddedEthereumWallet() {
    return {
        wallets: [mockWallet],
        create: jest.fn().mockResolvedValue(mockWallet),
    }
}

function useLoginWithOAuth() {
    return {
        login: jest.fn().mockResolvedValue(undefined),
    }
}

// Mock Provider component
function PrivyProvider({ children }) {
    return React.createElement("div", { "data-testid": "privy-provider" }, children)
}

// ES module exports
export { usePrivy, useEmbeddedEthereumWallet, useLoginWithOAuth, PrivyProvider }

// CommonJS exports for compatibility
module.exports = {
    usePrivy,
    useEmbeddedEthereumWallet,
    useLoginWithOAuth,
    PrivyProvider,
}
