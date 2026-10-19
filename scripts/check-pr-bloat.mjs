#!/usr/bin/env node
// Fails a PR on bloated reviewer-facing prose. See CLAUDE.md "Commits & PRs".
// Env: BASE_REF, HEAD_REF ("WORKTREE" for local), PR_BODY / PR_BODY_FILE,
// BLOAT_BYPASS=1 to report findings without failing.

import { execFileSync } from "node:child_process"
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs"

const BASE_REF = process.env.BASE_REF ?? "origin/main"
const HEAD_REF = process.env.HEAD_REF ?? "HEAD"
const BYPASS = process.env.BLOAT_BYPASS === "1"

// Overridable so thresholds can be ratcheted without touching the logic. A bad
// value exits rather than comparing against NaN, which would silently pass everything.
const num = (name, fallback) => {
    const raw = process.env[name]
    const value = Number(raw ?? fallback)
    if (!Number.isFinite(value) || value < 0) {
        console.error(`${name}="${raw}" is not a non-negative number; refusing to run.`)
        process.exit(2)
    }
    return value
}
// Comment volume must be proportionate to the code it documents: 4 lines above a
// new field is bloat, the same 4 above a 40-line function is not. RATIO is comment
// lines per attached added-code line; BLOCK is the absolute ceiling regardless.
const MAX_COMMENT_RATIO = num("BLOAT_MAX_COMMENT_RATIO", 1)
const MAX_COMMENT_BLOCK = num("BLOAT_MAX_COMMENT_BLOCK", 10)
const RATIO_MIN_BLOCK = 2
// Flat, deliberately: description length does not scale with diff size. A big
// change that genuinely needs more gets the `verbose-ok` label.
const DESCRIPTION_BUDGET = num("BLOAT_DESCRIPTION_BUDGET", 240)
const MIN_DESCRIPTION_WORDS = 10
const DENSITY_MIN_ADDED = 20
const DENSITY_ADVISORY = 0.25
const MD_PARAGRAPH_ADVISORY = 120

