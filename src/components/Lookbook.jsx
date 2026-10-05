import React, { useEffect, useState, memo } from 'react';

// GraphQL to get Lookbook contents from metaobject
const LOOKBOOKS_QUERY = `
  query getLookbooks {
    metaobjects(type: "lookbook", first: 50) {
      nodes {
        handle
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                width
                height
              }
            }
          }
          references(first: 10) {
            nodes {
              ... on Product {
                id
                title
                handle
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                featuredImage {
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Format and get the metaobject data
const formatMetaobjectData = (nodes) => {
  return nodes.map(node => {
    const lb = { handle: node.handle, products: [] }; 
    
    node.fields.forEach(field => {
      if (field.key === 'title') lb.title = field.value;
      if (field.key === 'description') lb.description = field.value;
      if (field.key === 'products') {
        lb.products = field.references?.nodes || [];
      }
      if (field.key === 'image' && field.reference?.image) {
        lb.image = field.reference.image.url;
        lb.imageWidth = field.reference.image.width;
        lb.imageHeight = field.reference.image.height;
      }
    });
    return lb;
  });
};

// Helper to format price based on Shopify's locale and currency code (TODO: Consider moving this to a utility file if used elsewhere)
const formatPrice = (amount, currencyCode) => {
  return new Intl.NumberFormat(window.Shopify?.locale || 'en-AU', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

// Lookbook Product Cards
const LookbookCard = memo(({ lookbook, translations }) => (
  <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '30px' }}>
    {/* Lookbook Hero Side */}
    <div style={{ flex: '1', minWidth: '300px' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>{lookbook.title}</h2>
      <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>{lookbook.description}</p>
      {lookbook.image && (
        <img 
          src={lookbook.image} 
          alt={lookbook.title}
          width={lookbook.imageWidth} 
          height={lookbook.imageHeight} 
          loading="lazy" 
          decoding="async" 
          style={{ 
            width: '100%', 
            height: 'auto',            
            maxHeight: '450px',       
            objectFit: 'cover', 
            borderRadius: '8px' 
          }} 
        />
      )}
    </div>

    {/* Products */}
    <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', fontSize: '1.75rem' }}>
        {translations.curatedProducts}
      </h3>
      {lookbook.products?.map(product => (
        <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#fff', padding: '10px', borderRadius: '4px' }}>
          {product.featuredImage && (
            <img 
              src={product.featuredImage.url} 
              alt={product.featuredImage.altText || product.title} 
              width={product.featuredImage.width}  
              height={product.featuredImage.height} 
              loading="lazy" 
              decoding="async"
              style={{ 
                width: '70px', 
                height: '90px', 
                objectFit: 'cover',
                borderRadius: '4px'
              }} 
            />
          )}
          <div style={{ flexGrow: 1 }}>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem' }}>{product.title}</h4>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
            </p>
          </div>
          <button onClick={() => window.location.href = `/products/${product.handle}`} className="button">
            {translations.viewProduct} 
          </button>
        </div>
      ))}
    </div>
  </div>
));

// Main Component
const Lookbook = ({ isProductPage, productId, selectedHandles, themeSettings, translations }) => {
  const [lookbooks, setLookbooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // New state to manage fade opacity transition
  const [isFadeIn, setIsFadeIn] = useState(true);

  useEffect(() => {
    const fetchLookbooks = async () => {
      try {
        const response = await fetch('/api/2024-01/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': window.SHOPIFY_STOREFRONT_TOKEN,
          },
          body: JSON.stringify({ query: LOOKBOOKS_QUERY }),
        });

        const { data } = await response.json();
        const allLookbooks = formatMetaobjectData(data.metaobjects.nodes);

        let filteredLookbooks = [];

        if (isProductPage && productId) {
          filteredLookbooks = allLookbooks.filter(lb => 
            lb.products.some(product => product.id === productId)
          ).slice(0, 2);
        } else {
          if (selectedHandles && selectedHandles.length > 0) {
            filteredLookbooks = selectedHandles
              .map(handle => allLookbooks.find(lb => lb.handle === handle))
              .filter(Boolean);
          } else {
            filteredLookbooks = allLookbooks;
          }
        }

        setLookbooks(filteredLookbooks);
      } catch (error) {
        console.error("Error fetching Lookbooks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLookbooks();
  }, [isProductPage, productId, selectedHandles]);

  // Transition when changing active lookbook (homepage)
  const handleSlideChange = (newIndex) => {
    setIsFadeIn(false); 
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsFadeIn(true); 
    }, 200); 
  };

  if (loading) return <div>Loading Lookbooks...</div>;
  if (!lookbooks.length) return null;

  if (isProductPage) {
    return (
      <div style={{ backgroundColor: themeSettings.bgColor, padding: '40px 20px' }}>
        <h3 style={{ marginBottom: '20px' }}>{translations.styledIn}</h3>
        {lookbooks.map((lookbook) => (
          <LookbookCard 
            key={lookbook.handle} 
            lookbook={lookbook} 
            translations={translations} 
          />
        ))}
      </div>
    );
  }

  const currentLookbook = lookbooks[currentIndex];
  const counterText = translations.lookCounter
    .replace('current', currentIndex + 1)
    .replace('total', lookbooks.length);

  return (
    <div style={{ backgroundColor: themeSettings.bgColor, padding: '50px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{
          opacity: isFadeIn ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out',
        }}>
          <LookbookCard 
            lookbook={currentLookbook} 
            translations={translations} 
          />
        </div>
        
        {/* Slider Controls (Homepage) */}
        {lookbooks.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' }}>
            {currentIndex === 0 && (
              <span>&nbsp;</span>
            )}
            {currentIndex > 0 && (
              <button 
                onClick={() => handleSlideChange(currentIndex === 0 ? lookbooks.length - 1 : currentIndex - 1)} 
                className="button">
                &larr; {translations.previousLook}
              </button>
            )}
            <span>{counterText}</span>
            <button 
              onClick={() => handleSlideChange(currentIndex === lookbooks.length - 1 ? 0 : currentIndex + 1)} 
              className="button">
              {translations.nextLook} &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lookbook;