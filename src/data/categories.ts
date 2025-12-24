import { ContentCategory, CategoryInfo } from "@/types";
import categoryCinema from "@/assets/category-cinema.jpg";
import categoryArt from "@/assets/category-art.jpg";
import categoryTech from "@/assets/category-tech.jpg";
import categoryBooks from "@/assets/category-books.jpg";
import categoryNature from "@/assets/category-nature.jpg";
import categoryMusic from "@/assets/category-music.jpg";

export const categories: CategoryInfo[] = [
  {
    id: "cinema",
    name: "Cinema",
    icon: "🎬",
    description: "Films tokenized with transparent royalty splits. Early viewers leave detailed reviews and earn CreovateDAO Tokens.",
    color: "hsl(260, 60%, 50%)",
    gradient: "from-violet-500 to-purple-600",
    coverImage: categoryCinema,
    postsCount: 2340,
    creatorsCount: 456,
  },
  {
    id: "art",
    name: "Art",
    icon: "🎨",
    description: "Digital artists mint NFT collections. Collectors and reviewers earn tokens for detailed, community-vetted critiques.",
    color: "hsl(320, 100%, 60%)",
    gradient: "from-pink-500 to-rose-600",
    coverImage: categoryArt,
    postsCount: 5670,
    creatorsCount: 890,
  },
  {
    id: "tech",
    name: "Tech",
    icon: "💻",
    description: "Developers publish open-source tools. Users review and rate code quality to earn tokens.",
    color: "hsl(142, 76%, 46%)",
    gradient: "from-emerald-500 to-green-600",
    coverImage: categoryTech,
    postsCount: 1890,
    creatorsCount: 234,
  },
  {
    id: "books",
    name: "Books",
    icon: "📚",
    description: "Indie authors tokenize chapters. Readers stake tokens to unlock content and meaningful reviews earn rewards.",
    color: "hsl(45, 100%, 50%)",
    gradient: "from-amber-500 to-orange-600",
    coverImage: categoryBooks,
    postsCount: 3450,
    creatorsCount: 567,
  },
  {
    id: "nature",
    name: "Nature",
    icon: "🌿",
    description: "Environmental projects tokenized. Donors or reviewers who verify results earn tokens for conservation advocacy.",
    color: "hsl(160, 84%, 39%)",
    gradient: "from-teal-500 to-emerald-600",
    coverImage: categoryNature,
    postsCount: 1230,
    creatorsCount: 189,
  },
  {
    id: "music",
    name: "Music",
    icon: "🎶",
    description: "Fans discover new artists, review songs, or curate playlists. Engagement drives streams and token rewards.",
    color: "hsl(280, 100%, 60%)",
    gradient: "from-purple-500 to-fuchsia-600",
    coverImage: categoryMusic,
    postsCount: 4560,
    creatorsCount: 678,
  },
];

export const getCategoryById = (id: ContentCategory): CategoryInfo | undefined => {
  return categories.find((cat) => cat.id === id);
};

export const getCategoryColor = (id: ContentCategory): string => {
  const category = getCategoryById(id);
  return category?.color || "hsl(var(--primary))";
};

export const getCategoryGradient = (id: ContentCategory): string => {
  const category = getCategoryById(id);
  return category?.gradient || "from-primary to-secondary";
};
