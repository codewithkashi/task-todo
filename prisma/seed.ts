import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  console.log("🌱 Starting database seed...");
  await prisma.area.deleteMany();
  await prisma.city.deleteMany();
  await prisma.country.deleteMany();
  const countries = [
    { id: "uae", name: "United Arab Emirates", code: "UAE" },
    { id: "usa", name: "United States", code: "USA" },
    { id: "uk", name: "United Kingdom", code: "UK" },
    { id: "canada", name: "Canada", code: "CA" },
    { id: "australia", name: "Australia", code: "AU" },
    { id: "germany", name: "Germany", code: "DE" },
    { id: "france", name: "France", code: "FR" },
    { id: "japan", name: "Japan", code: "JP" },
  ];
  for (const country of countries) {
    await prisma.country.create({
      data: country,
    });
  }
  const cities = [
    { id: "dubai", name: "Dubai", countryId: "uae" },
    { id: "abudhabi", name: "Abu Dhabi", countryId: "uae" },
    { id: "sharjah", name: "Sharjah", countryId: "uae" },
    { id: "nyc", name: "New York City", countryId: "usa" },
    { id: "la", name: "Los Angeles", countryId: "usa" },
    { id: "chicago", name: "Chicago", countryId: "usa" },
    { id: "london", name: "London", countryId: "uk" },
    { id: "manchester", name: "Manchester", countryId: "uk" },
    { id: "birmingham", name: "Birmingham", countryId: "uk" },
    { id: "toronto", name: "Toronto", countryId: "canada" },
    { id: "vancouver", name: "Vancouver", countryId: "canada" },
    { id: "montreal", name: "Montreal", countryId: "canada" },
    { id: "sydney", name: "Sydney", countryId: "australia" },
    { id: "melbourne", name: "Melbourne", countryId: "australia" },
    { id: "brisbane", name: "Brisbane", countryId: "australia" },
    { id: "berlin", name: "Berlin", countryId: "germany" },
    { id: "munich", name: "Munich", countryId: "germany" },
    { id: "hamburg", name: "Hamburg", countryId: "germany" },
    { id: "paris", name: "Paris", countryId: "france" },
    { id: "marseille", name: "Marseille", countryId: "france" },
    { id: "lyon", name: "Lyon", countryId: "france" },
    { id: "tokyo", name: "Tokyo", countryId: "japan" },
    { id: "osaka", name: "Osaka", countryId: "japan" },
    { id: "kyoto", name: "Kyoto", countryId: "japan" },
  ];
  for (const city of cities) {
    await prisma.city.create({
      data: city,
    });
  }
  const areas = [
    { id: "downtown", name: "Downtown Dubai", cityId: "dubai" },
    { id: "marina", name: "Dubai Marina", cityId: "dubai" },
    { id: "palm", name: "Palm Jumeirah", cityId: "dubai" },
    { id: "corniche", name: "Corniche", cityId: "abudhabi" },
    { id: "saadiyat", name: "Saadiyat Island", cityId: "abudhabi" },
    { id: "manhattan", name: "Manhattan", cityId: "nyc" },
    { id: "brooklyn", name: "Brooklyn", cityId: "nyc" },
    { id: "queens", name: "Queens", cityId: "nyc" },
    { id: "westminster", name: "Westminster", cityId: "london" },
    { id: "camden", name: "Camden", cityId: "london" },
    { id: "greenwich", name: "Greenwich", cityId: "london" },
    { id: "downtown-toronto", name: "Downtown Toronto", cityId: "toronto" },
    { id: "north-york", name: "North York", cityId: "toronto" },
    { id: "scarborough", name: "Scarborough", cityId: "toronto" },
    { id: "cbd", name: "Central Business District", cityId: "sydney" },
    { id: "bondi", name: "Bondi Beach", cityId: "sydney" },
    { id: "manly", name: "Manly", cityId: "sydney" },
    { id: "mitte", name: "Mitte", cityId: "berlin" },
    { id: "kreuzberg", name: "Kreuzberg", cityId: "berlin" },
    { id: "charlottenburg", name: "Charlottenburg", cityId: "berlin" },
    { id: "le-marais", name: "Le Marais", cityId: "paris" },
    { id: "montmartre", name: "Montmartre", cityId: "paris" },
    { id: "champs-elysees", name: "Champs-Élysées", cityId: "paris" },
    { id: "shibuya", name: "Shibuya", cityId: "tokyo" },
    { id: "shinjuku", name: "Shinjuku", cityId: "tokyo" },
    { id: "harajuku", name: "Harajuku", cityId: "tokyo" },
  ];
  for (const area of areas) {
    await prisma.area.create({
      data: area,
    });
  }
}
main()
  .catch((e) => {
    console.error("seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
