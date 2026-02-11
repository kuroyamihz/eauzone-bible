import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Plus, Trash2, Lock, Image as ImageIcon, ChevronRight, ArrowLeft, Search, Loader2, 
  Sun, Moon, CheckCircle, AlertCircle, BookOpen, AlertTriangle, Edit2, Info, 
  Milk, Wheat, Fish, Wine, Flame, Leaf, Sparkles, 
  UtensilsCrossed, Coffee, Beer, Martini, GlassWater, Baby, Cookie, 
  FileText, Map, CircleHelp, ShieldCheck, Citrus, Droplets, Soup,
  Recycle, Sprout, Filter, Grape, Beef, Type,
  // Added Eye icons for the Simple Mode toggle
  Eye, EyeOff,
  Egg, Carrot, Flower, FlaskConical, TreeDeciduous, Shell
} from 'lucide-react';
import { db, CLOUD_NAME, UPLOAD_PRESET } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, getDoc, query, where, limit } from 'firebase/firestore';


// --- 7. APP SHELL REWRITTEN ---
export default function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

function MainLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [toast, setToast] = useState(null);
  
  // NEW: Font Size State (0 = Default, -1 = Small, 1 = Large)
  const [fontSizeLevel, setFontSizeLevel] = useState(0);

  // LOGIC: Check if we are in Valentine category
  const isValentine = location.pathname.includes("Valentine");
  
  // LOGIC: Select Theme (Valentine overrides Dark/Light)
  const theme = isValentine ? THEMES.valentine : (isDark ? THEMES.dark : THEMES.light);

  const triggerToast = (msg, type) => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };
  const openSearchWithTerm = (term) => { setSearchExpanded(true); };

  // Calculate scaling class/style
  const fontScale = fontSizeLevel === 0 ? "100%" : (fontSizeLevel > 0 ? "110%" : "90%");

  useEffect(() => {
    // Handle Body Background for smooth transitions
    if (isValentine) {
        document.body.style.backgroundColor = "#fff0f5";
        document.documentElement.classList.remove('dark');
    } else if (isDark) { 
        document.documentElement.classList.add('dark'); 
        document.body.style.backgroundColor = "#0a192f";
    } else { 
        document.documentElement.classList.remove('dark'); 
        document.body.style.backgroundColor = "#ffffff";
    }
  }, [isDark, isValentine]);

  return (
      <>
      <GlobalStyles theme={theme} />
      
      {/* Apply Font Scaling Wrapper */}
      <div style={{ fontSize: fontScale }} className={`min-h-screen w-full transition-colors duration-500 ${theme.bgApp} ${theme.textMain} overflow-x-hidden`}>
          
          <Routes>
              <Route path="/item/:itemId" element={null} /> 
              <Route path="*" element={ 
                 <Navbar 
                    toggleSidebar={() => setSidebarOpen(true)} 
                    toggleLogin={() => isAdmin ? setIsAdmin(false) : setShowLogin(true)} 
                    isSearchOpen={searchExpanded} 
                    openSearch={() => setSearchExpanded(true)} 
                    closeSearch={() => setSearchExpanded(false)} 
                    toggleTheme={() => setIsDark(!isDark)} 
                    isAdmin={isAdmin} 
                    theme={theme}
                    // Pass Font Props
                    fontLevel={fontSizeLevel}
                    setFontLevel={setFontSizeLevel}
                 /> 
              } />
          </Routes>

          <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-500 ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} onClick={() => setSidebarOpen(false)} />
          
          <div className={`fixed inset-y-0 left-0 w-[85vw] md:w-80 ${theme.bgApp} border-r shadow-2xl ${theme.name==='dark'?'border-[#233554]':'border-gray-200'} transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) z-[61] p-8 flex flex-col`}>
             <div className="flex justify-between items-center mb-10">
                 <span className="font-serif text-xl tracking-widest opacity-50">MENU</span>
                 <button onClick={() => setSidebarOpen(false)} className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition ${theme.textMain}`}><X /></button>
             </div>
             <div className="flex-1 overflow-y-auto space-y-10 hide-scrollbar">
                {Object.entries(SITE_STRUCTURE).map(([parent, subs], idx) => (
                    <div key={parent} className="animate-fade-in-up" style={{animationDelay: `${idx * 100}ms`}}>
                        <h3 className={`text-xs font-bold ${theme.textMuted} uppercase tracking-[0.2em] mb-6 flex items-center gap-2`}>
                            {parent === "Food" && <UtensilsCrossed size={14}/>}
                            {parent === "Beverage" && <Martini size={14}/>}
                            {parent === "Misc" && <Info size={14}/>}
                            {parent}
                        </h3>
                        <ul className="space-y-4 pl-4 border-l-2 dark:border-[#233554] border-gray-100">
                            {subs.map(sub => (
                                <li key={sub}>
                                    <Link to={`/category/${sub}`} onClick={() => setSidebarOpen(false)} className={`text-lg ${theme.textMain} opacity-70 hover:opacity-100 hover:translate-x-2 transition-all duration-300 flex items-center gap-3 group`}>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs -ml-4">{theme.name==='dark'?'Now':'->'}</span>
                                        {sub.replace('-', ' ')}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
             </div>
          </div>

          <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLogin={setIsAdmin} showToast={triggerToast} theme={theme} />
          <Toast message={toast?.message} type={toast?.type} />

          <Routes>
            <Route path="/" element={<HomePage openSearch={() => setSearchExpanded(true)} theme={theme} />} />
            <Route path="/category/:id" element={<CategoryPage isAdmin={isAdmin} showToast={triggerToast} theme={theme} />} />
            <Route path="/item/:itemId" element={<ItemDetailsPage theme={theme} openSearch={openSearchWithTerm} />} />
          </Routes>
      </div> 
      </>
  );
}

// --- 1. CONFIGURATION & THEMES ---

const THEMES = {
  dark: {
    name: "dark",
    bgApp: "bg-[#0a192f]",
    textMain: "text-[#e6f1ff]",
    textMuted: "text-[#8892b0]",
    cardBg: "bg-[#112240] border border-[#233554]",
    modalBg: "bg-[#112240]/95 backdrop-blur-xl border border-[#233554]",
    accent: "text-[#64ffda]",
    accentBg: "bg-[#64ffda]",
    inputBg: "bg-[#0a192f] border-[#233554] text-white focus:border-[#64ffda]",
    navOverlay: "bg-[#0a192f]/80 backdrop-blur-md border-b border-[#233554]/50",
    heroOverlay: "bg-[#0a192f]/70",
    hoverOverlay: "bg-[#0a192f]/95",
    buttonGlow: "hover:shadow-[0_0_15px_rgba(100,255,218,0.3)]",
  },
  light: {
    name: "light",
    bgApp: "bg-white",
    textMain: "text-[#000000]",
    textMuted: "text-gray-600",
    cardBg: "bg-white border border-gray-200",
    modalBg: "bg-white/95 backdrop-blur-xl border border-gray-200",
    accent: "text-[#2b6cb0]",
    accentBg: "bg-[#2b6cb0]",
    inputBg: "bg-gray-50 border-gray-300 text-gray-900 focus:border-[#2b6cb0]",
    navOverlay: "bg-white/80 backdrop-blur-md border-b border-gray-200/50",
    heroOverlay: "bg-white/20",
    hoverOverlay: "bg-white/95",
    buttonGlow: "hover:shadow-[0_0_15px_rgba(43,108,176,0.3)]",
  },
  // --- NEW VALENTINE THEME ---
  valentine: {
    name: "valentine",
    bgApp: "bg-[#fff0f5]", // Lavender Blush
    textMain: "text-[#880e4f]", // Pink 900
    textMuted: "text-[#ad1457]", // Pink 800
    cardBg: "bg-white/80 border border-pink-200",
    modalBg: "bg-[#fff0f5]/95 backdrop-blur-xl border border-pink-200",
    accent: "text-[#d81b60]", // Pink 600
    accentBg: "bg-[#d81b60]",
    inputBg: "bg-white border-pink-200 text-pink-900 focus:border-[#d81b60]",
    navOverlay: "bg-[#fff0f5]/80 backdrop-blur-md border-b border-pink-200/50",
    heroOverlay: "bg-pink-900/30",
    hoverOverlay: "bg-[#fff0f5]/95",
    buttonGlow: "hover:shadow-[0_0_15px_rgba(216,27,96,0.4)]",
  }
};

const GlobalStyles = ({ theme }) => (
  <style>{`
    html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
    .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
    .animate-slide-in { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .stagger-1 { animation-delay: 50ms; }
    .stagger-2 { animation-delay: 100ms; }
    .stagger-3 { animation-delay: 150ms; }
    .stagger-4 { animation-delay: 200ms; }
    .stagger-5 { animation-delay: 250ms; }
  `}</style>
);

// --- 2. DATA CONSTANTS ---

const SITE_STRUCTURE = {

  "Food": ["Soups", "Salads", "Sushi", "Bites", "Mains", "Kids", "Desserts"],
  "Beverage": ["Valentine", "Coffee & Tea", "Soft-Drinks", "Mocktails", "Cocktails", "Spirits", "Beers", "Wines"],
  "Misc": ["HACCP", "Floor-Plan", "FAQ"]
  };

const SUBCATEGORIES = {
    // UPDATED MAINS
    "Mains": ["Seafoods", "Meat & Poultry", "Rice & Noodle", "Sharing", "Sides"],
    
    // NEW STARTERS (Combined)
    "Salads": ["Starters", "Salads"],
    
    // SUSHI OVERHAUL
    "Sushi": ["Maki", "Rolls", "Sashimi", "Nigiri", "Sharing"],
    "Wines": ["Housepouring", "Red", "White", "Rose", "Sparkling", "Champagne", "Sake"],
    "Spirits": ["Housepouring", "Gin", "Vodka", "Whisky", "Rum", "Tequila", "Shochu", "Liqueur"],
    "Cocktails": ["Signature", "Classics"],
    "Mocktails": ["Signature", "Classics"],
    "Beers": ["Draught", "Bottles"],
    "Coffee & Tea": ["Coffee", "Tea", "Shakes & Smoothies"],
    "Soft-Drinks": ["Water", "Sodas", "Juices"]
};

const COMMON_ALLERGENS = ["Dairy", "Gluten", "Tree Nuts", "Peanut", "Seafood", "Soybeans", "Egg", "Fish", "Sesame", "Mustard", "Celery", "Sulphites", "Lupine", "Molluscs", "Alcohol", "Pork", "Spicy", "Raw", "Vegan", "Vegetarian", "Sustainable"];
const WINE_BODIES = ["Light Bodied", "Medium Bodied", "Full Bodied"];

const DESCRIPTIONS = {
  "Soups": "Warm, comforting bowls rich with Asian aromatics and depth.",
  "Bites": "Small plates with big personality. Perfect for sharing.",
  // --- STARTERS & SALADS ---
  "Salads": "A curated beginning. Light bites and vibrant greens.",
  "Salads-Starters": "Small plates with big personality. Perfect for opening the palate.",
  "Salads-Salads": "Crisp, organic greens meet bold Asian dressings. A fresh start.",
  
  // --- SUSHI OVERHAUL ---
  "Sushi": "Precision cuts, vinegared rice, and the ocean's finest catch.",
  "Sushi-Maki": "Classic cylindrical rolls wrapped in crisp nori.",
  "Sushi-Rolls": "Modern uramaki creations with bold flavors and textures.",
  "Sushi-Sashimi": "Pure, distinct slices of fresh raw fish without rice.",
  "Sushi-Nigiri": "Hand-pressed vinegared rice topped with premium seafood.",
  "Sushi-Sharing": "Grand platters showcasing the chef's finest selection.",

  // --- MAINS ---
  "Mains": "The main event. Robust flavors bridging East and West.",
  "Mains-Seafoods": "Fresh catches prepared with delicate Asian techniques.",
  "Mains-Meat & Poultry": "Prime cuts, slow-cooked textures, and bold marinades.",
  "Mains-Rice & Noodle": "The essential staples, elevated with wok-hei and premium ingredients.",
  "Mains-Sharing": "Generous platters designed to bring people together.",
  "Mains-Sides": "The perfect accompaniments to complete your meal.",

  "Kids": "Gourmet favorites tailored for our younger guests.",
  "Desserts": "The sweet finale. Indulgent textures and delicate sweetness.",
  
  // Beverage (Unchanged)
  "Coffee & Tea": "Artisan roasted beans, rare tea blends, and creamy delights.",
  "Coffee & Tea-Coffee": "Barista-crafted espresso, latte, and cold brew selections.",
  "Coffee & Tea-Tea": "Premium loose-leaf teas and herbal infusions.",
  "Coffee & Tea-Shakes & Smoothies": "Rich, creamy shakes and revitalizing fruit blends.",
  "Soft-Drinks": "Refreshing mineral waters, premium sodas, and fresh juices.",
  "Soft-Drinks-Water": "Still and sparkling waters from pristine sources.",
  "Soft-Drinks-Sodas": "Classic fizzy favorites and premium mixers.",
  "Soft-Drinks-Juices": "Freshly squeezed seasonal fruits.",
  "Mocktails": "Alcohol-free artistry using fresh fruits and botanicals.",
  "Mocktails-Signature": "Complex, alcohol-free creations unique to Eauzone.",
  "Mocktails-Classics": "Timeless refreshments, perfectly balanced.",
  "Cocktails": "Liquid art. Shaken, stirred, and poured with passion.",
  "Cocktails-Signature": "Eauzone's exclusive creations you won't find anywhere else.",
  "Cocktails-Classics": "The world's most revered recipes, perfected.",
  "Spirits": "Distilled excellence. The foundation of great drinks.",
  "Spirits-Housepouring": "Our reliable selection of premium standard spirits.",
  "Spirits-Gin": "Botanical complexity, from London Dry to Japanese Craft.",
  "Spirits-Vodka": "Pure, clean, and crisp spirits from around the globe.",
  "Spirits-Whisky": "Aged perfection from Scotland, Japan, and the Americas.",
  "Spirits-Rum": "The spirit of the tropics, from white to aged dark.",
  "Spirits-Tequila": "Agave spirits from the heart of Mexico.",
  "Spirits-Shochu": "Traditional Japanese distilled spirits.",
  "Spirits-Liqueur": "Sweet, herbal, and complex modifiers.",
  "Beers": "Refreshing brews to combat the desert heat.",
  "Beers-Draught": "Perfectly poured taps, crisp and cold.",
  "Beers-Bottles": "Curated craft and international favorites.",
  "Wines": "A curated journey through the world's finest vineyards.",
  "Wines-Housepouring": "Excellent wines by the glass for every occasion.",
  "Wines-Red": "Bold, tannic, and complex reds to pair with our meats.",
  "Wines-White": "Crisp and mineral-forward notes, perfect for seafood.",
  "Wines-Rose": "Blush tones and summer fruits, perfect for sunset.",
  "Wines-Sparkling": "Effervescent joy for toasts and celebrations.",
  "Wines-Champagne": "The pinnacle of bubbles from the heart of France.",
  "Wines-Sake": "Premium rice wines, the soul of Japan.",
  // Misc
  "HACCP": "Food safety protocols and hygiene standards.",
  "Floor-Plan": "Layouts and seating arrangements.",
  "FAQ": "Operational details and common questions."
};

// --- 3. HELPER FUNCTIONS ---

const getBackground = (category, subType) => {
  const MAP = {
      "Soups": "https://unsplash.com/photos/a-bowl-of-soup-on-a-wooden-table-ZrtDZRfxwog",
      // Starters
      "Salads": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80",
      "Salads-Salads": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80",
      "Salads-Starters": "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&q=80",
      
      // Sushi (New)
      "Sushi": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80",
      "Sushi-Maki": "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80",
      "Sushi-Rolls": "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80",
      "Sushi-Sashimi": "https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&q=80",
      "Sushi-Nigiri": "https://images.unsplash.com/photo-1617196019294-dc35f53eb31d?auto=format&fit=crop&q=80",
      "Sushi-Sharing": "https://images.unsplash.com/photo-1633478062482-790e3b5dd810?auto=format&fit=crop&q=80",

      // Mains
      "Mains": "https://images.unsplash.com/photo-1544025162-d76690b67f61?auto=format&fit=crop&q=80",
      "Mains-Seafoods": "https://images.unsplash.com/photo-1519708227418-c8fd9a3a2750?auto=format&fit=crop&q=80",
      "Mains-Meat & Poultry": "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80",
      "Mains-Rice & Noodle": "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80",
      "Mains-Sharing": "https://images.unsplash.com/photo-1544025162-d76690b67f61?auto=format&fit=crop&q=80",
      "Mains-Sides": "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&q=80",

      // Others
      "Kids": "https://images.unsplash.com/photo-1621255562761-f44604928b52?auto=format&fit=crop&q=80",
      "Desserts": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80",
      // Drinks
      "Wines": "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80",
      "Wines-Red": "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80",
      "Wines-White": "https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?auto=format&fit=crop&q=80",
      "Wines-Rose": "https://images.unsplash.com/photo-1559563362-c667ba5f5480?auto=format&fit=crop&q=80",
      "Wines-Sparkling": "https://images.unsplash.com/photo-1598155523122-38423bb4d6c1?auto=format&fit=crop&q=80",
      "Wines-Champagne": "https://images.unsplash.com/photo-1594146663246-886861114532?auto=format&fit=crop&q=80",
      "Wines-Sake": "https://images.unsplash.com/photo-1572918664405-1815e45c4852?auto=format&fit=crop&q=80",
      "Spirits": "https://images.unsplash.com/photo-1598155523122-38423bb4d6c1?auto=format&fit=crop&q=80",
      "Spirits-Gin": "https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&q=80",
      "Spirits-Vodka": "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80",
      "Spirits-Whisky": "https://images.unsplash.com/photo-1527281400683-1aabc8b45f51?auto=format&fit=crop&q=80",
      "Spirits-Rum": "https://images.unsplash.com/photo-1614313511387-1436a4480ebb?auto=format&fit=crop&q=80",
      "Spirits-Tequila": "https://images.unsplash.com/photo-1516535794938-6063878f08cc?auto=format&fit=crop&q=80",
      "Spirits-Shochu": "https://images.unsplash.com/photo-1580552600207-2c9744c8c734?auto=format&fit=crop&q=80",
      "Spirits-Liqueur": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80",
      "Cocktails": "https://images.unsplash.com/photo-1514362545857-3bc16549766b?auto=format&fit=crop&q=80",
      "Mocktails": "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&q=80",
      "Beers": "https://images.unsplash.com/photo-1535958636474-b021ee8876a3?auto=format&fit=crop&q=80",
      "Coffee & Tea": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80",
      "Coffee & Tea-Shakes & Smoothies": "https://images.unsplash.com/photo-1577805947697-b9b2d5d39c96?auto=format&fit=crop&q=80",
      "Soft-Drinks": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80",
      "Misc": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
      "HACCP": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
  };
  return MAP[`${category}-${subType}`] || MAP[category] || "https://imgur.com/UJpkv1U.png";
};

const getCategoryIcon = (name) => {
    if (!name) return <Sparkles size={18} />; // Safety check
    const n = name.toLowerCase();
    // Food
    if (n.includes('soup')) return <Soup size={18} />;
    if (n.includes('salad') || n.includes('veg')) return <Leaf size={18} />;
    if (n.includes('sushi') || n.includes('fish') || n.includes('maki') || n.includes('nigiri')) return <Fish size={18} />;
    if (n.includes('bite') || n.includes('kids') || n.includes('starter')) return <Baby size={18} />;
    if (n.includes('main') || n.includes('sides')) return <UtensilsCrossed size={18} />;
    if (n.includes('dessert')) return <Cookie size={18} />;
    // Drinks
    if (n.includes('coffee') || n.includes('tea')) return <Coffee size={18} />;
    if (n.includes('soft') || n.includes('water') || n.includes('shake')) return <GlassWater size={18} />;
    if (n.includes('mocktail')) return <Citrus size={18} />;
    if (n.includes('cocktail')) return <Martini size={18} />;
    if (n.includes('spirit') || n.includes('vodka') || n.includes('gin')) return <Droplets size={18} />;
    if (n.includes('beer')) return <Beer size={18} />;
    if (n.includes('wine')) return <Wine size={18} />;
    // Misc
    if (n.includes('haccp') || n.includes('safe')) return <ShieldCheck size={18} />;
    if (n.includes('floor')) return <Map size={18} />;
    if (n.includes('faq')) return <CircleHelp size={18} />;
    return <Sparkles size={18} />;
};



const getAllergenIcon = (text) => {
  const lower = text.toLowerCase();
  
  // Existing
  if (lower.includes('dairy') || lower.includes('milk')) return <Milk size={14} />;
  if (lower.includes('gluten') || lower.includes('wheat')) return <Wheat size={14} />;
  if (lower.includes('alcohol') || lower.includes('wine') || lower.includes('sulphites')) return <Wine size={14} />;
  if (lower.includes('spicy') || lower.includes('chili')) return <Flame size={14} />;
  if (lower.includes('veg') && !lower.includes('raw')) return <Leaf size={14} />; // Exclude 'raw' so it doesn't clash
  
  // New Additions
  if (lower.includes('egg')) return <Egg size={14} />;
  if (lower.includes('celery')) return <Carrot size={14} />; // Carrot represents veg/stalks
  if (lower.includes('lupine')) return <Flower size={14} />; // Lupin is a flower
  if (lower.includes('raw')) return <Beef size={14} />; // Beef represents Raw Meat/Carpaccio
  if (lower.includes('mustard')) return <FlaskConical size={14} />; // Flask represents additives/sauces
  if (lower.includes('sustainable')) return <Recycle size={14} />; // Sprout for sustainable
  if (lower.includes('soybeans')) return <Sprout size={14} />;
  if (lower.includes('tree nut') || lower.includes('nut') || lower.includes('peanut') || lower.includes('sesame')) return <TreeDeciduous size={14} />;
  
  // Seafood & Molluscs (Using Shell for Prawn/Shellfish vibe)
  if (lower.includes('mollusc') || lower.includes('seafood') || lower.includes('prawn') || lower.includes('shrimp') || lower.includes('shellfish')) return <Shell size={14} />;
  if (lower.includes('fish')) return <Fish size={14} />;

  return <AlertTriangle size={14} />;
};

const uploadImage = async (file) => {
  if (!file) return null;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
    const data = await res.json();
    return data.secure_url;
  } catch (error) { return null; }
};

// --- 4. SMALL COMPONENTS (Toast, Modal, Footer) ---

const Toast = ({ message, type }) => {
    if (!message) return null;
    return (
      <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl animate-fade-in-up backdrop-blur-md ${type==='success' ? "bg-emerald-600/90 text-white" : "bg-red-600/90 text-white"}`}>
        {type==='success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span className="font-medium text-sm tracking-wide">{message}</span>
      </div>
    );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, theme }) => {
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm animate-fade-in-up">
            <div className={`${theme.modalBg} p-8 rounded-2xl max-w-sm w-full shadow-2xl transform transition-all`}>
                <h3 className={`text-xl font-bold ${theme.textMain} mb-2`}>{title}</h3>
                <p className={`${theme.textMuted} mb-8 leading-relaxed`}>{message}</p>
                <div className="flex gap-4">
                    <button onClick={onClose} className={`flex-1 py-3 rounded-xl border font-medium transition-all active:scale-95 ${theme.name==='dark'?'border-white/10 text-white hover:bg-white/5':'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-600/30 active:scale-95 transition-all">Confirm</button>
                </div>
            </div>
        </div>
    );
}

const Footer = ({ theme }) => (
  <footer className={`w-full py-16 px-6 text-center ${theme.textMuted} text-xs leading-relaxed border-t ${theme.name === 'dark' ? 'border-[#233554]' : 'border-gray-200'} mt-20 relative z-10`}>
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-center mb-6">
        <Sparkles size={24} className={`${theme.accent} opacity-50`} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className="font-serif text-lg tracking-widest uppercase">EAUZONE 2026</p>
        <p className="text-[10px] tracking-widest uppercase opacity-70">Part of One&Only Royal Mirage Dubai</p>
      </div>
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 opacity-70 pt-4 border-t border-dashed border-gray-500/20 w-full">
        <span className="hover:opacity-100 transition">Concept: <b className={theme.textMain}>Kritika Pradhan</b></span>
        <span className="hover:opacity-100 transition">Food: <b className={theme.textMain}>Rimen Sim</b></span>
        <span className="hover:opacity-100 transition">Beverage: <b className={theme.textMain}>Robin Varghese</b></span>
        <span className="hover:opacity-100 transition">Website: <b className={theme.textMain}>Raditya Pamungkas</b></span>
      </div>
    </div>
  </footer>
);

// --- 5. FORM COMPONENTS ---

const LoginModal = ({ isOpen, onClose, onLogin, showToast, theme }) => {
  const [pass, setPass] = useState("");
  if (!isOpen) return null;
  const handleLogin = () => {
    if (["eauzone@dubai2026", "800123", "admin"].includes(pass)) { onLogin(true); showToast("Welcome Manager", "success"); onClose(); setPass(""); }
    else showToast("Denied", "error");
  };
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4 backdrop-blur-sm animate-fade-in-up">
       <div className={`${theme.modalBg} w-full max-w-sm p-10 rounded-3xl text-center shadow-2xl`}>
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-6 ${theme.accentBg} bg-opacity-20`}>
            <Lock size={24} className={theme.accent} />
          </div>
          <h2 className={`text-2xl font-serif ${theme.textMain} mb-2`}>Manager Access</h2>
          <p className={`${theme.textMuted} text-sm mb-8`}>Enter passcode to edit the Bible.</p>
          <input type="password" placeholder="••••••" className={`w-full p-4 rounded-xl ${theme.inputBg} mb-4 text-center tracking-[0.5em] text-lg outline-none transition-all focus:ring-2 ring-opacity-50`} onChange={e => setPass(e.target.value)} />
          <button onClick={handleLogin} className={`w-full py-4 ${theme.accentBg} text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform`}>Unlock</button>
          <button onClick={onClose} className="mt-6 text-neutral-500 text-xs hover:text-neutral-400 transition">Cancel</button>
       </div>
    </div>
  );
};

