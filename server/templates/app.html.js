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
    <meta name="description" content="${description}" />
    <link rel="stylesheet" href="/public/css/reset.css">
    <link rel="stylesheet" href="/public/css/style.css">
    
    <link href="https://fonts.googleapis.com/css?family=Arvo:400,400i,700,700i|Dancing+Script:400,500,600,700|Libre+Baskerville:400,400i,700&display=swap" rel="stylesheet"> 
    
  </head>
  <body>
    <h1>${title}</h1>
    <h2>${description}</h2>
    <div id="app"></div>
    ${assets}
  </body>
</html>
`;
    return responseHtml;
}