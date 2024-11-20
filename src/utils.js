export function mapLevel(levelStr) {
    const map = {
        country: "Federal",
        state: "State",
        municipality: "Municipality"
    }
    return map[levelStr]
}