// --- CRITICAL FIX: Safe Data Initialization for AddItemForm ---
const AddItemForm = ({ category, onCancel, onRefresh, showToast, theme, initialData }) => {
    const isEdit = !!initialData;
    
    // Lazy initializer to safe-guard against old data types
    const [data, setData] = useState(() => {
        const defaults = { 
            name:"", price:"", priceGlass: "", priceBottle: "", description:"", 
            subCategory: category, image: null, types: [], 
            ingredients: "", method: "", allergens: "", trivia: "", body: "" 
        };
        if (initialData) {
            // Merge defaults + initialData + forced array conversion for types
            return {
                ...defaults,
                ...initialData,
                types: Array.isArray(initialData.types) ? initialData.types : (initialData.type ? [initialData.type] : [])
            };
        }
        return defaults;
    });

    const [loading, setLoading] = useState(false);
    const subs = SUBCATEGORIES[category] || [];
    const isWine = category === "Wines";
    const isHousepouring = data.types.includes("Housepouring");

    const toggleType = (t) => {
        if (data.types.includes(t)) {
            setData({...data, types: data.types.filter(x => x !== t)});
        } else {
            setData({...data, types: [...data.types, t]});
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        let url = data.image; 
        if (data.image instanceof File) { url = await uploadImage(data.image); }
        
        const finalPrice = isHousepouring ? 0 : Number(data.price); 
        
        const payload = { 
            ...data, 
            image: url || "", 
            price: finalPrice,
            priceGlass: isHousepouring ? Number(data.priceGlass) : 0,
            priceBottle: isHousepouring ? Number(data.priceBottle) : 0,
            type: data.types[0] || "General", // Legacy fallback
            updatedAt: new Date() 
        };
        
        if (isEdit) { await updateDoc(doc(db, "menu-items", initialData.id), payload); showToast("Item Updated", "success"); } 
        else { await addDoc(collection(db, "menu-items"), { ...payload, createdAt: new Date() }); showToast("Item Added", "success"); }
        setLoading(false); onRefresh(); onCancel();
    };

    return (
        <div className={`mb-12 p-8 ${theme.cardBg} rounded-2xl border shadow-xl animate-scale-in`}>
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
                <h3 className={`text-xl font-bold flex items-center gap-3 ${theme.textMain}`}>
                    {isEdit ? <Edit2 size={20} className={theme.accent}/> : <Plus size={20} className={theme.accent}/>}
                    {isEdit ? "Edit Item" : `New ${category} Item`}
                </h3>
                <button onClick={onCancel} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition ${theme.textMuted}`}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
                {subs.length > 0 && (
                   <div className="flex flex-wrap gap-2 mb-4 p-4 rounded-xl bg-gray-50 dark:bg-black/20">
                     <span className={`w-full text-xs font-bold uppercase tracking-widest mb-2 ${theme.textMuted}`}>Sub-Categories (Multi-Select)</span>
                     {subs.map(type => (
                       <button key={type} type="button" onClick={() => toggleType(type)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${data.types.includes(type) ? theme.accentBg + " text-white shadow-md transform scale-105" : theme.inputBg + " hover:opacity-80"}`}>{type}</button>
                     ))}
                   </div>
                )}
                
                {isWine && (
                    <div className="space-y-1 mb-4">
                        <label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Wine Body</label>
                        <select value={data.body} onChange={e => setData({...data, body: e.target.value})} className={`w-full p-3 rounded-xl ${theme.inputBg} outline-none`}>
                            <option value="">Select Body...</option>
                            {WINE_BODIES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Name</label><input value={data.name} className={`w-full p-3 rounded-xl ${theme.inputBg} outline-none transition-all focus:ring-2 ring-opacity-50`} onChange={e=>setData({...data, name: e.target.value})} required/></div>
                    
                    {isWine && isHousepouring ? (
                        <div className="grid grid-cols-2 gap-2">
                             <div className="space-y-1"><label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Glass (150ml)</label><input type="number" value={data.priceGlass} className={`w-full p-3 rounded-xl ${theme.inputBg} outline-none`} onChange={e=>setData({...data, priceGlass: e.target.value})} required/></div>
                             <div className="space-y-1"><label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Bottle</label><input type="number" value={data.priceBottle} className={`w-full p-3 rounded-xl ${theme.inputBg} outline-none`} onChange={e=>setData({...data, priceBottle: e.target.value})} required/></div>
                        </div>
                    ) : (
                        <div className="space-y-1"><label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Price (AED)</label><input type="number" value={data.price} className={`w-full p-3 rounded-xl ${theme.inputBg} outline-none transition-all focus:ring-2 ring-opacity-50`} onChange={e=>setData({...data, price: e.target.value})} required/></div>
                    )}
                </div>

                <div className="space-y-1"><label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Description</label><textarea value={data.description} className={`w-full p-3 rounded-xl ${theme.inputBg} outline-none h-24 resize-none transition-all focus:ring-2 ring-opacity-50`} onChange={e=>setData({...data, description: e.target.value})}/></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Ingredients</label><textarea value={data.ingredients} className={`w-full p-3 rounded-xl ${theme.inputBg} outline-none h-24 resize-none`} onChange={e=>setData({...data, ingredients: e.target.value})}/></div>
                    <div className="space-y-1"><label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Notes</label><textarea value={data.method} className={`w-full p-3 rounded-xl ${theme.inputBg} outline-none h-24 resize-none`} onChange={e=>setData({...data, method: e.target.value})}/></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Allergens</label>
                        <input list="allergen-suggestions" value={data.allergens} className={`w-full p-3 rounded-xl ${theme.inputBg} outline-none`} onChange={e => setData({...data, allergens: e.target.value})} placeholder="e.g. Dairy, Nuts..."/>
                        <datalist id="allergen-suggestions">{COMMON_ALLERGENS.map(alg => <option key={alg} value={alg} />)}</datalist>
                    </div>
                    <div className="space-y-1">
                        <label className={`text-xs font-bold uppercase ${theme.textMuted}`}>Trivia</label>
                        <input value={data.trivia} className={`w-full p-3 rounded-xl ${theme.inputBg} outline-none`} onChange={e => setData({...data, trivia: e.target.value})}/>
                    </div>
                </div>
                
                <div className={`p-6 border-2 border-dashed rounded-xl transition-colors hover:border-opacity-100 ${theme.name==='dark'?'border-white/10 hover:border-white/30':'border-gray-300 hover:border-gray-400'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${theme.inputBg}`}><ImageIcon size={24} className={theme.textMuted}/></div>
                        <div>
                            <p className={`text-sm font-bold ${theme.textMain}`}>{typeof data.image === 'string' ? "Image Saved" : (data.image ? "New File Selected" : "Upload Image")}</p>
                            <p className={`text-xs ${theme.textMuted}`}>Supports JPG, PNG, WEBP</p>
                        </div>
                        <input type="file" onChange={e=>setData({...data, image: e.target.files[0]})} className="ml-auto text-sm text-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                </div>
                <button type="submit" disabled={loading} className={`w-full py-4 ${theme.accentBg} text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2`}>
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle size={20}/>}
                    {loading ? "Saving..." : "Save Item"}
                </button>
            </form>
        </div>
    );
}

