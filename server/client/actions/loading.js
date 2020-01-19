
const partiallyLoaded = (resource) => {
    return {
        type: "PARTIALLY_LOADED",
        resource,
    }
};

const fullyLoaded = (resources) => {
    return {
        type: "FULLY_LOADED",
        resources
    }
};

module.exports = {
    partiallyLoaded,
    fullyLoaded,
}