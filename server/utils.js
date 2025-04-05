import { load } from 'cheerio';

export const enrichMetadata = async (html, slug) => {
    try {
        if (!slug) return html;

        const presentation =
            (await Presentation.findOne({ slug })) || (await Presentation.findById(slug));
        if (!presentation) return html;

        const slidesSummary =
            Array.isArray(presentation.slides) && presentation.slides.length
                ? presentation
                      .slides()
                      .map((slide, i) => `Slide ${i + 1}: ${slide.title || 'Untitled'}`)
                      .join('. ')
                : '';

        const $ = load(html);
        $('title').text(`${presentation.title} | Turbocontent.art`);
        $('meta[name="description"]').attr(
            'content',
            presentation.description ||
                `An engaging presentation created with Turbocontent.art${
                    Array.isArray(presentation.slides) && presentation.slides.length
                        ? ' featuring ' + presentation.slides.length + ' slides.'
                        : '.'
                }`
        );
        $('meta[property="og:title"]').attr('content', presentation.title);
        $('meta[property="og:description"]').attr(
            'content',
            presentation.description || 'An engaging presentation created with Turbocontent.art.'
        );
        $('meta[property="og:url"]').attr(
            'content',
            `https://Turbocontent.art/presentation/${presentation.slug}`
        );

        let imageUrl = '';
        if (presentation.theme && presentation.theme.imageUrl) {
            imageUrl = presentation.theme.imageUrl;
        } else if (
            Array.isArray(presentation.slides) &&
            presentation.slides.length &&
            presentation.slides[0].image
        ) {
            imageUrl = presentation.slides[0].image;
        } else {
            imageUrl = 'https://Turbocontent.art/image2.jpg';
        }
        $('meta[property="og:image"]').attr('content', imageUrl);

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: presentation.title,
            description: presentation.description,
            version: presentation.version,
            slideCount: Array.isArray(presentation.slides) ? presentation.slides.length : 0,
            hasPart: Array.isArray(presentation.slides)
                ? presentation.slides.map((slide, index) => ({
                      '@type': 'CreativeWork',
                      position: index + 1,
                      name: slide.title || `Slide ${index + 1}`,
                      text: slide.content || ''
                  }))
                : []
        };

        $('head').append(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
        if (slidesSummary) {
            $('body').append(`<div style="display:none">${slidesSummary}</div>`);
        }
        return $.html();
    } catch {
        return html;
    }
};

export const getIpFromRequest = (req) => {
    let ips = (
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        ''
    ).split(',');
    return ips[0].trim();
};

export const sendErrorResponse = (res, statusCode, message, details = null) => {
    console.error(`Error Response ${statusCode}: ${message}`, details);
    return res.status(statusCode).json({ error: message, details });
};
