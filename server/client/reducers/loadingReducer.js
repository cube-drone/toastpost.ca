
let defaultState = {
    fullyLoaded: false,
    resources: {},
    numberOfAssetsLoaded: 0,
};

module.exports = function reducer(state=defaultState, action) {

    switch (action.type) {
        case "PARTIALLY_LOADED": {
            return {
                ...state,
                numberOfAssetsLoaded: state.numberOfAssetsLoaded + 1,
            }
        }

        case "FULLY_LOADED": {
            return {
                fullyLoaded: true,
                numberOfAssetsLoaded: Object.keys(action.resources).length,
                resources: action.resources,
            }
        }
    }

    return state;
}