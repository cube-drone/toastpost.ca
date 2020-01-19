

const changeWindow = () => {
    /*
        trigger this when something changes the window size
    */
    return {
        type: "CHANGE_WINDOW"
    }
};

module.exports = {
    changeWindow,
}