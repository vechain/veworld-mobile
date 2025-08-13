const React = require("react")

/**
 * BottomSheetModal mock. The implementation is partially taken from v5, with some minor adjustments
 */
class BottomSheetModal extends React.Component {
    // Store mock data passed via present
    data = null

    snapToIndex() {}
    snapToPosition() {}
    expand() {}
    collapse() {}
    close() {
        this.data = null
    }
    forceClose() {
        this.data = null
    }
    present(data) {
        this.data = data
        if (data !== null && data !== undefined) this.forceUpdate()
    }
    dismiss() {
        this.data = null
    }

    render() {
        const { children: Content } = this.props
        if (typeof Content !== "function") return Content
        if (this.data === null || this.data === undefined) return null
        return Content({ data: this.data })
    }
}

module.exports = {
    BottomSheetFlatList: ({ data, renderItem }) => {
        return data.map(row => renderItem({ item: row }))
    },
    BottomSheetSectionList: ({ sections, renderItem }) => {
        return sections.flatMap(s => s.data).map(row => renderItem({ item: row }))
    },
    BottomSheetModal,
}
