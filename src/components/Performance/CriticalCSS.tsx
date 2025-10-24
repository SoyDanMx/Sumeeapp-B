'use client';

import React from 'react';

// CSS crítico inline para mejorar First Contentful Paint
export default function CriticalCSS() {
  return (
    <style jsx global>{`
      /* Critical CSS para above-the-fold content */
      * {
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #fff;
      }
      
      /* Header crítico */
      .header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 50;
        background: #fff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        height: 80px;
      }
      
      /* Hero section crítico */
      .hero {
        padding-top: 100px;
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      
      .hero h1 {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 1rem;
        line-height: 1.2;
      }
      
      .hero p {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        opacity: 0.9;
      }
      
      /* Botones críticos */
      .btn-primary {
        background: #4F46E5;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        display: inline-block;
        transition: background-color 0.2s;
        border: none;
        cursor: pointer;
      }
      
      .btn-primary:hover {
        background: #4338CA;
      }
      
      /* Loading states críticos */
      .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #4F46E5;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* Responsive crítico */
      @media (max-width: 768px) {
        .hero h1 {
          font-size: 2rem;
        }
        
        .hero p {
          font-size: 1rem;
        }
        
        .header {
          height: 60px;
        }
        
        .hero {
          padding-top: 80px;
        }
      }
      
      /* Preload hints */
      .preload-fonts {
        font-display: swap;
      }
    `}</style>
  );
}
