import { existsSync } from "fs"
import { readFile } from "fs/promises"
import path from "path"

export const checkForTsExtension = (_path: string) => {
    const parsed = path.parse(_path)
    if (parsed.ext === ".ts") return _path
    return path.join(parsed.dir, `${parsed.name}.ts`)
}

export const checkForJsonExtension = (_path: string) => {
    const parsed = path.parse(_path)
    if (parsed.ext === ".json") return _path
    return path.join(parsed.dir, `${parsed.name}.json`)
}

const getAbiAsArray = (abi: unknown) => {
    if (Array.isArray(abi)) return abi
    return [abi]
}

export const getAbiFromFile = async (_path: string) => {
    const f = await readFile(_path, { encoding: "utf-8" })
    const parsed = JSON.parse(f)
    if ("abi" in parsed) {
        return getAbiAsArray(parsed.abi)
    }
    return getAbiAsArray(parsed)
}

export const getOutFile = (outPath: string, output: "ts" | "json", overwrite: boolean) => {
    let out: string
    if (output === "ts") out = checkForTsExtension(outPath)
    else out = checkForJsonExtension(outPath)
    if (!overwrite && existsSync(out)) throw new Error(`File at ${out} already exists, and --overwrite was not set.`)
    return out
}