// --- 6. PAGE COMPONENTS ---

const Navbar = ({ toggleSidebar, toggleLogin, isAdmin, toggleTheme, theme, openSearch, isSearchOpen, closeSearch, fontLevel, setFontLevel }) => {
    const [term, setTerm] = useState("");
    const [filterType, setFilterType] = useState("Name"); 
    const [results, setResults] = useState([]);

    const handleSearchInput = async (val, type) => {
        // ... existing search logic (keep your existing search code here) ...
        setTerm(val); 
        if(!val) { setResults([]); return; }
        const snapshot = await getDocs(collection(db, "menu-items"));
        const allItems = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        const lower = val.toLowerCase();
        const filtered = allItems.filter(i => {
            if (type === "Allergen") return i.allergens?.toLowerCase().includes(lower);
            if (type === "Category") return i.subCategory?.toLowerCase().includes(lower) || (i.types && i.types.some(t => t.toLowerCase().includes(lower)));
            return i.name.toLowerCase().includes(lower) || i.description?.toLowerCase().includes(lower);
        });
        setResults(filtered.slice(0, 5));
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-24 transition-all duration-300 ${theme.navOverlay} shadow-sm`}>
            {isSearchOpen ? (
                 // ... keep your existing search open view ...
                <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-4 animate-fade-in-up">
                     <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className={theme.textMuted} size={20}/>
                        <select 
                            value={filterType} 
                            onChange={(e) => { setFilterType(e.target.value); handleSearchInput(term, e.target.value); }}
                            className={`bg-transparent border-none outline-none font-bold text-sm ${theme.textMuted} uppercase tracking-wider cursor-pointer`}
                        >
                            <option value="Name">Name</option>
                            <option value="Category">Category</option>
                            <option value="Allergen">Allergen</option>
                        </select>
                     </div>
                     <div className="flex-1 w-full relative flex items-center gap-4">
                        <input autoFocus placeholder={`Search by ${filterType}...`} className={`flex-1 bg-transparent border-none outline-none text-xl md:text-2xl font-light ${theme.textMain} placeholder:${theme.textMuted}`} value={term} onChange={(e) => handleSearchInput(e.target.value, filterType)} />
                        <button onClick={closeSearch} className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition ${theme.textMain}`}><X size={28}/></button>
                     </div>
                     {results.length > 0 && (
                        <div className={`absolute top-28 left-6 right-6 ${theme.cardBg} rounded-2xl overflow-hidden p-2 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[60vh] overflow-y-auto`}>
                            {results.map((r, i) => (
                                <Link to={`/item/${r.id}`} key={r.id} onClick={closeSearch} className={`flex items-center gap-4 p-4 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors animate-fade-in-up`} style={{animationDelay: `${i * 50}ms`}}>
                                     {r.image ? <img src={r.image} className="h-12 w-12 rounded-lg object-cover shadow-sm"/> : <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${theme.inputBg}`}><UtensilsCrossed size={20} className="opacity-50"/></div>}
                                     <div>
                                         <p className={`font-bold ${theme.textMain}`}>{r.name}</p>
                                         <p className={`text-xs ${theme.textMuted} flex items-center gap-1`}>{getCategoryIcon(r.subCategory)} {r.subCategory}</p>
                                     </div>
                                </Link>
                            ))}
                        </div>
                     )}
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        <button onClick={toggleSidebar} className={`p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition active:scale-90 ${theme.textMain}`}><Menu size={28} strokeWidth={1.5} /></button>
                        <button onClick={openSearch} className={`p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition active:scale-90 ${theme.textMain} opacity-70 hover:opacity-100`}><Search size={24} strokeWidth={1.5} /></button>
                    </div>
                    
                    <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 group">
                        <img src="https://i.imgur.com/zuqchK8.png" className={`h-8 md:h-10 w-auto object-contain transition duration-500 group-hover:scale-110 ${theme.name === 'dark' ? "brightness-0 invert opacity-90" : "opacity-80"}`} alt="Eauzone" />
                    </Link>
                    
                    <div className="flex items-center gap-1">
                        {/* FONT SIZE CONTROLS */}
                        <div className={`hidden md:flex items-center gap-1 mr-2 px-2 py-1 rounded-full border ${theme.name==='dark'?'border-white/10':'border-gray-200'}`}>
                            <button onClick={() => setFontLevel(-1)} className={`p-2 rounded-full transition ${fontLevel === -1 ? theme.accent : theme.textMuted} hover:${theme.textMain}`}><Type size={14} /></button>
                            <button onClick={() => setFontLevel(0)} className={`p-2 rounded-full transition ${fontLevel === 0 ? theme.accent : theme.textMuted} hover:${theme.textMain}`}><Type size={18} /></button>
                            <button onClick={() => setFontLevel(1)} className={`p-2 rounded-full transition ${fontLevel === 1 ? theme.accent : theme.textMuted} hover:${theme.textMain}`}><Type size={22} /></button>
                        </div>
                        
                        {/* THEME TOGGLE (Hidden in Valentine Mode) */}
                        {theme.name !== 'valentine' && (
                           <button onClick={toggleTheme} className={`p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition active:scale-90 ${theme.textMain} opacity-70 hover:opacity-100`}>{theme.name === 'dark' ? <Sun size={22} /> : <Moon size={22} />}</button>
                        )}
                        
                        <button onClick={toggleLogin} className={`p-3 rounded-full transition active:scale-90 ${isAdmin ? theme.accentBg + " text-white shadow-lg shadow-blue-500/30" : theme.textMain + " opacity-50 hover:bg-black/5 dark:hover:bg-white/10"}`}><Lock size={22} strokeWidth={1.5} /></button>
                    </div>
                </>
            )}
        </nav>
    );
};

const ContentRow = ({ title, categoryLink, sources, theme }) => {
  const [items, setItems] = useState([]);
  // If sources array is provided, use it. Otherwise, use the title as the single category.
  const queryCategories = sources || [title]; 

  const description = DESCRIPTIONS[title] || "Curated selection.";

  useEffect(() => {
    const fetchData = async () => {
      // 'in' operator allows up to 10 categories to be queried at once
      const q = query(
          collection(db, "menu-items"), 
          where("subCategory", "in", queryCategories), 
          limit(10) // Increased limit to show more variety
      );
      const snapshot = await getDocs(q);
      // Randomize the results so it's not always sorted by category
      const fetchedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(fetchedItems.sort(() => 0.5 - Math.random())); 
    };
    fetchData();
  }, [title, JSON.stringify(queryCategories)]); // Re-run if sources change

  if (items.length === 0) return null;

  return (
    <div className="mb-20 pl-6 animate-fade-in-up">
      <div className="flex flex-col items-center justify-center text-center mb-8 pr-6">
        <div className="flex w-full justify-between items-end">
             <div className="flex-1"></div> 
             <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 mb-2 opacity-50">
                    {/* If mixed, show a generic Star, otherwise specific icon */}
                    {sources ? <Sparkles size={18}/> : getCategoryIcon(title)}
                </div>
                <h2 className={`text-4xl font-serif ${theme.textMain}`}>{title}</h2>
                <p className={`text-sm ${theme.textMuted} mt-2 tracking-wide font-light`}>{description}</p>
             </div>
             <div className="flex-1 text-right">
                {/* Only show View All link if it points to a valid single category page */}
                {!sources && (
                    <Link to={categoryLink} className={`text-xs font-bold ${theme.accent} uppercase inline-flex items-center gap-1 hover:gap-2 transition-all`}>View All <ChevronRight size={14} /></Link>
                )}
             </div>
        </div>
      </div>
      
      <div className="flex overflow-x-auto gap-8 pb-12 snap-x hide-scrollbar pr-6 mt-2">
        {items.map((item, i) => (
           <Link to={`/item/${item.id}`} key={item.id} className={`group relative w-72 h-[28rem] flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${theme.name==='light' ? 'bg-white' : 'bg-neutral-900'}`} style={{animationDelay: `${i * 100}ms`}}>
             {item.image ? <img src={item.image} className="w-full h-full object-cover opacity-90 transition duration-700 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon size={40}/></div>}
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
             
             <div className="absolute bottom-0 left-0 right-0 p-8 z-20 transform transition-transform duration-500 group-hover:-translate-y-4">
                <h3 className="text-white font-serif text-3xl leading-tight mb-2 text-left drop-shadow-md">{item.name}</h3>
                <p className={`${theme.accent} font-mono text-xl text-left drop-shadow-sm`}>
                    {(item.priceGlass && item.priceGlass > 0) ? "VAR" : item.price} <span className="text-xs opacity-70">AED</span>
                </p>
             </div>

             <div className={`absolute inset-0 ${theme.hoverOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-start p-8 z-30 backdrop-blur-sm`}>
                 <p className={`${theme.textMain} line-clamp-5 mb-8 text-sm text-left leading-relaxed font-light`}>{item.description}</p>
                 <span className={`px-6 py-3 border ${theme.name==='light'?'border-blue-600 text-blue-600':'border-[#64ffda] text-[#64ffda]'} text-xs font-bold uppercase rounded-full hover:bg-white hover:text-black transition-colors shadow-lg`}>Read More</span>
             </div>
           </Link>
        ))}
      </div>
    </div>
  );
};

const HomePage = ({ openSearch, theme }) => {
  return (
    <div className={`min-h-screen ${theme.bgApp} ${theme.textMain}`}>
      <div className="relative h-[100dvh] w-full overflow-hidden">
        <div className="absolute inset-0 animate-scale-in" style={{animationDuration: '10s'}}>
           <img src="https://imgur.com/UJpkv1U.png" className="w-full h-full object-cover" alt="Eauzone Interior"/>
           <div className={`absolute inset-0 ${theme.heroOverlay}`}></div>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center z-10">
        <span className={`${theme.accent} tracking-[0.5em] text-xs font-bold uppercase mb-6 animate-fade-in-up stagger-1`}>The Official</span>
        <h1 className={`font-serif text-6xl md:text-9xl mb-6 tracking-tighter ${theme.textMain} drop-shadow-2xl animate-fade-in-up stagger-2`}>Bible</h1>
        <p className="max-w-xs md:max-w-md text-base md:text-xl font-light leading-relaxed opacity-90 mb-12 drop-shadow-md animate-fade-in-up stagger-3">Floating between the sky and sea, Eauzone offers modern Asian cuisine with an elegant twist.</p>
           <button onClick={openSearch} className={`group flex items-center gap-4 backdrop-blur-md border px-10 py-5 rounded-full hover:bg-white/20 transition-all shadow-2xl animate-fade-in-up stagger-4 ${theme.name==='light' ? 'bg-white/80 border-white text-gray-900' : 'bg-white/10 border-white/30 text-white'}`}>
             <Search size={22} className={theme.name==='light'?'text-gray-900':theme.accent} />
             <span className="font-light tracking-widest text-sm">SEARCH MENU</span>
           </button>
        </div>
      </div>
      
      <div className="py-24">
         {/* 1. MIXED ROW: Shows Sushi, Starters, and Salads together */}
         <ContentRow 
            title="Starters Collection" 
            sources={["Sushi", "Starters"]} 
            theme={theme} 
         />

         {/* 2. SINGLE ROW: Just Mains */}
         <ContentRow 
            title="Mains" 
            categoryLink="/category/Mains" 
            theme={theme} 
         />

         {/* 3. MIXED ROW: Drinks Highlights */}
         <ContentRow 
            title="Liquid Art" 
            sources={["Cocktails", "Mocktails", "Wines"]} 
            theme={theme} 
         />
      </div>
      
      <Footer theme={theme} />
    </div>
  );
};

const CategoryPage = ({ isAdmin, showToast, theme }) => {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState("All");
  const [deleteId, setDeleteId] = useState(null);

  const subs = SUBCATEGORIES[id] || [];
  const hasSubs = subs.length > 0;
  // Dynamic description based on filter
  const description = DESCRIPTIONS[`${id}-${filter}`] || DESCRIPTIONS[id] || "Curated selection.";
  const bgImage = getBackground(id, filter !== "All" ? filter : "");

  const fetchItems = async () => {
    const q = query(collection(db, "menu-items"), where("subCategory", "==", id));
    const snapshot = await getDocs(q);
    setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchItems();
    setFilter("All");
  }, [id]);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteDoc(doc(db, "menu-items", deleteId));
      fetchItems();
      showToast("Deleted", "success");
      setDeleteId(null);
    }
  };

  // Filter logic supports arrays of types now
  const displayedItems = hasSubs && filter !== "All" 
    ? items.filter((i) => (i.types && i.types.includes(filter)) || i.type === filter) 
    : items;

  return (
    <div className={`min-h-screen ${theme.bgApp} ${theme.textMain} transition-colors duration-500`}>
      <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden flex items-center justify-center text-center">
        <img src={bgImage} className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 animate-scale-in" style={{ animationDuration: "5s" }} alt="Category Background" />
        <div className={`absolute inset-0 ${theme.heroOverlay} bg-black/40`}></div>
        <div className="relative z-10 px-6 animate-fade-in-up">
          <div className="flex justify-center mb-4 text-white/80 scale-75 md:scale-100">{getCategoryIcon(id)}</div>
          <h1 className="text-4xl md:text-7xl font-serif text-white drop-shadow-2xl mb-4 capitalize">{id.replace("-", " ")}</h1>
          <p className="text-white/90 text-sm md:text-xl font-light max-w-lg mx-auto drop-shadow-md leading-relaxed px-4">{description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 pb-24">
        {hasSubs && (
          <div className="relative mb-12 animate-fade-in-up stagger-1">
            <div className="flex flex-nowrap gap-2 md:gap-3 overflow-x-auto hide-scrollbar p-2 -mx-6 px-6 w-full">
              {["All", ...subs].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-shrink-0 px-5 py-2 md:px-6 md:py-2 rounded-full text-[10px] md:text-xs font-bold backdrop-blur-md border transition-all shadow-lg ${
                    filter === f
                      ? `${theme.accentBg} text-white border-transparent`
                      : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center md:justify-end mb-10">
          {isAdmin && !showAdd && !editingItem && (
            <button onClick={() => setShowAdd(true)} className={`${theme.accentBg} text-white px-6 py-2.5 md:px-8 md:py-3 rounded-full text-xs md:text-sm font-bold shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2`}><Plus size={16} /> Add New</button>
          )}
        </div>

        {(showAdd || editingItem) && (
          <div className="mb-12 animate-scale-in">
            <AddItemForm category={id} onCancel={() => { setShowAdd(false); setEditingItem(null); }} onRefresh={fetchItems} showToast={showToast} theme={theme} initialData={editingItem} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {displayedItems.map((item, i) => (
            <Link to={`/item/${item.id}`} key={item.id} className="block group animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`relative h-72 md:h-80 ${theme.cardBg} rounded-2xl overflow-hidden mb-4 border shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 ${theme.name === "dark" ? "border-white/5" : "border-gray-100"}`}>
                {item.image ? (
                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" alt={item.name} />
                ) : (
                  <div className="flex items-center justify-center h-full opacity-10"><ImageIcon size={40} /></div>
                )}
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.preventDefault(); setEditingItem(item); }} className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition"><Edit2 size={14} /></button>
                    <button onClick={(e) => { e.preventDefault(); setDeleteId(item.id); }} className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition"><Trash2 size={14} /></button>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 pointer-events-none"></div>
                <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                  <div className="flex flex-col items-start">
                     <h3 className="text-xl md:text-2xl font-serif text-white leading-tight drop-shadow-md">{item.name}</h3>
                     {/* WINE BODY INDICATOR ON CARD */}
                     {item.body && <span className="text-[10px] uppercase tracking-widest text-white/70 mt-1">{item.body}</span>}
                  </div>
                  <span className="text-sm md:text-base font-light text-white bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                    {/* Display logic for housepouring pricing on card */}
                    {(item.priceGlass && item.priceGlass > 0) ? (
                        <span className="text-xs font-bold">{item.priceGlass} <span className="opacity-50 text-[10px] font-normal">/</span> {item.priceBottle}</span>
                    ) : (
                        item.price
                    )}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Item" message="Are you sure?" theme={theme} />
      <Footer theme={theme} />
    </div>
  );
};

const ItemDetailsPage = ({ theme, openSearch }) => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  // NEW: State for Toggle "Simple Mode"
  const [isSimple, setIsSimple] = useState(false);

  useEffect(() => {
    const f = async () => {
      const s = await getDoc(doc(db, "menu-items", itemId));
      if (s.exists()) setItem({ id: s.id, ...s.data() });
    };
    f();
  }, [itemId]);

  if (!item) return (
    <div className={`min-h-screen ${theme.bgApp} flex items-center justify-center`}>
      <Loader2 className="animate-spin" size={40} />
    </div>
  );
  
  const isHousepouring = (item.types && item.types.includes("Housepouring")) || item.type === "Housepouring";

  return (
    <div className={`min-h-screen ${theme.bgApp} ${theme.textMain} flex flex-col md:flex-row transition-colors duration-500`}>
      <div className="w-full md:w-1/2 h-[40vh] md:h-screen md:sticky md:top-0 relative overflow-hidden group">
        {item.image ? (
          <img src={item.image} className="w-full h-full object-cover transition duration-1000 group-hover:scale-105" alt={item.name} />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${theme.bgApp}`}><ImageIcon size={64} className={`opacity-20 ${theme.textMain}`} /></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none"></div>
        <button onClick={() => navigate(-1)} className={`absolute top-6 left-6 md:top-8 md:left-8 p-3 md:p-4 rounded-full backdrop-blur-xl shadow-2xl z-20 ${theme.name === 'dark' ? 'bg-black/40 text-white hover:bg-white hover:text-black' : 'bg-white/60 text-black hover:bg-black hover:text-white'} transition-all hover:scale-110`}><ArrowLeft size={20} /></button>
      </div>

      <div className="w-full md:w-1/2 p-6 md:p-20 flex flex-col animate-slide-in">
        
        {/* Header Row: Badges + Toggle */}
        <div className="flex justify-between items-start mb-4 md:mb-6 animate-fade-in-up stagger-1">
            <div className="flex flex-wrap items-center gap-2">
                <span className={`${theme.accent} tracking-[0.1em] uppercase text-[9px] md:text-xs font-bold flex items-center gap-1.5 border border-current px-2.5 py-1 rounded-full`}>
                    {getCategoryIcon(item.subCategory)} {item.subCategory}
                </span>
                {item.types && item.types.map(t => (
                    <span key={t} className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-bold ${theme.cardBg} border ${theme.name === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>{t}</span>
                ))}
                {!item.types && item.type && (
                    <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-bold ${theme.cardBg} border ${theme.name === 'dark' ? 'border-white/10' : 'border-gray-200'}`}>{item.type}</span>
                )}
                {item.body && (
                    <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-bold bg-purple-900/20 text-purple-400 border border-purple-900/30 flex items-center gap-1`}><Grape size={10}/> {item.body}</span>
                )}
            </div>
            
            {/* TOGGLE BUTTON */}
            <button 
                onClick={() => setIsSimple(!isSimple)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${isSimple ? theme.accentBg + ' text-white border-transparent' : theme.textMuted + ' border-gray-500/20'}`}
            >
                {isSimple ? <EyeOff size={14}/> : <Eye size={14}/>}
                {isSimple ? "Simplified" : "Full View"}
            </button>
        </div>

        <h1 className={`text-3xl md:text-7xl font-serif mb-2 md:mb-6 leading-tight ${theme.textMain} animate-fade-in-up stagger-2`}>{item.name}</h1>
        
        <div className="text-2xl md:text-4xl font-light mb-8 md:mb-12 animate-fade-in-up stagger-3">
          {isHousepouring ? (
              <div className="flex flex-col gap-1">
                  <span className="flex items-baseline gap-2">{item.priceGlass} <span className="text-xs md:text-sm opacity-50 font-bold uppercase">Glass (150ml)</span></span>
                  <span className="flex items-baseline gap-2 text-xl md:text-2xl opacity-70">{item.priceBottle} <span className="text-xs md:text-sm opacity-50 font-bold uppercase">Bottle</span></span>
              </div>
          ) : (
              <span>{item.price} <span className="text-xs md:text-base opacity-50 font-bold">AED</span></span>
          )}
        </div>

        <div className="space-y-8 md:space-y-14 animate-fade-in-up stagger-4">
          <div><h4 className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${theme.textMuted} mb-2 md:mb-3 flex items-center gap-2`}><FileText size={14} /> Description</h4><p className="text-base md:text-xl leading-relaxed opacity-90 font-light">{item.description}</p></div>
          
          {item.ingredients && (<div><h4 className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${theme.textMuted} mb-3 md:mb-4 flex items-center gap-2`}><UtensilsCrossed size={14} /> Ingredients</h4><ul className="grid grid-cols-1 gap-2 md:gap-3">{item.ingredients.split(',').map((ing, i) => (<li key={i} className="flex items-start gap-3 opacity-80 font-light text-sm md:text-base"><span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${theme.accentBg}`}></span><span>{ing.trim()}</span></li>))}</ul></div>)}
          
          {/* LOGIC: HIDE NOTES IN SIMPLE MODE */}
          {!isSimple && item.method && (
             <div className={`p-5 md:p-8 rounded-2xl border ${theme.name === 'dark' ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
                 <h4 className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 md:mb-4"><BookOpen size={16} /> Notes</h4>
                 <p className="text-xs md:text-base opacity-80 font-light whitespace-pre-wrap leading-relaxed">{item.method}</p>
             </div>
          )}

          <div className="space-y-8 md:space-y-10">
            {item.allergens && (<div><h4 className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-red-400 mb-3 md:mb-4"><AlertTriangle size={14} /> Allergens</h4><div className="flex flex-wrap gap-2 md:gap-3">{item.allergens.split(',').map(tag => (<button key={tag} onClick={() => openSearch(tag.trim())} className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold border transition-all active:scale-95 ${theme.name === 'dark' ? 'border-red-900/50 text-red-200 bg-red-900/10' : 'border-red-200 text-red-600 bg-red-50'}`}>{getAllergenIcon(tag)} {tag.trim()}</button>))}</div></div>)}
            
            {/* LOGIC: HIDE TRIVIA IN SIMPLE MODE */}
            {!isSimple && item.trivia && (
                <div className="pt-2 md:pt-4">
                    <h4 className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6"><Sparkles size={14} className="text-yellow-500" /> Trivia</h4>
                    <ul className="space-y-3 md:space-y-4">{item.trivia.split('.').filter(t => t.trim().length > 0).map((t, i) => (<li key={i} className="flex flex-col items-center text-center gap-2 md:gap-3 text-xs md:text-sm opacity-90 italic bg-yellow-500/10 p-5 md:p-8 rounded-2xl border border-yellow-500/20"><span className="text-yellow-500 text-lg md:text-xl">✨</span><span className="leading-relaxed">{t.trim()}</span></li>))}</ul>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
