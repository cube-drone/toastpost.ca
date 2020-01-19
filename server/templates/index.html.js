/*
    Our homepage!
*/

module.exports = ({javascriptAssets=[], title, description}) => {

    let assets = javascriptAssets.map(asset => `<script src="${asset}"></script>`);

    let responseHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <description>${description}</description>
    <link rel="stylesheet" href="/public/css/reset.css">
    <link rel="stylesheet" href="/public/css/style.css">
  </head>
  <body>
    <div id="app"></div>
    ${assets}
  </body>
</html>
`;
    return responseHtml;
}