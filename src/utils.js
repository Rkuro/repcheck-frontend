export function mapJurisdictionLevel(jurisdictionAreaId) {

    if (jurisdictionAreaId === 'ocd-division/country:us') {
        return 'federal'
    }
    if (jurisdictionAreaId.match(/^ocd-division\/country:us\/state:[a-z]{2}$/)) {
        return 'state'
    }

    return 'local'
}