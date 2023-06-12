import { abi } from "thor-devkit"

/* GETTER FUNCTIONS (contract calls) */
export const getAmountsOut: abi.Function.Definition = {
    inputs: [
        {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
        },
        {
            internalType: "address[]",
            name: "path",
            type: "address[]",
        },
    ],
    name: "getAmountsOut",
    outputs: [
        {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
        },
    ],
    stateMutability: "view",
    type: "function",
}

export const getAmountsIn: abi.Function.Definition = {
    inputs: [
        {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
        },
        {
            internalType: "address[]",
            name: "path",
            type: "address[]",
        },
    ],
    name: "getAmountsIn",
    outputs: [
        {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
        },
    ],
    stateMutability: "view",
    type: "function",
}

/* STATE CHANGING FUNCTIONS (transactions) */
export const addLiquidity: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "tokenA",
            type: "address",
        },
        {
            internalType: "address",
            name: "tokenB",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "amountADesired",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountBDesired",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountAMin",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountBMin",
            type: "uint256",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
        },
    ],
    name: "addLiquidity",
    outputs: [
        {
            internalType: "uint256",
            name: "amountA",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountB",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
        },
    ],
    stateMutability: "nonpayable",
    type: "function",
}

export const addLiquidityVET: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "token",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "amountTokenDesired",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountTokenMin",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountVETMin",
            type: "uint256",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
        },
    ],
    name: "addLiquidityVET",
    outputs: [
        {
            internalType: "uint256",
            name: "amountToken",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountVET",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
        },
    ],
    stateMutability: "payable",
    type: "function",
}

export const removeLiquidity: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "tokenA",
            type: "address",
        },
        {
            internalType: "address",
            name: "tokenB",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountAMin",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountBMin",
            type: "uint256",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
        },
    ],
    name: "removeLiquidity",
    outputs: [
        {
            internalType: "uint256",
            name: "amountA",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountB",
            type: "uint256",
        },
    ],
    stateMutability: "nonpayable",
    type: "function",
}

export const removeLiquidityVET: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "token",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountTokenMin",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountVETMin",
            type: "uint256",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
        },
    ],
    name: "removeLiquidityVET",
    outputs: [
        {
            internalType: "uint256",
            name: "amountToken",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountVET",
            type: "uint256",
        },
    ],
    stateMutability: "nonpayable",
    type: "function",
}

export const removeLiquidityWithPermit: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "tokenA",
            type: "address",
        },
        {
            internalType: "address",
            name: "tokenB",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountAMin",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountBMin",
            type: "uint256",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
        },
        {
            internalType: "bool",
            name: "approveMax",
            type: "bool",
        },
        {
            internalType: "uint8",
            name: "v",
            type: "uint8",
        },
        {
            internalType: "bytes32",
            name: "r",
            type: "bytes32",
        },
        {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
        },
    ],
    name: "removeLiquidityWithPermit",
    outputs: [
        {
            internalType: "uint256",
            name: "amountA",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountB",
            type: "uint256",
        },
    ],
    stateMutability: "nonpayable",
    type: "function",
}

export const removeLiquidityVETWithPermit: abi.Function.Definition = {
    inputs: [
        {
            internalType: "address",
            name: "token",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountTokenMin",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountVETMin",
            type: "uint256",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
        },
        {
            internalType: "bool",
            name: "approveMax",
            type: "bool",
        },
        {
            internalType: "uint8",
            name: "v",
            type: "uint8",
        },
        {
            internalType: "bytes32",
            name: "r",
            type: "bytes32",
        },
        {
            internalType: "bytes32",
            name: "s",
            type: "bytes32",
        },
    ],
    name: "removeLiquidityVETWithPermit",
    outputs: [
        {
            internalType: "uint256",
            name: "amountToken",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountVET",
            type: "uint256",
        },
    ],
    stateMutability: "nonpayable",
    type: "function",
}

export const swapExactTokensForTokens: abi.Function.Definition = {
    inputs: [
        {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountOutMin",
            type: "uint256",
        },
        {
            internalType: "address[]",
            name: "path",
            type: "address[]",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
        },
    ],
    name: "swapExactTokensForTokens",
    outputs: [
        {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
        },
    ],
    stateMutability: "nonpayable",
    type: "function",
}

export const swapTokensForExactTokens: abi.Function.Definition = {
    inputs: [
        {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountInMax",
            type: "uint256",
        },
        {
            internalType: "address[]",
            name: "path",
            type: "address[]",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
        },
    ],
    name: "swapTokensForExactTokens",
    outputs: [
        {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
        },
    ],
    stateMutability: "nonpayable",
    type: "function",
}

export const swapExactVETForTokens: abi.Function.Definition = {
    inputs: [
        {
            internalType: "uint256",
            name: "amountOutMin",
            type: "uint256",
        },
        {
            internalType: "address[]",
            name: "path",
            type: "address[]",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
        },
    ],
    name: "swapExactVETForTokens",
    outputs: [
        {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
        },
    ],
    stateMutability: "payable",
    type: "function",
}

export const swapTokensForExactVET: abi.Function.Definition = {
    inputs: [
        {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountInMax",
            type: "uint256",
        },
        {
            internalType: "address[]",
            name: "path",
            type: "address[]",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
        },
    ],
    name: "swapTokensForExactVET",
    outputs: [
        {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
        },
    ],
    stateMutability: "nonpayable",
    type: "function",
}

export const swapExactTokensForVET: abi.Function.Definition = {
    inputs: [
        {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
        },
        {
            internalType: "uint256",
            name: "amountOutMin",
            type: "uint256",
        },
        {
            internalType: "address[]",
            name: "path",
            type: "address[]",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
        },
    ],
    name: "swapExactTokensForVET",
    outputs: [
        {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
        },
    ],
    stateMutability: "nonpayable",
    type: "function",
}

export const swapVETForExactTokens: abi.Function.Definition = {
    inputs: [
        {
            internalType: "uint256",
            name: "amountOut",
            type: "uint256",
        },
        {
            internalType: "address[]",
            name: "path",
            type: "address[]",
        },
        {
            internalType: "address",
            name: "to",
            type: "address",
        },
        {
            internalType: "uint256",
            name: "deadline",
            type: "uint256",
        },
    ],
    name: "swapVETForExactTokens",
    outputs: [
        {
            internalType: "uint256[]",
            name: "amounts",
            type: "uint256[]",
        },
    ],
    stateMutability: "payable",
    type: "function",
}
