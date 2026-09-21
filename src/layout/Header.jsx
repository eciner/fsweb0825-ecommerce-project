import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import md5 from "js-md5";
import {
  Phone,
  Mail,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import { fetchCategoriesIfNeeded, logoutUser } from "../store/actions";
import { buildCategoryPath } from "../utils/slug";
import CartDropdown from "../components/CartDropdown";

const AVATAR_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23E8E8E8'/%3E%3Ctext x='50%25' y='52%25' dominant-baseline='middle' text-anchor='middle' fill='%23737373' font-size='24' font-family='Arial'%3E%F0%9F%91%A4%3C/text%3E%3C/svg%3E";

function getInitials(value = "") {
  const parts = String(value).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function Header() {
  const dispatch = useDispatch();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktopCategoriesOpen, setIsDesktopCategoriesOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [avatarFailedEmail, setAvatarFailedEmail] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const desktopDropdownRef = useRef(null);
  const cartDropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  const cart = useSelector((state) => state.shoppingCart.cart);
  const user = useSelector((state) => state.client.user);
  const authInitialized = useSelector((state) => state.client.authInitialized);
  const categories = useSelector((state) => state.product.categories);
  const categoriesFetchState = useSelector(
    (state) => state.product.categoriesFetchState,
  );

  useEffect(() => {
    dispatch(fetchCategoriesIfNeeded());
  }, [dispatch]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (
        isDesktopCategoriesOpen &&
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target)
      ) {
        setIsDesktopCategoriesOpen(false);
      }

      if (
        isCartOpen &&
        cartDropdownRef.current &&
        !cartDropdownRef.current.contains(event.target)
      ) {
        setIsCartOpen(false);
      }

      if (
        isUserMenuOpen &&
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsDesktopCategoriesOpen(false);
        setIsMobileCategoriesOpen(false);
        setIsCartOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isCartOpen, isDesktopCategoriesOpen, isUserMenuOpen]);

  const cartCount = cart.reduce((total, item) => total + (item.count || 0), 0);
  const returnPath = `${location.pathname}${location.search}`;

  const isLoggedIn = Boolean(user?.email);
  const userLabel = user?.name || user?.email || "User";
  const normalizedEmail = String(user?.email || "")
    .trim()
    .toLowerCase();
  const gravatarUrl = normalizedEmail
    ? `https://www.gravatar.com/avatar/${md5(normalizedEmail)}?d=404&s=80`
    : AVATAR_FALLBACK;
  const avatarFailed = avatarFailedEmail === normalizedEmail;

  const groupedCategories = useMemo(() => {
    const women = categories.filter((category) => category.gender === "k");
    const men = categories.filter((category) => category.gender === "e");
    const other = categories.filter(
      (category) => category.gender !== "k" && category.gender !== "e",
    );

    return [
      { label: "Kadın", items: women },
      { label: "Erkek", items: men },
      { label: "Diğer", items: other },
    ].filter((group) => group.items.length > 0);
  }, [categories]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsDesktopCategoriesOpen(false);
    setIsMobileCategoriesOpen(false);
    setIsCartOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    closeMenus();
  };

  const renderCategoryLinks = (compact = false) => {
    if (categoriesFetchState === "FETCHING") {
      return (
        <div className="px-3 py-2 text-xs text-[#737373]">
          Loading categories...
        </div>
      );
    }

    if (categoriesFetchState === "FAILED") {
      return (
        <div className="flex flex-col gap-2 px-3 py-2">
          <p className="text-xs text-[#E74040]">
            Categories could not be loaded.
          </p>
          <button
            type="button"
            className="w-fit rounded bg-[#23A6F0] px-2 py-1 text-xs font-semibold text-white"
            onClick={() => dispatch(fetchCategoriesIfNeeded({ force: true }))}
          >
            Retry
          </button>
        </div>
      );
    }

    if (!groupedCategories.length) {
      return (
        <div className="px-3 py-2 text-xs text-[#737373]">
          No categories available.
        </div>
      );
    }

    return (
      <>
        {groupedCategories.map((group) => (
          <div key={group.label} className="flex flex-col">
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#737373]">
              {group.label}
            </p>
            {group.items.map((category) => (
              <Link
                key={category.id}
                to={buildCategoryPath(category)}
                className={`px-3 py-2 text-sm text-[#252B42] hover:bg-[#F5F5F5] ${compact ? "border-b border-[#F1F1F1]" : ""}`}
                onClick={closeMenus}
              >
                {category.title}
              </Link>
            ))}
          </div>
        ))}
      </>
    );
  };

  let authLinksContent = null;

  if (!authInitialized) {
    authLinksContent = (
      <span className="hidden text-xs font-semibold text-[#737373] md:block">
        Checking session...
      </span>
    );
  } else if (isLoggedIn) {
    authLinksContent = (
      <div className="relative hidden md:block" ref={userMenuRef}>
        <button
          type="button"
          onClick={() => setIsUserMenuOpen((previous) => !previous)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#252B42]"
          aria-haspopup="menu"
          aria-expanded={isUserMenuOpen}
        >
          {!avatarFailed ? (
            <img
              src={gravatarUrl}
              alt={`${userLabel} avatar`}
              className="h-8 w-8 rounded-full border border-[#E8E8E8] object-cover"
              onError={() => setAvatarFailedEmail(normalizedEmail)}
            />
          ) : (
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8E8E8] text-xs font-bold text-[#737373]"
              aria-hidden="true"
            >
              {getInitials(userLabel)}
            </span>
          )}
          <span className="max-w-32 truncate">{userLabel}</span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
        {isUserMenuOpen && (
          <div className="absolute right-0 top-full z-30 mt-3 flex min-w-44 flex-col rounded-md border border-[#E8E8E8] bg-white py-2 shadow-lg" role="menu">
            <Link to="/orders" onClick={closeMenus} className="px-3 py-2 text-sm text-[#252B42] hover:bg-[#F5F5F5]" role="menuitem">
              Previous Orders
            </Link>
            <button type="button" onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-left text-sm text-[#737373] hover:bg-[#F5F5F5]" role="menuitem">
              <LogOut size={15} aria-hidden="true" />
              Logout
            </button>
          </div>
        )}
      </div>
    );
  } else {
    authLinksContent = (
      <div className="hidden items-center gap-3 md:flex">
        <Link
          to={{ pathname: "/login", state: { from: returnPath } }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#23A6F0] transition-colors hover:text-[#1B8FD8]"
        >
          <User size={16} />
          Login
        </Link>
        <Link
          to={{ pathname: "/signup", state: { from: returnPath } }}
          className="text-xs font-semibold text-[#252B42] transition-colors hover:text-[#23A6F0]"
        >
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <header className="flex w-full flex-col bg-white">
      {/* Top Info Bar - Desktop Only */}
      <div className="hidden w-full bg-[#252B42] text-white md:flex">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 text-xs font-semibold">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2">
              <Phone size={14} />
              <a href="tel:(225)555-0118" className="hover:text-[#23A6F0]">
                (225) 555-0118
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Mail size={14} />
              <a
                href="mailto:michelle.rivera@example.com"
                className="hover:text-[#23A6F0]"
              >
                michelle.rivera@example.com
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span>Follow Us and get a chance to win 80% off</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Follow Us :</span>
            <Instagram size={16} aria-hidden="true" />
            <Youtube size={16} aria-hidden="true" />
            <Facebook size={16} aria-hidden="true" />
            <Twitter size={16} aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="flex w-full border-b border-[#E8E8E8]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#252B42]">WiT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="text-sm font-semibold text-[#252B42] transition-colors hover:text-[#23A6F0]"
            >
              Home
            </Link>

            <div className="relative" ref={desktopDropdownRef}>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-semibold text-[#737373] transition-colors hover:text-[#252B42]"
                aria-haspopup="menu"
                aria-expanded={isDesktopCategoriesOpen}
                onClick={() => setIsDesktopCategoriesOpen((prev) => !prev)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setIsDesktopCategoriesOpen((prev) => !prev);
                  }
                }}
              >
                Shop <ChevronDown size={16} />
              </button>

              {isDesktopCategoriesOpen && (
                <div className="absolute left-0 z-20 mt-3 flex min-w-72 flex-col rounded-md border border-[#E8E8E8] bg-white py-2 shadow-lg">
                  <Link
                    to="/shop"
                    className="border-b border-[#F1F1F1] px-3 py-2 text-sm font-semibold text-[#23A6F0] hover:bg-[#F5F5F5]"
                    onClick={closeMenus}
                  >
                    All Products
                  </Link>
                  {renderCategoryLinks()}
                </div>
              )}
            </div>

            <Link
              to="/about"
              className="text-sm font-semibold text-[#737373] transition-colors hover:text-[#252B42]"
            >
              About
            </Link>
            <Link
              to="/team"
              className="text-sm font-semibold text-[#737373] transition-colors hover:text-[#252B42]"
            >
              Team
            </Link>
            <Link
              to="/contact"
              className="text-sm font-semibold text-[#737373] transition-colors hover:text-[#252B42]"
            >
              Contact
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-4">
            {authLinksContent}

            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex items-center justify-center text-[#BDBDBD]"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <div className="relative" ref={cartDropdownRef}>
              <button
                type="button"
                className="flex items-center gap-1 text-[#252B42] hover:text-[#23A6F0]"
                aria-label="Cart"
                aria-expanded={isCartOpen}
                onClick={() => setIsCartOpen((previous) => !previous)}
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="text-xs font-bold">{cartCount}</span>
                )}
              </button>
              {isCartOpen && (
                <CartDropdown
                  cart={cart}
                  onClose={() => setIsCartOpen(false)}
                />
              )}
            </div>

            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex items-center gap-1 text-[#BDBDBD]"
              aria-label="Favorites (coming soon)"
            >
              <Heart size={20} />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="flex items-center justify-center text-[#252B42] md:hidden cursor-pointer"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="flex w-full flex-col border-b border-[#E8E8E8] bg-white md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-0 px-4 py-3">
            <Link
              to="/"
              className="border-b border-[#E8E8E8] py-3 text-sm font-semibold text-[#252B42] transition-colors hover:text-[#23A6F0]"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="border-b border-[#E8E8E8] py-3 text-left text-sm font-semibold text-[#737373] transition-colors hover:text-[#252B42]"
              onClick={() => setIsMenuOpen(false)}
            >
              Shop
            </Link>

            <button
              type="button"
              className="flex items-center justify-between border-b border-[#E8E8E8] py-3 text-left text-sm font-semibold text-[#737373]"
              onClick={() => setIsMobileCategoriesOpen((prev) => !prev)}
              aria-expanded={isMobileCategoriesOpen}
              aria-controls="mobile-categories"
            >
              Categories
              <ChevronDown
                size={16}
                className={isMobileCategoriesOpen ? "rotate-180" : "rotate-0"}
              />
            </button>

            {isMobileCategoriesOpen && (
              <div
                id="mobile-categories"
                className="flex flex-col border-b border-[#E8E8E8] bg-[#FAFAFA]"
              >
                <Link
                  to="/shop"
                  className="px-3 py-2 text-sm font-semibold text-[#23A6F0]"
                  onClick={closeMenus}
                >
                  All Products
                </Link>
                {renderCategoryLinks(true)}
              </div>
            )}

            <Link
              to="/team"
              className="border-b border-[#E8E8E8] py-3 text-sm font-semibold text-[#737373] transition-colors hover:text-[#252B42]"
              onClick={() => setIsMenuOpen(false)}
            >
              Team
            </Link>
            <Link
              to="/about"
              className="border-b border-[#E8E8E8] py-3 text-sm font-semibold text-[#737373] transition-colors hover:text-[#252B42]"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/contact"
              className="border-b border-[#E8E8E8] py-3 text-sm font-semibold text-[#737373] transition-colors hover:text-[#252B42]"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            {isLoggedIn ? (
              <div className="flex items-center justify-between gap-3 py-3 text-sm font-semibold text-[#252B42]">
                <div className="flex min-w-0 items-center gap-2">
                  <User size={16} />
                  <span className="truncate">{userLabel}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[#737373]"
                >
                  <LogOut size={15} aria-hidden="true" />
                  Logout
                </button>
                <Link
                  to="/orders"
                  onClick={closeMenus}
                  className="text-sm font-semibold text-[#23A6F0]"
                >
                  Previous Orders
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 py-3">
                <Link
                  to={{ pathname: "/login", state: { from: returnPath } }}
                  className="text-sm font-semibold text-[#23A6F0]"
                  onClick={closeMenus}
                >
                  Login
                </Link>
                <span className="text-[#BDBDBD]">/</span>
                <Link
                  to={{ pathname: "/signup", state: { from: returnPath } }}
                  className="text-sm font-semibold text-[#252B42]"
                  onClick={closeMenus}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default memo(Header);
