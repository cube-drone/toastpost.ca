const path = require('path');

const express = require('express');
const browserify = require('browserify-middleware');            // Resolves dependency chains, zips, and minifies client code.
const babelify = require('babelify');                           // Converts ES6 into safe, stable ES5

module.exports = ({app}) => {

    // The /public folder is for straight-up static assets.
    app.use('/public', express.static(path.join(__dirname, '..', '/public')));

    var babelifyPresets = function(file) {
        return babelify(file, {'plugins': ['@babel/plugin-transform-runtime'], 'presets': [['@babel/preset-env', {
                "targets": "> 0.25%, not dead"
            }], '@babel/preset-react']});
    };
    // The /client folder gets compiled, using browserify, then served.
    browserify.settings({
        transform: [babelifyPresets],
        extensions: ['.js', '.jsx'],
        grep: /\.jsx?$/,
    });

    const clientAppPath = path.normalize(path.join(__dirname, '..',  '/client'));

    app.use('/client', browserify(clientAppPath, {}));

};