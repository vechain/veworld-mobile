/**
 * Mock for the @privy-io/expo package
 */

import React from "react"

// Mock user object
const mockUser = undefined

const mockWallet = {}

// Mock hooks - using direct function definitions
function usePrivy() {
    return {
        user: mockUser,
        logout: jest.fn().mockResolvedValue(undefined),
    }
}

function useEmbeddedEthereumWallet() {
    return {
        wallets: [],
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
