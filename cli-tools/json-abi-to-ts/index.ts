#!/usr/bin/env node

/* eslint-disable no-console */
import assert from "node:assert"
import { existsSync } from "node:fs"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path, { dirname } from "node:path"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { stripFakeSignature, validateAndUpdateBusinessEvent } from "./business-event.js"
import { getAbiFromFile, getOutFile } from "./utils.js"

const parsedArgs = hideBin(process.argv)

const buildFakeSignature = (event: any) => {
    if (event.inputs.length === 0) return event.name as string
    return `${event.name}(${event.inputs
        .map((input: any) => `${input.indexed ? "indexed " : ""}${input.type}`)
        .join(",")})`
}

yargs(parsedArgs)
    .command(
        "generate-object [--input-directory input-directory] [--out-file out-file] [--output output]",
        "Build single TS/JSON file from .json files",
        args => {
            return args
                .option("input-directory", {
                    type: "string",
                    required: true,
                    description: "Input directory",
                })
                .option("out-file", {
                    type: "string",
                    required: false,
                    description: "Output file",
                })
                .option("overwrite", {
                    type: "boolean",
                    required: false,
                    description: "Overwrite existing file if it exists",
                    default: true,
                })
                .option("output", {
                    type: "string",
                    required: false,
                    description: "Output type",
                    default: "ts",
                    choices: ["ts", "json"],
                })
        },
        async argv => {
            const outFile = getOutFile(
                argv.outFile ?? path.join(argv.inputDirectory, "generated.ts"),
                argv.output as "ts" | "json",
                argv.overwrite,
            )
            if (!existsSync(argv.inputDirectory)) throw new Error(`Directory at ${argv.inputDirectory} not found.`)
            if (!argv.overwrite && existsSync(outFile))
                throw new Error(`File at ${outFile} already exists, and --overwrite was set.`)
            const files = await readdir(argv.inputDirectory)

            let result: Record<string, unknown> = {}
            for (const file of files) {
                const abi = await getAbiFromFile(path.join(argv.inputDirectory, file))
                result = {
                    ...result,
                    ...Object.fromEntries(
                        abi
                            .filter(
                                (u: any) =>
                                    u.type === "event" && !result[buildFakeSignature(u)] && u.name !== "VET_TRANSFER",
                            )
                            .map((u: any) => [buildFakeSignature(u), u]),
                    ),
                }
            }

            const outFileDir = dirname(outFile)

            if (!existsSync(outFileDir)) {
                await mkdir(outFileDir, { recursive: true })
            }

            await writeFile(
                outFile,
                argv.output === "ts"
                    ? `export default ${JSON.stringify(result, undefined, 2)} as const;`
                    : JSON.stringify(result, undefined, 2),
                { encoding: "utf-8" },
            )
        },
    )
    .command(
        // eslint-disable-next-line max-len
        "validate-update-business-events [--input-file input-file] [--input-directory input-directory] [--out-file out-file] [--out-directory out-directory] [--generated-event-input-file generate-file]",
        "Update JSON business events with correct events",
        args => {
            return args
                .option("input-file", {
                    type: "string",
                    required: false,
                    description: "Input file (do not pass it if you pass --input-directory)",
                })
                .option("input-directory", {
                    type: "string",
                    required: false,
                    description: "Input directory (do not pass it if you pass --input-file)",
                })
                .option("out-file", {
                    type: "string",
                    required: false,
                    description: "Output file (will fail if a directory was passed as input)",
                })
                .option("out-directory", {
                    type: "string",
                    required: false,
                    description: "Output directory (will fail if a file was passed as input)",
                })
                .option("overwrite", {
                    type: "boolean",
                    required: false,
                    description: "Overwrite existing file if it exists",
                    default: true,
                })
                .option("generated-event-input-file", {
                    type: "string",
                    required: true,
                    description: "Path of the generated file (from generate-object command)",
                })
        },
        async argv => {
            if (!argv.inputFile && !argv.inputDirectory)
                throw new Error("Pass one of --input-file and --input-directory")
            if (argv.inputFile && argv.inputDirectory)
                throw new Error("Both --input-file and --input-directory were passed in. Use only one of them")
            if (argv.inputFile && argv.outDirectory)
                throw new Error("--out-directory was passed in together with --input-file. Use the matching values")
            if (argv.inputDirectory && argv.outFile)
                throw new Error("--out-file was passed in together with --input-directory. Use the matching values")

            if (!existsSync(argv.generatedEventInputFile)) throw new Error("--generated-event-input-file is required.")

            const generatedEventInputFile = await readFile(argv.generatedEventInputFile, { encoding: "utf-8" })
            const parsedGeneratedEventInputFile = JSON.parse(generatedEventInputFile)

            //Add VET_TRANSFER to simplify ops
            parsedGeneratedEventInputFile["VET_TRANSFER(address,address,uint256)"] = {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: "address",
                        name: "from",
                        type: "address",
                    },
                    {
                        indexed: false,
                        internalType: "address",
                        name: "to",
                        type: "address",
                    },
                    {
                        indexed: false,
                        internalType: "uint256",
                        name: "amount",
                        type: "uint256",
                    },
                ],
                name: "VET_TRANSFER",
                type: "event",
            }

            const groupedEventsByFakeSignature = Object.keys(parsedGeneratedEventInputFile).reduce((acc, curr) => {
                const strippedSignature = stripFakeSignature(curr)
                acc[strippedSignature] = [...(acc[strippedSignature] || []), curr]
                return acc
            }, {} as Record<string, string[]>)

            if (argv.inputFile) {
                const result = await validateAndUpdateBusinessEvent(
                    argv.inputFile,
                    groupedEventsByFakeSignature,
                    parsedGeneratedEventInputFile,
                )
                const outFile = getOutFile(argv.outFile ?? argv.inputFile, "json", argv.overwrite)
                const outFileDir = dirname(outFile)
                if (!existsSync(outFileDir)) {
                    await mkdir(outFileDir, { recursive: true })
                }

                await writeFile(outFile, JSON.stringify(result, undefined, 2))
                console.log(`File generated at ${outFile}`)
                return
            }
            assert(argv.inputDirectory, "Input directory is not defined")
            const outDirectory = argv.outDirectory ?? argv.inputDirectory
            if (!existsSync(argv.inputDirectory)) throw new Error(`Directory at ${argv.inputDirectory} not found.`)
            const files = await readdir(argv.inputDirectory)
            if (!existsSync(outDirectory)) await mkdir(outDirectory, { recursive: true })
            for (const file of files) {
                const result = await validateAndUpdateBusinessEvent(
                    path.join(argv.inputDirectory, file),
                    groupedEventsByFakeSignature,
                    parsedGeneratedEventInputFile,
                )
                const outFile = getOutFile(path.join(outDirectory, file), "json", argv.overwrite)
                await writeFile(outFile, JSON.stringify(result, undefined, 2))

                console.log(`File generated at ${outFile}`)
            }
        },
    )
    .parse()
