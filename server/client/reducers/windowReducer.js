
const idealSquare = 600;

const defaultState = {
    width: window.innerWidth,
    height: window.innerHeight,
    square: Math.min(window.innerHeight, window.innerWidth),
    scale: Math.min(window.innerHeight, window.innerHeight) / idealSquare,
    active: true,
};

module.exports = function reducer(state=defaultState, action) {

    switch (action.type) {
        case "CHANGE_WINDOW": {
            return {
                ...state,
                width: window.innerWidth,
                height: window.innerHeight,
                square: Math.min(window.innerHeight, window.innerWidth),
                scale: Math.min(window.innerHeight, window.innerHeight) / idealSquare,
            }
        }
    }

    return state;
}