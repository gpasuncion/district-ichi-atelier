# district-ichi-atelier
Customized Atelier Shopify theme for Convert Technical Assessment.

## Local build

This project uses Vite to compile the React-based Lookbook component into the Shopify theme assets.

1. Install dependencies:
   npm install
2. Start a development watch build:
   npm run dev
3. Or build once for production:
   npm run build

The build writes the compiled bundle to `assets/react-lookbook.bundle.js`, which is then loaded by the theme via `layout/theme.liquid`.

## Adding the Lookbook component

The Lookbook UI is implemented in `src/components/Lookbook.jsx` and mounted from `src/index.jsx` using any element with the `lookbook` class.

To add it to a Shopify theme:

1. Make sure the bundled script has been built (`npm run build` or `npm run dev`).
2. Add the `Lookbook` section to the theme from `sections/lookbook.liquid`.
3. In the theme editor, choose one or more Lookbook metaobjects from the section settings.
4. On product pages, the section automatically detects matching Lookbooks for the current product and ignores the manual selection.

The section renders a `div` with the required dataset attributes, including selected lookbook handles and translated labels, which the React app consumes at runtime.

Example section usage:

- section file: `sections/lookbook.liquid`
- bundle entry: `src/index.jsx`
- generated asset: `assets/react-lookbook.bundle.js`

## Notes

- `npm run dev` runs Vite in watch mode for iterative front-end development.
- `npm run build` produces the optimized static bundle used by the Shopify storefront.
