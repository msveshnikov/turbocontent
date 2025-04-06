import { enrichMetadata } from './utils.js'; // Assuming utils.js is in the same directory

// ... inside an Express route handler or similar server-side logic

app.get('/presentation/:slug', async (req, res) => { const slug = req.params.slug; let htmlContent =
`         <!DOCTYPE html>         <html>         <head>             <title>Original Title</title>             <meta name="description" content="Original description">         </head>         <body>             <h1>Presentation Content</h1>         </body>         </html>     `;

    const enrichedHtml = await enrichMetadata(htmlContent, slug);
    res.send(enrichedHtml);

});
