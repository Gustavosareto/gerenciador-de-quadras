import React from 'react';

interface LocalBusinessSchemaProps {
  name: string;
  description: string;
  url: string;
  image?: string;
  telephone?: string | null;
  address?: string | null;
  priceRange?: string;
  price?: number;
  type?: 'SportsActivityLocation' | 'LocalBusiness' | 'HealthAndBeautyBusiness';
}

export function LocalBusinessSchema({
  name,
  description,
  url,
  image,
  telephone,
  address,
  priceRange = '$$',
  price,
  type = 'SportsActivityLocation',
}: LocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    image: image || 'https://agendouu.com/og-image.jpg', // url default
    description,
    url,
    telephone: telephone || '+55',
    priceRange,
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: address,
        addressCountry: 'BR',
      },
    }),
    ...(price && {
        offers: {
            '@type': 'Offer',
            priceCurrency: 'BRL',
            price: price.toFixed(2),
            availability: 'https://schema.org/InStock',
        }
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
