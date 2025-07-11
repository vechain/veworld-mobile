export default [
  {
    "name": "TokenPurchase",
    "inputs": [
      {
        "type": "address",
        "name": "buyer",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "ethsold",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "tokensbought",
        "indexed": true
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "EthPurchase",
    "inputs": [
      {
        "type": "address",
        "name": "buyer",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "tokenssold",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "ethbought",
        "indexed": true
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "AddLiquidity",
    "inputs": [
      {
        "type": "address",
        "name": "provider",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "ethamount",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "tokenamount",
        "indexed": true
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "RemoveLiquidity",
    "inputs": [
      {
        "type": "address",
        "name": "provider",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "ethamount",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "tokenamount",
        "indexed": true
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "Transfer",
    "inputs": [
      {
        "type": "address",
        "name": "from",
        "indexed": true
      },
      {
        "type": "address",
        "name": "to",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "value",
        "indexed": false
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "Approval",
    "inputs": [
      {
        "type": "address",
        "name": "owner",
        "indexed": true
      },
      {
        "type": "address",
        "name": "spender",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "value",
        "indexed": false
      }
    ],
    "anonymous": false,
    "type": "event"
  },
  {
    "name": "setup",
    "outputs": [],
    "inputs": [
      {
        "type": "address",
        "name": "tokenaddr"
      },
      {
        "type": "address",
        "name": "owneraddr"
      },
      {
        "type": "uint256",
        "name": "platformfeeamount"
      },
      {
        "type": "uint256",
        "name": "swapfeeamount"
      },
      {
        "type": "uint256",
        "name": "maxplatformfee"
      },
      {
        "type": "uint256",
        "name": "maxswapfee"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 370995
  },
  {
    "name": "addLiquidity",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "minliquidity"
      },
      {
        "type": "uint256",
        "name": "maxtokens"
      },
      {
        "type": "uint256",
        "name": "deadline"
      }
    ],
    "constant": false,
    "payable": true,
    "type": "function",
    "gas": 377094
  },
  {
    "name": "removeLiquidity",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      },
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "amount"
      },
      {
        "type": "uint256",
        "name": "mineth"
      },
      {
        "type": "uint256",
        "name": "mintokens"
      },
      {
        "type": "uint256",
        "name": "deadline"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 409460
  },
  {
    "name": "default",
    "outputs": [],
    "inputs": [],
    "constant": false,
    "payable": true,
    "type": "function"
  },
  {
    "name": "ethToTokenSwapInput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "mintokens"
      },
      {
        "type": "uint256",
        "name": "deadline"
      }
    ],
    "constant": false,
    "payable": true,
    "type": "function",
    "gas": 16399
  },
  {
    "name": "ethToTokenTransferInput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "mintokens"
      },
      {
        "type": "uint256",
        "name": "deadline"
      },
      {
        "type": "address",
        "name": "recipient"
      }
    ],
    "constant": false,
    "payable": true,
    "type": "function",
    "gas": 16590
  },
  {
    "name": "ethToTokenSwapOutput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokensbought"
      },
      {
        "type": "uint256",
        "name": "deadline"
      }
    ],
    "constant": false,
    "payable": true,
    "type": "function",
    "gas": 54105
  },
  {
    "name": "ethToTokenTransferOutput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokensbought"
      },
      {
        "type": "uint256",
        "name": "deadline"
      },
      {
        "type": "address",
        "name": "recipient"
      }
    ],
    "constant": false,
    "payable": true,
    "type": "function",
    "gas": 54313
  },
  {
    "name": "tokenToEthSwapInput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenssold"
      },
      {
        "type": "uint256",
        "name": "mineth"
      },
      {
        "type": "uint256",
        "name": "deadline"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 51145
  },
  {
    "name": "tokenToEthTransferInput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenssold"
      },
      {
        "type": "uint256",
        "name": "mineth"
      },
      {
        "type": "uint256",
        "name": "deadline"
      },
      {
        "type": "address",
        "name": "recipient"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 51354
  },
  {
    "name": "tokenToEthSwapOutput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "ethbought"
      },
      {
        "type": "uint256",
        "name": "maxtokens"
      },
      {
        "type": "uint256",
        "name": "deadline"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 53817
  },
  {
    "name": "tokenToEthTransferOutput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "ethbought"
      },
      {
        "type": "uint256",
        "name": "maxtokens"
      },
      {
        "type": "uint256",
        "name": "deadline"
      },
      {
        "type": "address",
        "name": "recipient"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 54026
  },
  {
    "name": "tokenToTokenSwapInput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenssold"
      },
      {
        "type": "uint256",
        "name": "mintokensbought"
      },
      {
        "type": "uint256",
        "name": "minethbought"
      },
      {
        "type": "uint256",
        "name": "deadline"
      },
      {
        "type": "address",
        "name": "tokenaddr"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 54649
  },
  {
    "name": "tokenToTokenTransferInput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenssold"
      },
      {
        "type": "uint256",
        "name": "mintokensbought"
      },
      {
        "type": "uint256",
        "name": "minethbought"
      },
      {
        "type": "uint256",
        "name": "deadline"
      },
      {
        "type": "address",
        "name": "recipient"
      },
      {
        "type": "address",
        "name": "tokenaddr"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 54839
  },
  {
    "name": "tokenToTokenSwapOutput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokensbought"
      },
      {
        "type": "uint256",
        "name": "maxtokenssold"
      },
      {
        "type": "uint256",
        "name": "maxethsold"
      },
      {
        "type": "uint256",
        "name": "deadline"
      },
      {
        "type": "address",
        "name": "tokenaddr"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 58570
  },
  {
    "name": "tokenToTokenTransferOutput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokensbought"
      },
      {
        "type": "uint256",
        "name": "maxtokenssold"
      },
      {
        "type": "uint256",
        "name": "maxethsold"
      },
      {
        "type": "uint256",
        "name": "deadline"
      },
      {
        "type": "address",
        "name": "recipient"
      },
      {
        "type": "address",
        "name": "tokenaddr"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 58760
  },
  {
    "name": "tokenToExchangeSwapInput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenssold"
      },
      {
        "type": "uint256",
        "name": "mintokensbought"
      },
      {
        "type": "uint256",
        "name": "minethbought"
      },
      {
        "type": "uint256",
        "name": "deadline"
      },
      {
        "type": "address",
        "name": "exchangeaddr"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 52984
  },
  {
    "name": "tokenToExchangeTransferInput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenssold"
      },
      {
        "type": "uint256",
        "name": "mintokensbought"
      },
      {
        "type": "uint256",
        "name": "minethbought"
      },
      {
        "type": "uint256",
        "name": "deadline"
      },
      {
        "type": "address",
        "name": "recipient"
      },
      {
        "type": "address",
        "name": "exchangeaddr"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 53174
  },
  {
    "name": "tokenToExchangeSwapOutput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokensbought"
      },
      {
        "type": "uint256",
        "name": "maxtokenssold"
      },
      {
        "type": "uint256",
        "name": "maxethsold"
      },
      {
        "type": "uint256",
        "name": "deadline"
      },
      {
        "type": "address",
        "name": "exchangeaddr"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 56875
  },
  {
    "name": "tokenToExchangeTransferOutput",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokensbought"
      },
      {
        "type": "uint256",
        "name": "maxtokenssold"
      },
      {
        "type": "uint256",
        "name": "maxethsold"
      },
      {
        "type": "uint256",
        "name": "deadline"
      },
      {
        "type": "address",
        "name": "recipient"
      },
      {
        "type": "address",
        "name": "exchangeaddr"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 57065
  },
  {
    "name": "getEthToTokenInputPrice",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "ethsold"
      }
    ],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 7363
  },
  {
    "name": "getEthToTokenOutputPrice",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokensbought"
      }
    ],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 8693
  },
  {
    "name": "getTokenToEthInputPrice",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "tokenssold"
      }
    ],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 7458
  },
  {
    "name": "getTokenToEthOutputPrice",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "ethbought"
      }
    ],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 8718
  },
  {
    "name": "tokenAddress",
    "outputs": [
      {
        "type": "address",
        "name": "out"
      }
    ],
    "inputs": [],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 1473
  },
  {
    "name": "factoryAddress",
    "outputs": [
      {
        "type": "address",
        "name": "out"
      }
    ],
    "inputs": [],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 1503
  },
  {
    "name": "balanceOf",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "owner"
      }
    ],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 1705
  },
  {
    "name": "transfer",
    "outputs": [
      {
        "type": "bool",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "to"
      },
      {
        "type": "uint256",
        "name": "value"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 75094
  },
  {
    "name": "transferFrom",
    "outputs": [
      {
        "type": "bool",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "from"
      },
      {
        "type": "address",
        "name": "to"
      },
      {
        "type": "uint256",
        "name": "value"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 110967
  },
  {
    "name": "approve",
    "outputs": [
      {
        "type": "bool",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "spender"
      },
      {
        "type": "uint256",
        "name": "value"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 38829
  },
  {
    "name": "increaseAllowance",
    "outputs": [
      {
        "type": "bool",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "spender"
      },
      {
        "type": "uint256",
        "name": "value"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 40043
  },
  {
    "name": "decreaseAllowance",
    "outputs": [
      {
        "type": "bool",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "spender"
      },
      {
        "type": "uint256",
        "name": "value"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 39867
  },
  {
    "name": "allowance",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "owner"
      },
      {
        "type": "address",
        "name": "spender"
      }
    ],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 2045
  },
  {
    "name": "setOwner",
    "outputs": [],
    "inputs": [
      {
        "type": "address",
        "name": "owner"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 36905
  },
  {
    "name": "adjustswapfee",
    "outputs": [
      {
        "type": "bool",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "newswapfee"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 37197
  },
  {
    "name": "adjustplatformfee",
    "outputs": [
      {
        "type": "bool",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "newplatformfee"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 37227
  },
  {
    "name": "adjustswapfeemax",
    "outputs": [
      {
        "type": "bool",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "newswapfeemax"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 37250
  },
  {
    "name": "adjustplatformfeemax",
    "outputs": [
      {
        "type": "bool",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "uint256",
        "name": "newplatformfeemax"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 37280
  },
  {
    "name": "tokenscrape",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [
      {
        "type": "address",
        "name": "tokenaddr"
      },
      {
        "type": "uint256",
        "name": "mintokensbought"
      },
      {
        "type": "uint256",
        "name": "minethbought"
      },
      {
        "type": "uint256",
        "name": "deadline"
      }
    ],
    "constant": false,
    "payable": false,
    "type": "function",
    "gas": 45033
  },
  {
    "name": "name",
    "outputs": [
      {
        "type": "bytes32",
        "name": "out"
      }
    ],
    "inputs": [],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 1923
  },
  {
    "name": "symbol",
    "outputs": [
      {
        "type": "bytes32",
        "name": "out"
      }
    ],
    "inputs": [],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 1953
  },
  {
    "name": "decimals",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 1983
  },
  {
    "name": "totalSupply",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 2013
  },
  {
    "name": "owner",
    "outputs": [
      {
        "type": "address",
        "name": "out"
      }
    ],
    "inputs": [],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 2043
  },
  {
    "name": "platformfee",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 2073
  },
  {
    "name": "platformfeemax",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 2103
  },
  {
    "name": "swapfee",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 2133
  },
  {
    "name": "swapfeemax",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 2163
  },
  {
    "name": "previousinvariant",
    "outputs": [
      {
        "type": "uint256",
        "name": "out"
      }
    ],
    "inputs": [],
    "constant": true,
    "payable": false,
    "type": "function",
    "gas": 2193
  }
] as const;