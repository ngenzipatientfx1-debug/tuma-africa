export const translations = {
  en: {
    // Header
    appName: "Tuma-Africa Link Cargo",
    login: "Login",
    signup: "Sign Up",
    logout: "Logout",
    home: "Home",
    dashboard: "Dashboard",
    inbox: "Inbox",
    
    // Hero
    heroHeading: "Order From All Chinese E-commerce Platforms Stress-Free",
    heroSubheading: "Only Link — We Handle The Rest.",
    heroTagline: "Africa Link Cargo — Smarter Shipping.",
    heroButton: "Tuma-Africa Link Cargo",
    
    // Link Paste Area
    linkPasteHeading: "Paste Your Product Link",
    linkPasteDesc: "Paste your product link from Chinese e-commerce sites below and provide details. We'll handle the rest.",
    productLink: "Product Link",
    productName: "Product Name",
    quantity: "Quantity",
    variation: "Variation (e.g., color, size)",
    specifications: "Specifications",
    notes: "Additional Notes",
    screenshot: "Product Screenshot",
    shippingAddress: "Shipping Address",
    submitOrder: "Submit Order",
    orderSuccess: "We are going to find this product for you shortly. We'll reach you in your inbox for more details.",
    verificationRequired: "Please verify your account before making an order.",
    
    // Photo Compressor
    compressorHeading: "Photo Compressor",
    compressorDesc: "Upload a photo up to 15 MB to get a compressed version between 100 and 150 KB.",
    selectPhoto: "Select Photo",
    compress: "Compress",
    download: "Download",
    
    // About Us
    aboutHeading: "About Us",
    aboutSubheading: "Connecting Africa to China — Reliable. Simple. Smart.",
    
    // Footer
    termsPrivacy: "Terms & Privacy Policy",
    ourCompanies: "Our Other Companies",
    copyright: "© 2025 Africa Link Cargo",
    
    // Dashboard
    myDashboard: "My Dashboard",
    orders: "Orders",
    orderMade: "Order Made",
    declined: "Declined",
    approved: "Approved",
    orderTracking: "Order Tracking",
    makeNewOrder: "Make New Order",
    profile: "Profile & Verification",
    verificationStatus: "Verification Status",
    verified: "Verified",
    pending: "Pending",
    notVerified: "Not Verified",
    uploadDocuments: "Upload Verification Documents",
    governmentId: "Government ID",
    selfieWithId: "Selfie with ID",
    
    // Order Stages
    purchasedFromChina: "Purchased from China",
    inWarehouse: "In Warehouse",
    inShip: "In Ship/Airplane",
    inRwanda: "In Rwanda",
    delivered: "Delivered",
  },
  rw: {
    // Header
    appName: "Tuma-Africa Link Cargo",
    login: "Injira",
    signup: "Iyandikishe",
    logout: "Sohoka",
    home: "Ahabanza",
    dashboard: "Ibikubiyemo",
    inbox: "Ubutumwa",
    
    // Hero
    heroHeading: "Gutumiza Ibicuruzwa Byo Mu Bushinwa Bidakomeye",
    heroSubheading: "Gusa Shyira Link — Twebwe Tugakora Ibindi Byose.",
    heroTagline: "Africa Link Cargo — Uburyo Bwiza Bwo Kohereza.",
    heroButton: "Tuma-Africa Link Cargo",
    
    // Link Paste Area
    linkPasteHeading: "Shyira Link Y'Igicuruzwa",
    linkPasteDesc: "Shyira link y'igicuruzwa hano hepfo kandi utange amakuru. Twebwe tuzakora ibindi byose.",
    productLink: "Link Y'Igicuruzwa",
    productName: "Izina Ry'Igicuruzwa",
    quantity: "Umubare",
    variation: "Itandukaniro (urugero: ibara, ingano)",
    specifications: "Ibisobanuro",
    notes: "Andi Makuru",
    screenshot: "Ifoto Y'Igicuruzwa",
    shippingAddress: "Aho Kuzohererezwa",
    submitOrder: "Ohereza Icyifuzo",
    orderSuccess: "Murakoze, mu gihe kitarambiranye urabona ubutumwa bugaha andi makuru arambuye ku gicuruzwa ushaka. Africa Link Cargo — Smarter Shipping.",
    verificationRequired: "Shyira Konti Yawe Mbere Yo Gutumiza.",
    
    // Photo Compressor
    compressorHeading: "Gufungura Amafoto",
    compressorDesc: "Shyira ifoto igera kuri 15 MB kugira ngo uyifungure kugeza kuri 100-150 KB.",
    selectPhoto: "Hitamo Ifoto",
    compress: "Fungura",
    download: "Pakurura",
    
    // About Us
    aboutHeading: "Abo Turi",
    aboutSubheading: "Guhuza Afurika n'Ubushinwa — Byizewe. Byoroshye. Byubwenge.",
    
    // Footer
    termsPrivacy: "Amabwiriza n'Ubuzima Bwite",
    ourCompanies: "Izindi Sosiyete Zacu",
    copyright: "© 2025 Africa Link Cargo",
    
    // Dashboard
    myDashboard: "Ibikubiyemo Byanjye",
    orders: "Ibicuruzwa",
    orderMade: "Byatumijwe",
    declined: "Byanzwe",
    approved: "Byemewe",
    orderTracking: "Gukurikirana Ibicuruzwa",
    makeNewOrder: "Tuma Igicuruzwa Gishya",
    profile: "Umwirondoro & Kwemeza",
    verificationStatus: "Uko Kwemeza Kugenda",
    verified: "Byemejwe",
    pending: "Birategerezwa",
    notVerified: "Ntibwemejwe",
    uploadDocuments: "Shyira Ibyangombwa Byo Kwemeza",
    governmentId: "Indangamuntu",
    selfieWithId: "Ifoto Ufite Indangamuntu",
    
    // Order Stages
    purchasedFromChina: "Byagurijwe Mu Bushinwa",
    inWarehouse: "Mu Bubiko",
    inShip: "Mu Ndege/Ubwato",
    inRwanda: "Mu Rwanda",
    delivered: "Byakiriwe",
  }
};

export type Language = "en" | "rw";

export const useTranslation = (lang: Language = "en") => {
  return {
    t: (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key],
    lang,
  };
};