// Tool-attribution trailers: adverts, not information. Blocked outright.
const AD_TRAILERS = [
    /🤖\s*Generated with/i,
    /Generated with \[?Claude Code/i,
    /Co-authored-by:\s*(?:Claude|Cursor|Devin|Codex|GitHub Copilot)/i,
    /noreply@anthropic\.com/i,
    /Co-authored-by:.*\[bot\]/i,
]

// Never scanned: generated, vendored, or machine-owned.
const IGNORED = [
    /(^|\/)(dist|build|coverage|node_modules|Pods|\.gradle|\.yarn|\.expo)\//,
    /(^|\/)(yarn\.lock|package-lock\.json|pnpm-lock\.yaml|Podfile\.lock|Gemfile\.lock)$/,
    /\.snap$/,
    /^patches\//,
    /^src\/Generated\//,
    /^src\/i18n\/i18n-[^/]+\.tsx?$/,
    /^abi-resources\/generated-abi\.json$/,
]

// Scanned but never blocking: prose is the point.
const ADVISORY_ONLY = [/\.mdx?$/]

const SLASH = new Set(["ts", "tsx", "js", "jsx", "mjs", "cjs", "swift", "kt", "kts", "java", "m", "mm", "h", "gradle"])
const HASH = new Set(["yml", "yaml", "sh", "bash", "zsh", "toml", "rb", "properties"])

// Machine-directed comments carry no prose; they must never count toward a block.
const DIRECTIVE =
    /^(?:\/\/|#|\*)\s*(?:eslint-|@ts-|tslint:|prettier-ignore|istanbul |c8 |v8 |biome-ignore|oxlint-|deno-lint|noqa|type:\s*ignore|SPDX-License-Identifier|nosec|codeql\[)/i

function git(args) {
    try {
        return execFileSync("git", args, {
            encoding: "utf8",
            maxBuffer: 256 * 1024 * 1024,
        })
    } catch (err) {
        // Fail closed: an unresolvable diff must not silently pass the check.
        throw new Error(`git ${args.join(" ")} failed: ${err.message}`)
    }
}

const ext = f => (f.includes(".") ? f.split(".").pop().toLowerCase() : "")
const ignored = f => IGNORED.some(re => re.test(f))
const advisoryOnly = f => ADVISORY_ONLY.some(re => re.test(f))
const isMarkdown = f => /\.mdx?$/.test(f)

function commentSyntax(file) {
    const e = ext(file)
    if (SLASH.has(e)) return "slash"
    if (HASH.has(e)) return "hash"
    return null
}

function classify(line, syntax) {
    const body = line.trim()
    if (!body) return "blank"
    if (body.startsWith("#!")) return "code"
    if (DIRECTIVE.test(body)) return "code"
    if (syntax === "slash") {
        // A `*` continuation only counts inside a block we are already tracking;
        // treating it as a comment unconditionally is right for added JSDoc runs.
        if (/^(\/\/|\/\*|\*\/|\*(\s|$))/.test(body)) return "comment"
        return "code"
    }
    if (syntax === "hash") return body.startsWith("#") ? "comment" : "code"
    return "code"
}

// --- description ------------------------------------------------------------

function prose(body) {
    return body
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/~~~[\s\S]*?~~~/g, " ")
        .replace(/<!--[\s\S]*?-->/g, " ")
        .split("\n")
        .filter(l => !/^\s*(?:🤖\s*Generated with|Co-authored-by:|Generated with)/i.test(l) && !/^\s*!\[/.test(l))
        .join("\n")
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/^\s*[-*+]\s+/gm, "")
        .replace(/^\s*#{1,6}\s+/gm, "")
        .replace(/[`*_>|]/g, " ")
}

const wordCount = text =>
    text
        .trim()
        .split(/\s+/)
        .filter(w => /[A-Za-z0-9]/.test(w)).length

function resolveBody() {
    if (process.env.PR_BODY_FILE && existsSync(process.env.PR_BODY_FILE)) {
        return readFileSync(process.env.PR_BODY_FILE, "utf8")
    }
    if (process.env.PR_BODY !== undefined) return process.env.PR_BODY
    try {
        return execFileSync("gh", ["pr", "view", "--json", "body", "-q", ".body"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
        })
    } catch {
        return null
    }
}

// --- diff -------------------------------------------------------------------

function addedByFile(range, worktree) {
    const files = new Map()
    const diff = git(["diff", "--unified=0", "--no-color", "-M", "--diff-filter=AMR", ...range])
    let file = null
    let syntax = null
    let lineNo = 0

    const ensure = f => {
        if (!files.has(f)) files.set(f, { file: f, added: 0, comment: 0, runs: [] })
        return files.get(f)
    }
    let hunk = 0
    let cur = null
    const closeRun = () => {
        if (cur) ensure(cur.file).runs.push(cur)
        cur = null
    }
    const extend = (f, kind, line, text) => {
        if (cur && cur.kind === kind && cur.hunk === hunk) cur.length++
        else {
            closeRun()
            cur = {
                file: f,
                kind,
                hunk,
                start: line,
                length: 1,
                preview: text.trim(),
            }
        }
    }

    for (const raw of diff.split("\n")) {
        if (raw.startsWith("diff --git ")) {
            closeRun()
            file = null
            continue
        }
        if (raw.startsWith("+++ ")) {
            closeRun()
            const p = raw.slice(4).trim()
            file = p === "/dev/null" ? null : p.replace(/^b\//, "")
            if (file && ignored(file)) file = null
            syntax = file ? commentSyntax(file) : null
            if (file) ensure(file)
            continue
        }
        if (raw.startsWith("@@")) {
            closeRun()
            hunk++
            const m = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)/)
            lineNo = m ? Number(m[1]) : 0
            continue
        }
        // A deletion breaks a run: the added lines either side are not contiguous.
        if (raw.startsWith("-") && !raw.startsWith("---")) closeRun()
        if (!file || !raw.startsWith("+") || raw.startsWith("+++")) continue

        const text = raw.slice(1)
        const rec = ensure(file)
        rec.added++
        const kind = isMarkdown(file) ? "md" : classify(text, syntax)
        if (kind === "comment") rec.comment++
        if (kind === "blank") closeRun()
        else if (kind !== "md") extend(file, kind, lineNo, text)
        if (isMarkdown(file)) {
            rec.mdLines ??= []
            rec.mdLines.push(text)
        }
        lineNo++
    }
    closeRun()

    if (worktree) {
        for (const u of git(["ls-files", "--others", "--exclude-standard"]).split("\n")) {
            const f = u.trim()
            if (!f || ignored(f) || !existsSync(f)) continue
            const syn = commentSyntax(f)
            if (!syn && !isMarkdown(f)) continue // nothing to classify (images, binaries)
            let content
            try {
                content = readFileSync(f, "utf8")
            } catch {
                continue // unreadable local file is not a bloat finding
            }
            const rec = ensure(f)
            let r = null
            const close = () => {
                if (r) rec.runs.push(r)
                r = null
            }
            content.split("\n").forEach((text, i) => {
                rec.added++
                const kind = isMarkdown(f) ? "md" : classify(text, syn)
                if (kind === "comment") rec.comment++
                if (kind === "blank") close()
                else if (kind !== "md") {
                    if (r && r.kind === kind) r.length++
                    else {
                        close()
                        r = {
                            file: f,
                            kind,
                            hunk: 0,
                            start: i + 1,
                            length: 1,
                            preview: text.trim(),
                        }
                    }
                }
                if (isMarkdown(f)) (rec.mdLines ??= []).push(text)
            })
            close()
        }
    }
    return [...files.values()]
}

function mdParagraphs(lines) {
    const out = []
    let buf = []
    let fenced = false
    const flush = () => {
        if (buf.length) {
            const words = wordCount(prose(buf.join("\n")))
            if (words > 0) out.push({ words, preview: buf[0].trim().slice(0, 90) })
        }
        buf = []
    }
    for (const l of lines) {
        if (/^\s*(```|~~~)/.test(l)) {
            fenced = !fenced
            flush()
            continue
        }
        if (fenced) continue
        if (!l.trim() || /^\s*\|/.test(l) || /^\s*(?:[-*+]|\d+\.)\s/.test(l)) flush()
        else buf.push(l)
    }
    flush()
    return out
}

// --- reporting --------------------------------------------------------------

const MARKER = "<!-- pr-bloat-guard -->"

function writeComment(lines) {
    const path = process.env.BLOAT_COMMENT_FILE
    if (!path) return
    try {
        writeFileSync(path, [MARKER, ...lines].join("\n") + "\n")
    } catch {
        // best effort
    }
}

function writeSummary(lines) {
    const path = process.env.GITHUB_STEP_SUMMARY
    if (!path) return
    try {
        appendFileSync(path, lines.join("\n") + "\n")
    } catch {
        // best effort
    }
}

function main() {
    const worktree = HEAD_REF === "WORKTREE"
    // Merge base, not the tip: a two-dot diff against a moved origin/main reports
    // other people's commits as this change. CI's three-dot range already does this.
    const range = worktree ? [git(["merge-base", BASE_REF, "HEAD"]).trim()] : [`${BASE_REF}...${HEAD_REF}`]
    const files = addedByFile(range, worktree)
    const totalAdded = files.reduce((a, f) => a + f.added, 0)

    const blocking = []
    const advisory = []

    const body = resolveBody()
    const budget = DESCRIPTION_BUDGET
    let words = null
    if (body === null) {
        console.log("No PR description available (set PR_BODY_FILE / PR_BODY); skipping that check.")
    } else {
        if (AD_TRAILERS.some(re => re.test(body))) {
            blocking.push({
                kind: "ad-trailer",
                detail: "description carries a tool-attribution trailer — delete it",
                fix: "tool attribution is an advert, not information for the reviewer",
            })
        }
        words = wordCount(prose(body))
        if (words > budget) {
            blocking.push({
                kind: "description",
                detail: `${words} words, budget ${budget}`,
                fix: `cut to ${budget} words: state what changed and why, and let the diff show the rest`,
            })
        } else if (words < MIN_DESCRIPTION_WORDS) {
            blocking.push({
                kind: "description",
                detail: `${words} word${words === 1 ? "" : "s"} is too few to tell a reviewer anything`,
                fix: `write at least ${MIN_DESCRIPTION_WORDS} words saying what changed and why`,
            })
        }
    }

    for (const f of files) {
        const codeAdded = (f.runs ?? []).filter(r => r.kind === "code").reduce((a, r) => a + r.length, 0)
        for (let i = 0; i < (f.runs ?? []).length; i++) {
            const b = f.runs[i]
            if (b.kind !== "comment") continue
            const next = f.runs[i + 1]
            const header = b.start <= 3 // a top-of-file comment documents the file, not the next line
            const documents = header
                ? codeAdded
                : next && next.kind === "code" && next.hunk === b.hunk
                ? next.length
                : 0
            const ratio = b.length / Math.max(documents, 1)
            const overRatio = b.length >= RATIO_MIN_BLOCK && ratio > MAX_COMMENT_RATIO
            const overBlock = b.length > MAX_COMMENT_BLOCK
            if (!overRatio && !overBlock) continue
            const finding = {
                kind: "comment-block",
                file: f.file,
                line: b.start,
                detail: overBlock
                    ? `${b.length}-line comment block (absolute max ${MAX_COMMENT_BLOCK})`
                    : documents === 0
                    ? `${b.length} comment lines added above unchanged code — prose-only additions belong in docs/`
                    : `${b.length} comment lines documenting ${documents} added code line${
                          documents === 1 ? "" : "s"
                      }` + ` — comment should not outweigh the code (max ${MAX_COMMENT_RATIO}:1)`,
                preview: b.preview.slice(0, 90),
            }
            ;(advisoryOnly(f.file) ? advisory : blocking).push(finding)
        }
        if (f.added >= DENSITY_MIN_ADDED && !isMarkdown(f.file)) {
            const ratio = f.comment / f.added
            if (ratio > DENSITY_ADVISORY) {
                advisory.push({
                    kind: "density",
                    file: f.file,
                    detail: `${(ratio * 100).toFixed(0)}% of added lines are comments (${f.comment}/${f.added})`,
                })
            }
        }
        if (f.mdLines?.length) {
            for (const p of mdParagraphs(f.mdLines)) {
                if (p.words > MD_PARAGRAPH_ADVISORY) {
                    advisory.push({
                        kind: "md-paragraph",
                        file: f.file,
                        detail: `${p.words}-word paragraph (advisory limit ${MD_PARAGRAPH_ADVISORY})`,
                        preview: p.preview,
                    })
                }
            }
        }
    }

    const label = f =>
        `${f.file ? `${f.file}${f.line ? `:${f.line}` : ""} — ` : ""}${f.detail}` +
        (f.preview ? `\n      ${f.preview}` : "")

    if (words !== null) console.log(`Description: ${words} words (budget ${budget}).`)
    console.log(`Diff: ${totalAdded} added lines across ${files.length} scanned file(s).`)

    if (advisory.length > 0) {
        console.log(`\n${advisory.length} advisory finding(s) (not blocking):`)
        for (const f of advisory) console.log(`  [${f.kind}] ${label(f)}`)
    }

    const summary = []
    if (blocking.length === 0) {
        console.log("\nNo blocking bloat findings. OK.")
        summary.push("### PR bloat check", "", "No blocking findings.")
        if (words !== null) summary.push("", `Description: ${words} / ${budget} words.`)
    } else {
        console.error(`\n${blocking.length} blocking bloat finding(s):`)
        for (const f of blocking) console.error(`  [${f.kind}] ${label(f)}${f.fix ? `\n      fix: ${f.fix}` : ""}`)
        console.error(
            "\nCLAUDE.md: a PR description is a couple of sentences; a code comment is one short" +
                "\nline explaining a non-obvious WHY. Move real design rationale into docs/ and link it." +
                "\nIf this PR genuinely needs the length, add the `verbose-ok` label.",
        )
        summary.push(
            "### PR bloat check — FAILED",
            "",
            `${blocking.length} blocking finding(s). CLAUDE.md: descriptions are a couple of sentences; comments are one short line on a non-obvious WHY.`,
            "",
            "| Kind | Where | Problem |",
            "| --- | --- | --- |",
            ...blocking.map(
                f =>
                    `| ${f.kind} | ${f.file ? `\`${f.file}${f.line ? `:${f.line}` : ""}\`` : "PR description"} | ${
                        f.detail
                    } |`,
            ),
            "",
            "Add the `verbose-ok` label if the length is genuinely warranted.",
        )

        const rows = blocking.map(
            f => `| ${f.file ? `\`${f.file}${f.line ? `:${f.line}` : ""}\`` : "_PR description_"} | ${f.detail} |`,
        )
        writeComment([
            "### PR bloat check failed",
            "",
            `${blocking.length} thing${blocking.length === 1 ? "" : "s"} to fix before this can merge.`,
            "",
            "| Where | Problem |",
            "| --- | --- |",
            ...rows,
            "",
            "**How to fix**",
            "",
            `- **Description:** what changed and why, in two or three sentences (${budget}-word ceiling). Drop \`## Summary\` / \`## Test plan\` scaffolding unless there is genuinely something new to test, and drop any tool-attribution trailer.`,
            "- **Comments:** default to none. Add one only where the WHY is non-obvious (a hidden constraint, an invariant, a workaround), and keep it to one line. A comment must not outweigh the code it documents.",
            "- Don't restate what the code does, what a technical term already implies, or what a linked design doc already says. Don't explain what something does _not_ do.",
            "- Real design rationale belongs in `docs/` with a link, not stacked above the code.",
            "",
            'Full guidance: CLAUDE.md, "Commits & PRs". Reproduce locally with `yarn check:pr-bloat`.',
            "",
            "**If the length is genuinely warranted**, add the `verbose-ok` label to bypass this check — that is what it is for. It stays visible on the PR, so the call is on the record.",
            ...(BYPASS
                ? ["", "_An authorized `verbose-ok` bypass is active, so this check is not blocking the merge._"]
                : []),
        ])
    }
    if (advisory.length > 0) {
        summary.push(
            "",
            "<details><summary>Advisory findings (not blocking)</summary>",
            "",
            ...advisory.map(f => `- \`${f.kind}\` ${f.file ?? ""}${f.line ? `:${f.line}` : ""} — ${f.detail}`),
            "",
            "</details>",
        )
    }
    writeSummary(summary)

    if (blocking.length > 0) {
        if (BYPASS) {
            console.error("\nBLOAT_BYPASS set (authorized `verbose-ok` label); reporting only.")
            return
        }
        process.exit(1)
    }
}

try {
    main()
} catch (err) {
    console.error(err.stack ?? err.message ?? String(err))
    process.exit(2)
}
