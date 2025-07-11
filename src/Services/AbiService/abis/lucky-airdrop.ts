export default [
  {
    "constant": false,
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "claimerAddr",
        "type": "address"
      },
      {
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "claimEnvelope",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "refundEnvelope",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "TIPPCT",
    "outputs": [
      {
        "name": "",
        "type": "uint16"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "envelopeType",
        "type": "uint8"
      },
      {
        "name": "amount",
        "type": "uint256"
      },
      {
        "name": "nickname",
        "type": "string"
      },
      {
        "name": "duration",
        "type": "uint64"
      },
      {
        "name": "messageLink",
        "type": "string"
      },
      {
        "name": "maxClaims",
        "type": "uint64"
      },
      {
        "name": "secretSigner",
        "type": "address"
      },
      {
        "name": "tokenAddr",
        "type": "address"
      }
    ],
    "name": "newVIP180Envelope",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "envelopeIndex",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "claimer",
        "type": "address"
      }
    ],
    "name": "getClaimInfo",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getEnvelopeReveal",
    "outputs": [
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "uint64"
      },
      {
        "name": "",
        "type": "uint64"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "uint256"
      },
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "min",
        "type": "uint64"
      },
      {
        "name": "max",
        "type": "uint64"
      }
    ],
    "name": "setClaims",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "getEnvelopeInfo",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      },
      {
        "name": "",
        "type": "uint8"
      },
      {
        "name": "",
        "type": "address"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "uint64"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "uint64"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "ThorNode",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "envelopeType",
        "type": "uint8"
      },
      {
        "name": "nickname",
        "type": "string"
      },
      {
        "name": "duration",
        "type": "uint64"
      },
      {
        "name": "messageLink",
        "type": "string"
      },
      {
        "name": "maxClaims",
        "type": "uint64"
      },
      {
        "name": "secretSigner",
        "type": "address"
      }
    ],
    "name": "newEnvelope",
    "outputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "min",
        "type": "uint256"
      },
      {
        "name": "max",
        "type": "uint256"
      }
    ],
    "name": "setAmount",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "pct",
        "type": "uint8"
      }
    ],
    "name": "setTipPct",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "newAddr",
        "type": "address"
      }
    ],
    "name": "setDevAddress",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "devAddr",
    "outputs": [
      {
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "name": "devAddr",
        "type": "address"
      },
      {
        "name": "thorNode",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      }
    ],
    "name": "EnvelopeCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "EnvelopeClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "id",
        "type": "uint256"
      },
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "EnvelopeRefunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  }
] as const;