import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from './ProductCard';
import { fetchProducts } from '../services/api';

const getItemsPerView = () => {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
};


const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());
  const carouselRef = useRef(null);
  const progressBarRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartIndexRef = useRef(0);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const [isMouseDragging, setIsMouseDragging] = useState(false);
  const mouseDragStartXRef = useRef(0);
  const mouseDragStartIndexRef = useRef(0);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToItem = (index) => {
    if (!carouselRef.current) return;
    const { scrollWidth } = carouselRef.current;
    const itemWidth = scrollWidth / products.length;
    const scrollLeft = itemWidth * index;
    
    carouselRef.current.scrollTo({
      left: scrollLeft,
      behavior: 'smooth'
    });
    
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    const maxIndex = products.length - itemsPerView;
    const newIndex = Math.min(currentIndex + 1, maxIndex);
    scrollToItem(newIndex);
  };

  const prevSlide = () => {
    const newIndex = Math.max(currentIndex - 1, 0);
    scrollToItem(newIndex);
  };

  const handleProgressBarClick = (e) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressBarWidth = rect.width;
    const maxIndex = products.length - itemsPerView;
    
    const newIndex = Math.round((clickX / progressBarWidth) * maxIndex);
    const clampedIndex = Math.max(0, Math.min(newIndex, maxIndex));
    
    scrollToItem(clampedIndex);
  };

  const handleDragStart = useCallback((e) => {
    setIsDragging(true);
    dragStartXRef.current = e.clientX;
    dragStartIndexRef.current = currentIndex;
    e.preventDefault();
  }, [currentIndex]);
  
  const handleDragMove = useCallback((e) => {
    if (!isDragging || !progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const progressBarWidth = rect.width;
    const maxIndex = products.length - itemsPerView;
    if (maxIndex <= 0) return;

    const deltaX = e.clientX - dragStartXRef.current;
    const indexPerPixel = maxIndex / progressBarWidth;
    const deltaIndex = deltaX * indexPerPixel;
    
    const newIndex = dragStartIndexRef.current + deltaIndex;
    const clampedIndex = Math.round(Math.max(0, Math.min(newIndex, maxIndex)));

    scrollToItem(clampedIndex);
  }, [isDragging, products.length, itemsPerView]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const progressPercentage = products.length > itemsPerView
    ? (currentIndex / (products.length - itemsPerView)) * 100
    : 0;

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < products.length - itemsPerView;

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches.length === 1) {
      touchEndXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    const deltaX = touchEndXRef.current - touchStartXRef.current;
    const threshold = 50; 
    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0 && canGoRight) {
        nextSlide(); 
      } else if (deltaX > 0 && canGoLeft) {
        prevSlide(); 
      }
    }
    touchStartXRef.current = 0;
    touchEndXRef.current = 0;
  };

  
  const handleWheel = (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (e.deltaX > 0 && canGoRight) {
        nextSlide();
      } else if (e.deltaX < 0 && canGoLeft) {
        prevSlide();
      }
    } else {
      if (e.deltaY > 0 && canGoRight) {
        nextSlide();
      } else if (e.deltaY < 0 && canGoLeft) {
        prevSlide();
      }
    }
    e.preventDefault();
  };

  const handleMouseDown = (e) => {
    setIsMouseDragging(true);
    mouseDragStartXRef.current = e.clientX;
    mouseDragStartIndexRef.current = currentIndex;
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isMouseDragging) return;
    const deltaX = e.clientX - mouseDragStartXRef.current;
    const threshold = 50; 
    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0 && canGoRight) {
        nextSlide();
        setIsMouseDragging(false);
      } else if (deltaX > 0 && canGoLeft) {
        prevSlide();
        setIsMouseDragging(false);
      }
    }
  };

  const handleMouseUp = () => {
    setIsMouseDragging(false);
  };

  useEffect(() => {
    if (isMouseDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMouseDragging]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const wheelHandler = (e) => handleWheel(e);
    carousel.addEventListener('wheel', wheelHandler, { passive: false });
    return () => {
      carousel.removeEventListener('wheel', wheelHandler);
    };
  }, [carouselRef, canGoLeft, canGoRight, currentIndex, itemsPerView, products.length]);

  if (loading) {
    return (
      <div className="product-list-container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="product-list-wrapper">
        {canGoLeft && (
          <button className="nav-arrow prev" onClick={prevSlide}>
            <svg viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        <div ref={carouselRef} className="product-carousel"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          style={{ cursor: isMouseDragging ? 'grabbing' : 'grab' }}
        >
          {products.map((product, index) => (
            <ProductCard key={product.id || index} product={product} />
          ))}
        </div>
        
        {canGoRight && (
          <button className="nav-arrow next" onClick={nextSlide}>
            <svg viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      
      <div 
        ref={progressBarRef}
        className="progress-bar"
        onClick={handleProgressBarClick}
      >
        <div 
          className="progress-thumb" 
          style={{ left: `calc(${progressPercentage}% - 25px)` }}
          onMouseDown={handleDragStart}
        />
      </div>
    </div>
  );
};

export default ProductList; 