
const metronomeState = (state) => {
    return {
        type: "METRONOME_STATE",
        state,
    }
};

const metronomeActive = () => {
    return {
        type: "METRONOME_ACTIVE",
    }
};

const metronomeInactive = () => {
    return {
        type: "METRONOME_INACTIVE",
    }
};

module.exports = {
    metronomeState,
    metronomeActive,
    metronomeInactive,
}