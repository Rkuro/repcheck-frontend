export function mapAreaId(areaId) {

    if (areaId === 'ocd-division/country:us') {
        return 'federal'
    }
    if (areaId.match(/^ocd-division\/country:us\/state:[a-z]{2}$/)) {
        return 'state'
    }

    return 'local'
}


// unitedstates.io is no longer maintained
export function replaceUrlPrefix(url) {

    if (url === null || url === undefined) {
        return url;
    }
    const oldPrefix = "https://theunitedstates.io";
    const newPrefix = "https://unitedstates.github.io";
    
    if (url.startsWith(oldPrefix)) {
        return url.replace(oldPrefix, newPrefix);
    }
    return url; // Return the original URL if it doesn't start with the old prefix
}