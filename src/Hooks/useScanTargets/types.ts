import { ScanTarget } from "~Constants"

export type ScanFunction = (data: string) => boolean
export type ScanFunctionRegistry = {
    [ScanTarget.VNS]: (
        data: string,
        defaultFn: (data: string) => Promise<{ address: string; name: string } | undefined>,
    ) => Promise<boolean>
    [ScanTarget.ADDRESS]: (data: string, defaultFn: (data: string) => void) => Promise<boolean>
    [ScanTarget.WALLET_CONNECT]: (data: string, defaultFn: (data: string) => void) => Promise<boolean>
    [ScanTarget.HTTPS_URL]: (data: string, defaultFn: (data: string) => Promise<void>) => Promise<boolean>
}
