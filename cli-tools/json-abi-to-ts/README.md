# json-abi-to-ts

## How to build

`yarn build`

## How to use

### generate-object

Generate object is the command you need to use to generate compliant objects for processing it.
In the first iteration, you'd probably need to run this command

```bash
yarn json-abi-to-ts generate-object --input-directory "<directory-of-abis>" --out-file "<path-of-output-file>" --output json
```

This command will generate a .json file built like this:

```json
{
    "Transfer(indexed address,indexed address,indexed uint256)": {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    }
    ...
}
```

You can also generate the corresponding Typescript object, simply by passing `ts` instead of `json` as the output.

This command should also be used with business events, with the same exact signature. JSON output won't be needed but can be generated anyway.

### validate-update-business-events

This command will generate compliant objects for business events to be used in VeWorld.
You should be running this command to generate them

```bash
yarn json-abi-to-ts validate-update-business-events --input-directory "<directory-of-business-events>" --out-directory "<output-directory-of-business-events>" --generated-event-input-file "<generated-input-file>"
```

As said in the step above, `generated-input-file` needs to be the JSON file generated above.
This command will do two things:
- Try to normalize business events by adding signature of events. If there's more than one signature that match the event, the command will ask to select between the available signatures.
- Output events to a file with the same name but in the output directory.

This output can be then passed to the `generate-object` command to generate a Typescript object.

It can be used to generate a single file too, by running:

```bash
yarn json-abi-to-ts validate-update-business-events --input-file "<input-file>" --out-file "<output-file>" --generated-event-input-file "<generated-input-file>"
```
