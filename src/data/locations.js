// Province names; district/neighborhood suggestions below are deliberately partial.
// Free entry remains available for every field, including international addresses.
export const turkishProvinces =
  "Adana|Adıyaman|Afyonkarahisar|Ağrı|Amasya|Ankara|Antalya|Artvin|Aydın|Balıkesir|Bilecik|Bingöl|Bitlis|Bolu|Burdur|Bursa|Çanakkale|Çankırı|Çorum|Denizli|Diyarbakır|Edirne|Elazığ|Erzincan|Erzurum|Eskişehir|Gaziantep|Giresun|Gümüşhane|Hakkâri|Hatay|Isparta|Mersin|İstanbul|İzmir|Kars|Kastamonu|Kayseri|Kırklareli|Kırşehir|Kocaeli|Konya|Kütahya|Malatya|Manisa|Kahramanmaraş|Mardin|Muğla|Muş|Nevşehir|Niğde|Ordu|Rize|Sakarya|Samsun|Siirt|Sinop|Sivas|Tekirdağ|Tokat|Trabzon|Tunceli|Şanlıurfa|Uşak|Van|Yozgat|Zonguldak|Aksaray|Bayburt|Karaman|Kırıkkale|Batman|Şırnak|Bartın|Ardahan|Iğdır|Yalova|Karabük|Kilis|Osmaniye|Düzce".split(
    "|",
  );

export const locationSuggestions = {
  İstanbul: {
    Kadıköy: ["Caferağa", "Moda", "Fenerbahçe"],
    Beşiktaş: ["Abbasağa", "Bebek"],
  },
  Ankara: { Çankaya: ["Kızılay", "Bahçelievler"] },
  İzmir: { Konak: ["Alsancak"], Karşıyaka: ["Bostanlı"] },
};

export function suggestedDistricts(city) {
  return Object.keys(locationSuggestions[city] || {});
}
export function suggestedNeighborhoods(city, district) {
  return locationSuggestions[city]?.[district] || [];
}

export const dialingCodes = [
  ["+90", "Türkiye"],
  ["+44", "United Kingdom"],
  ["+49", "Germany"],
  ["+1", "United States / Canada"],
  ["+33", "France"],
  ["other", "Other dialing code"],
];
