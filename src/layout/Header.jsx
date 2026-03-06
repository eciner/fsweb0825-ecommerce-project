import { memo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
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
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cart = useSelector((state) => state.cart);
  const favorites = useSelector((state) => state.favorites);
  
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const favoritesCount = favorites.length;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
            <Instagram
              size={16}
              className="cursor-pointer transition-opacity hover:opacity-70"
            />
            <Youtube
              size={16}
              className="cursor-pointer transition-opacity hover:opacity-70"
            />
            <Facebook
              size={16}
              className="cursor-pointer transition-opacity hover:opacity-70"
            />
            <Twitter
              size={16}
              className="cursor-pointer transition-opacity hover:opacity-70"
            />
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

            <Link
              to="/shop"
              className="flex items-center gap-1 text-sm font-semibold text-[#737373] transition-colors hover:text-[#252B42]"
              aria-label="Shop page"
            >
              Shop <ChevronDown size={16} />
            </Link>

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
            <Link
              to="/"
              className="hidden items-center gap-2 text-xs font-semibold text-[#23A6F0] transition-colors hover:text-[#23A6F0]-dark md:flex"
            >
              <User size={16} />
              <span>Login</span>
            </Link>

            <button
              type="button"
              className="flex items-center justify-center text-[#252B42] transition-colors hover:text-[#23A6F0] cursor-pointer"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <button
              type="button"
              className="flex items-center gap-1 text-[#252B42] transition-colors hover:text-[#23A6F0] cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="text-xs font-bold">{cartCount}</span>}
            </button>

            <button
              type="button"
              className="flex items-center gap-1 text-[#252B42] transition-colors hover:text-[#23A6F0] cursor-pointer"
              aria-label="Favorites"
            >
              <Heart size={20} />
              {favoritesCount > 0 && <span className="text-xs font-bold">{favoritesCount}</span>}
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
            <Link
              to="/"
              className="flex items-center gap-2 py-3 text-sm font-semibold text-[#23A6F0] transition-colors hover:text-[#23A6F0]-dark"
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={16} />
              Login / Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default memo(Header);
