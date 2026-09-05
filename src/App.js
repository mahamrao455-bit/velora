import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/products";

const categories = [
  { name: "All", count: "24+" },
  { name: "Women", count: "10+" },
  { name: "Men", count: "6+" },
  { name: "Shoes", count: "4" },
  { name: "Bags", count: "4" },
  { name: "Accessories", count: "4" }
];

function App() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [quickView, setQuickView] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load products");
        }

        return response.json();
      })
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setApiError("Could not connect to the Velora product server.");
        setLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "All") {
      result = result.filter(
        (product) => product.category === activeCategory
      );
    }

    if (search.trim()) {
      const term = search.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.category.toLowerCase().includes(term) ||
          product.subcategory.toLowerCase().includes(term)
      );
    }

    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sort === "newest") {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [products, activeCategory, search, sort]);

  const saleProducts = products.filter((product) => product.oldPrice);
  const newProducts = products.filter((product) => product.badge === "NEW");

  const toggleWishlist = (productId) => {
    setWishlist((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  };

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setCartOpen(true);
  };

  const changeQuantity = (productId, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + amount) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cart.reduce(
    (total, product) => total + product.quantity,
    0
  );

  const cartTotal = cart.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  const scrollToShop = () => {
    document.getElementById("shop")?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const ProductCard = ({ product }) => {
    const isWishlisted = wishlist.includes(product.id);

    return (
      <article className="product-card">
        <div className="product-image-wrap">
          {product.badge && (
            <span className={`product-badge ${product.badge === "SALE" ? "sale-badge" : ""}`}>
              {product.badge}
            </span>
          )}

          <button
            className={`heart-button ${isWishlisted ? "active" : ""}`}
            onClick={() => toggleWishlist(product.id)}
            aria-label="Wishlist"
          >
            {isWishlisted ? "♥" : "♡"}
          </button>

          <img src={product.image} alt={product.name} />

          <div className="product-overlay">
            <button onClick={() => setQuickView(product)}>
              Quick View
            </button>
          </div>
        </div>

        <div className="product-info">
          <div className="product-category">
            {product.category} / {product.subcategory}
          </div>

          <h3>{product.name}</h3>

          <div className="rating-row">
            <span>★ {product.rating}</span>
            <small>({product.reviews})</small>
          </div>

          <div className="price-row">
            <strong>${product.price}</strong>

            {product.oldPrice && (
              <span className="old-price">${product.oldPrice}</span>
            )}
          </div>

          <button
            className="add-button"
            onClick={() => addToCart(product)}
          >
            Add to Bag
          </button>
        </div>
      </article>
    );
  };

  return (
    <div className="velora-app">
      <div className="announcement-bar">
        Free shipping on orders over $150 · Easy 30-day returns
      </div>

      <header className="navbar">
        <div className="nav-left">
          <button
            className="menu-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            ☰
          </button>

          <button
            className="nav-link"
            onClick={() => {
              setActiveCategory("Women");
              scrollToShop();
            }}
          >
            Women
          </button>

          <button
            className="nav-link"
            onClick={() => {
              setActiveCategory("Men");
              scrollToShop();
            }}
          >
            Men
          </button>

          <button
            className="nav-link"
            onClick={() => {
              setActiveCategory("Shoes");
              scrollToShop();
            }}
          >
            Shoes
          </button>
        </div>

        <button
          className="logo"
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });
          }}
        >
          VELORA
        </button>

        <div className="nav-right">
          <div className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
            />
          </div>

          <button
            className="icon-button"
            onClick={() =>
              document
                .getElementById("shop")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            ◎
          </button>

          <button
            className="icon-button bag-icon"
            onClick={() => setCartOpen(true)}
          >
            ♧
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
        </div>
      </header>

      {mobileMenu && (
        <div className="mobile-menu">
          {categories.slice(1).map((category) => (
            <button
              key={category.name}
              onClick={() => {
                setActiveCategory(category.name);
                scrollToShop();
                setMobileMenu(false);
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">THE NEW EDIT</p>
            <h1>
              Everyday pieces.
              <br />
              Elevated.
            </h1>
            <p className="hero-description">
              Modern essentials designed for a wardrobe that moves with you.
            </p>

            <button className="primary-button" onClick={scrollToShop}>
              Shop New Arrivals →
            </button>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1500&q=90"
              alt="Velora fashion collection"
            />
          </div>
        </section>

        <section className="category-strip">
          <div>
            <span>01</span>
            <strong>Curated</strong>
            <p>Premium everyday pieces</p>
          </div>

          <div>
            <span>02</span>
            <strong>Versatile</strong>
            <p>Made to mix and match</p>
          </div>

          <div>
            <span>03</span>
            <strong>Timeless</strong>
            <p>Designed beyond trends</p>
          </div>

          <div>
            <span>04</span>
            <strong>Considered</strong>
            <p>Quality in every detail</p>
          </div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div>
              <p className="eyebrow">SHOP VELORA</p>
              <h2>Everything you need.</h2>
            </div>

            <p>
              Discover clothing, footwear, bags and accessories designed
              around effortless everyday style.
            </p>
          </div>

          <div className="category-tabs">
            {categories.map((category) => (
              <button
                key={category.name}
                className={
                  activeCategory === category.name ? "active" : ""
                }
                onClick={() => setActiveCategory(category.name)}
              >
                {category.name}
                <sup>{category.count}</sup>
              </button>
            ))}
          </div>

          <div className="shop-toolbar">
            <span>
              {filteredProducts.length} products
              {search ? ` for "${search}"` : ""}
            </span>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="featured">Sort: Featured</option>
              <option value="newest">Sort: Newest</option>
              <option value="rating">Sort: Rating</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {loading && (
            <div className="status-message">
              Loading Velora collection...
            </div>
          )}

          {apiError && (
            <div className="status-message error">
              {apiError}
              <br />
              Make sure your backend is running on port 5000.
            </div>
          )}

          {!loading && !apiError && (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!loading && !apiError && filteredProducts.length === 0 && (
            <div className="empty-state">
              No products found.
            </div>
          )}
        </section>

        <section className="featured-banner">
          <div>
            <p className="eyebrow">THE VELORA STANDARD</p>
            <h2>
              More products.
              <br />
              More ways to style them.
            </h2>
            <p>
              Build your wardrobe around refined basics, standout pieces
              and accessories that finish the look.
            </p>

            <button
              className="secondary-button"
              onClick={() => {
                setActiveCategory("Women");
                scrollToShop();
              }}
            >
              Explore Women
            </button>
          </div>

          <div className="featured-list">
            <div>
              <span>01</span>
              <strong>New Arrivals</strong>
            </div>
            <div>
              <span>02</span>
              <strong>Best Sellers</strong>
            </div>
            <div>
              <span>03</span>
              <strong>Everyday Essentials</strong>
            </div>
            <div>
              <span>04</span>
              <strong>Seasonal Sale</strong>
            </div>
          </div>
        </section>

        <section className="product-showcase">
          <div className="showcase-heading">
            <div>
              <p className="eyebrow">NEW IN</p>
              <h2>Just dropped.</h2>
            </div>

            <button
              onClick={() => {
                setActiveCategory("All");
                setSort("newest");
                scrollToShop();
              }}
            >
              View all →
            </button>
          </div>

          <div className="mini-product-grid">
            {newProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="product-showcase light-section">
          <div className="showcase-heading">
            <div>
              <p className="eyebrow">SALE</p>
              <h2>Less. Not ordinary.</h2>
            </div>

            <button
              onClick={() => {
                setActiveCategory("All");
                scrollToShop();
              }}
            >
              Shop sale →
            </button>
          </div>

          <div className="mini-product-grid">
            {saleProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="reviews-section">
          <p className="eyebrow">THE VELORA EDIT</p>
          <h2>What shoppers are saying.</h2>

          <div className="review-grid">
            <article>
              <div>★★★★★</div>
              <p>
                “The tailoring, fabric and fit are genuinely impressive.
                Everything feels much more premium than the price suggests.”
              </p>
              <strong>— Amelia R.</strong>
            </article>

            <article>
              <div>★★★★★</div>
              <p>
                “Velora has become my go-to for everyday pieces that still
                look polished.”
              </p>
              <strong>— Sofia M.</strong>
            </article>

            <article>
              <div>★★★★★</div>
              <p>
                “The shoes and bags are especially beautiful. Minimal,
                versatile and actually wearable.”
              </p>
              <strong>— Chloe K.</strong>
            </article>
          </div>
        </section>

        <section className="newsletter-section">
          <p className="eyebrow">VELORA NOTES</p>
          <h2>10% off your first order.</h2>
          <p>
            Sign up for new arrivals, private drops and occasional offers.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              alert("You're on the list ✦");
              event.currentTarget.reset();
            }}
          >
            <input
              type="email"
              placeholder="Your email address"
              required
            />
            <button type="submit">Subscribe →</button>
          </form>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <div className="logo">VELORA</div>
          <p>
            Modern fashion for everyday living.
          </p>
        </div>

        <div className="footer-column">
          <h4>Shop</h4>
          <button onClick={() => setActiveCategory("Women")}>Women</button>
          <button onClick={() => setActiveCategory("Men")}>Men</button>
          <button onClick={() => setActiveCategory("Shoes")}>Shoes</button>
          <button onClick={() => setActiveCategory("Bags")}>Bags</button>
        </div>

        <div className="footer-column">
          <h4>Help</h4>
          <button>Shipping</button>
          <button>Returns</button>
          <button>Size Guide</button>
          <button>Contact</button>
        </div>

        <div className="footer-column">
          <h4>Follow</h4>
          <button>Instagram</button>
          <button>Pinterest</button>
          <button>TikTok</button>
        </div>
      </footer>

      <div className="footer-bottom">
        <span>© 2026 Velora Studio</span>
        <span>Designed for modern wardrobes.</span>
      </div>

      {quickView && (
        <div className="modal-backdrop" onClick={() => setQuickView(null)}>
          <div
            className="quick-view"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setQuickView(null)}
            >
              ×
            </button>

            <div className="quick-view-image">
              <img src={quickView.image} alt={quickView.name} />
            </div>

            <div className="quick-view-content">
              <p className="eyebrow">{quickView.category}</p>

              <h2>{quickView.name}</h2>

              <div className="rating-row large-rating">
                ★ {quickView.rating} · {quickView.reviews} reviews
              </div>

              <div className="quick-price">
                ${quickView.price}

                {quickView.oldPrice && (
                  <span>${quickView.oldPrice}</span>
                )}
              </div>

              <p>
                Designed with a refined silhouette, premium feel and
                effortless styling in mind.
              </p>

              <div className="option-block">
                <strong>Available sizes</strong>

                <div className="option-list">
                  {quickView.sizes.map((size) => (
                    <span key={size}>{size}</span>
                  ))}
                </div>
              </div>

              <div className="option-block">
                <strong>Colors</strong>

                <div className="option-list">
                  {quickView.colors.map((color) => (
                    <span key={color}>{color}</span>
                  ))}
                </div>
              </div>

              <button
                className="primary-button full-button"
                onClick={() => {
                  addToCart(quickView);
                  setQuickView(null);
                }}
              >
                Add to Bag
              </button>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
          <aside
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-header">
              <div>
                <p className="eyebrow">YOUR BAG</p>
                <h2>{cartCount} items</h2>
              </div>

              <button onClick={() => setCartOpen(false)}>×</button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">♧</div>
                <h3>Your bag is empty.</h3>
                <p>Add something you love from the collection.</p>

                <button
                  className="primary-button"
                  onClick={() => {
                    setCartOpen(false);
                    scrollToShop();
                  }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((product) => (
                    <div className="cart-item" key={product.id}>
                      <img src={product.image} alt={product.name} />

                      <div className="cart-item-content">
                        <h4>{product.name}</h4>
                        <span>{product.category}</span>

                        <strong>${product.price}</strong>

                        <div className="quantity-controls">
                          <button
                            onClick={() =>
                              changeQuantity(product.id, -1)
                            }
                          >
                            −
                          </button>

                          <span>{product.quantity}</span>

                          <button
                            onClick={() =>
                              changeQuantity(product.id, 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>${cartTotal.toFixed(2)}</strong>
                  </div>

                  <small>
                    Shipping calculated at checkout.
                  </small>

                  <button
                    className="primary-button full-button"
                    onClick={() =>
                      alert("Checkout flow coming next ✦")
                    }
                  >
                    Checkout →
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
