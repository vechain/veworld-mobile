import Transport from "@ledgerhq/hw-transport"
import { Buffer } from "buffer"
import { debug } from "~Common/Logger"

export const VET_DERIVATION_PATH = "m/44'/818'/0'/0"

/**
 * Copied from https://github.com/dinn2018/hw-app-vet/blob/master/src/index.ts
 *
 * With some modifications so that we can provide an in progress callback
 */
export default class VETLedgerApp {
    constructor(readonly transport: Transport) {}

    public async getAppConfiguration() {
        const response = await this.transport.send(
            0xe0,
            0x06,
            0x00,
            0x00,
            Buffer.alloc(0),
            [StatusCodes.OK],
        )
        return response.subarray(0, 4)
    }

    public async getAccount(
        path: string,
        display?: boolean,
        chainCode?: boolean,
        statusCodes: StatusCodes[] = [StatusCodes.OK],
    ) {
        const paths = splitPath(path)
        const buffer = Buffer.alloc(1 + paths.length * 4)
        buffer[0] = paths.length
        paths.forEach((element, index) => {
            buffer.writeUInt32BE(element, 1 + 4 * index)
        })
        const response = await this.transport.send(
            0xe0,
            0x02,
            display ? 0x01 : 0x00,
            chainCode ? 0x01 : 0x00,
            buffer,
            statusCodes,
        )

        const publicKeyLength = response[0]
        const addressLength = response[1 + publicKeyLength]
        const acc: VETLedgerAccount = {
            publicKey: response
                .subarray(1, 1 + publicKeyLength)
                .toString("hex"),
            address:
                "0x" +
                response
                    .subarray(
                        1 + publicKeyLength + 1,
                        1 + publicKeyLength + 1 + addressLength,
                    )
                    .toString("ascii")
                    .toLowerCase(),
        }
        if (chainCode) {
            acc.chainCode = response
                .subarray(
                    1 + publicKeyLength + 1 + addressLength,
                    1 + publicKeyLength + 1 + addressLength + 32,
                )
                .toString("hex")
        }
        return acc
    }

    public async signTransaction(
        path: string,
        rawTx: Buffer,
        onIsAwaitingForSignature: () => void,
        onProgressUpdate?: (percent: number) => void,
    ) {
        return this.sign(
            path,
            rawTx,
            true,
            0xe0,
            0x04,
            onIsAwaitingForSignature,
            onProgressUpdate,
        )
    }

    public async signJSON(path: string, rawJSON: Buffer) {
        return this.sign(path, rawJSON, false, 0xe0, 0x09)
    }

    private async sign(
        path: string,
        raw: Buffer,
        isTransaction: boolean,
        cla: number,
        ins: number,
        onIsAwaitingForSignature?: () => void,
        onProgressUpdate?: (percent: number) => void,
    ) {
        const buffers = splitRaw(path, raw, isTransaction)
        const responses = [] as Buffer[]

        for (let i = 0; i < buffers.length; i++) {
            const isAfterSecondLast = i >= buffers.length - 2
            if (isAfterSecondLast && onIsAwaitingForSignature)
                onIsAwaitingForSignature()

            const percent = Math.round((i / buffers.length) * 100)
            debug(`Ledger progress: ${percent}%`)
            if (onProgressUpdate) onProgressUpdate(percent)

            //this point could exit the loop way before. Here i am building the transaction data
            const data = buffers[i]
            responses.push(
                await this.transport.send(
                    cla,
                    ins,
                    i === 0 ? 0x00 : 0x80,
                    0x00,
                    data,
                    [StatusCodes.OK],
                ),
            )
        }

        const lastResponse = responses[responses.length - 1]
        if (lastResponse.length < 65) {
            throw new Error("invalid signature")
        }

        return lastResponse.subarray(0, 65)
    }
}

const splitPath = (path: string): number[] => {
    return path
        .split("/")
        .map(elem => {
            let num = parseInt(elem, 10)
            if (elem.length > 1 && elem[elem.length - 1] === "'") {
                num += 0x80000000
            }
            return num
        })
        .filter(num => !isNaN(num))
}

const splitRaw = (
    path: string,
    raw: Buffer,
    isTransaction: boolean,
): Buffer[] => {
    const contentByteLength = isTransaction ? 0 : 4
    const paths = splitPath(path)
    let offset = 0
    const buffers: Buffer[] = []
    while (offset !== raw.length) {
        const maxChunkSize =
            offset === 0 ? 255 - 1 - paths.length * 4 - contentByteLength : 255
        const chunkSize =
            offset + maxChunkSize > raw.length
                ? raw.length - offset
                : maxChunkSize
        const buffer = Buffer.alloc(
            offset === 0
                ? 1 + paths.length * 4 + contentByteLength + chunkSize
                : chunkSize,
        )
        if (offset === 0) {
            buffer[0] = paths.length
            paths.forEach((element, index) => {
                buffer.writeUInt32BE(element, 1 + 4 * index)
            })
            if (isTransaction) {
                raw.copy(
                    buffer,
                    1 + 4 * paths.length,
                    offset,
                    offset + chunkSize,
                )
            } else {
                buffer.writeUInt32BE(raw.length, 1 + 4 * paths.length)
                raw.copy(
                    buffer,
                    1 + 4 * paths.length + 4,
                    offset,
                    offset + chunkSize,
                )
            }
        } else {
            raw.copy(buffer, 0, offset, offset + chunkSize)
        }
        buffers.push(buffer)
        offset += chunkSize
    }
    return buffers
}

export interface VETLedgerAccount {
    publicKey: string
    address: string
    chainCode?: string
}

export enum StatusCodes {
    PIN_REMAINING_ATTEMPTS = 0x63c0,
    INCORRECT_LENGTH = 0x6700,
    COMMAND_INCOMPATIBLE_FILE_STRUCTURE = 0x6981,
    SECURITY_STATUS_NOT_SATISFIED = 0x6982,
    CONDITIONS_OF_USE_NOT_SATISFIED = 0x6985,
    INCORRECT_DATA = 0x6a80,
    NOT_ENOUGH_MEMORY_SPACE = 0x6a84,
    REFERENCED_DATA_NOT_FOUND = 0x6a88,
    FILE_ALREADY_EXISTS = 0x6a89,
    INCORRECT_P1_P2 = 0x6b00,
    INS_NOT_SUPPORTED = 0x6d00,
    CLA_NOT_SUPPORTED = 0x6e00,
    TECHNICAL_PROBLEM = 0x6f00,
    OK = 0x9000,
    MEMORY_PROBLEM = 0x9240,
    NO_EF_SELECTED = 0x9400,
    INVALID_OFFSET = 0x9402,
    FILE_NOT_FOUND = 0x9404,
    INCONSISTENT_FILE = 0x9408,
    ALGORITHM_NOT_SUPPORTED = 0x9484,
    INVALID_KCV = 0x9485,
    CODE_NOT_INITIALIZED = 0x9802,
    ACCESS_CONDITION_NOT_FULFILLED = 0x9804,
    CONTRADICTION_SECRET_CODE_STATUS = 0x9808,
    CONTRADICTION_INVALIDATION = 0x9810,
    CODE_BLOCKED = 0x9840,
    MAX_VALUE_REACHED = 0x9850,
    GP_AUTH_FAILED = 0x6300,
    LICENSING = 0x6f42,
    HALTED = 0x6faa,
}
