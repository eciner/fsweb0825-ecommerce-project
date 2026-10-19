import { turkishProvinces } from "../data/locations";
export const popularCities = ["İstanbul", "Ankara", "İzmir"];
export const orderedProvinces = [...popularCities, ...turkishProvinces.filter(city => !popularCities.includes(city)).sort(new Intl.Collator("tr").compare)];
export const foldCity = value => String(value).toLocaleLowerCase("tr").normalize("NFD").replace(/\p{M}/gu, "").replace(/ı/g, "i").trim();
export const matchingCities = query => orderedProvinces.filter(city => foldCity(city).includes(foldCity(query)));
