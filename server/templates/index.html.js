/*
    Our homepage!
*/

module.exports = ({javascriptAssets=[], title, description}) => {

    let assets = javascriptAssets.map(asset => `<script src="${asset}"></script>`);

    let clientId = "5i1o1c21nm66l94564araih1rh";
    let redirectUri = "http://localhost:40000/authenticated";

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
    
    <p>Hey, this is the homepage. Nothing here yet, but, y'know, sales pitch.</p>
    <a href="https://toastpost.auth.us-west-2.amazoncognito.com/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}">Do a login here.</a>
    ${assets}
  </body>
</html>
`;
    return responseHtml;
}