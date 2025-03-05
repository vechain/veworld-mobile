import path from "path"
import { jsPDF } from "jspdf"

const OUTPUT_DIR = path.join(process.cwd(), "docs", "app-index.pdf")

type Dapp = {
    name: string
    href: string
    desc: string
    category: string
    tags: string[]
    contracts?: string
    repo?: string
    isVeWorldSupported: boolean
    veBetterDaoId: string
    id: string
    createAt: number
}

async function getDappList() {
    try {
        const response = await fetch("https://vechain.github.io/app-hub")
        const data = await response.json()
        return data as Dapp[]
    } catch (error) {
        console.log("Cannot get dapp list", (error as Error).message)
        process.exit(1)
    }
}

async function generateDappsIndex() {
    console.log("Start fetching dapps")

    const dappList = await getDappList()

    console.log("Dapps fetched with success")

    console.log("Start generating index file")
    const doc = new jsPDF({ format: "a4" })

    let yPos = 10
    let itemIdx = 0

    // Loop all the dapps and create pdf file
    dappList.forEach((app, idx) => {
        if (yPos % 280 === 5) {
            // Check if we're near the bottom of the page
            doc.addPage()
            yPos = 10 // Reset Y position for the new page
            itemIdx = 0
        }

        doc.setFontSize(12).setFont("helvetica", "bold")
        doc.text(`${idx + 1}. ${app.name}`, 10, yPos, { align: "left" })

        doc.setFontSize(10).setFont("helvetica", "normal")
        doc.text(`- Developer: ${app.repo ?? "Unknown developer or Private repository"}`, 15, yPos + 5)
        doc.text(`- URL: ${app.href}`, 15, yPos + 10)

        itemIdx += 1
        yPos = 10 + itemIdx * 25
    })

    console.log("Start writing dapps index")
    doc.save(OUTPUT_DIR)
}

;(async () => {
    await generateDappsIndex()
})()
    .catch(() => {
        console.log("Could not generate dapps index")
        process.exit(1)
    })
    .then(() => {
        console.log("Dapps index generated with success")
        process.exit(0)
    })
