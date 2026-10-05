import React from 'react';
import { createRoot } from 'react-dom/client';
// TODO: Add support for dynamic events and multiple components (currently this only supports one Lookbook component per page)
import Lookbook from './components/Lookbook.jsx';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lookbook').forEach((mount) => {
    const dataset = mount.dataset;
    const selectedHandles = dataset.selectedHandles ? dataset.selectedHandles.split(',') : [];

    const translations = {
      curatedProducts: dataset.textShop || 'Shop the Look',
      previousLook: dataset.textPrev || 'Previous Look',
      nextLook: dataset.textNext || 'Next Look',
      viewProduct: dataset.textView || 'View',
      styledIn: dataset.textStyled || 'Styled in Lookbooks',
      lookCounter: dataset.textCounter || 'Look current of total',
    };

    createRoot(mount).render(
      <Lookbook 
        isProductPage={dataset.isProductPage === 'true'}
        productId={dataset.productId}
        selectedHandles={selectedHandles}
        themeSettings={{ bgColor: dataset.bgColor }}
        translations={translations}
      />
    );
  });
});