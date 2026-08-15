export type StoreProductStatus = "sold_out" | "archived" | "available";

export type StoreProduct = {
  id: string;
  name: string;
  image?: string;
  imageFit?: "cover" | "contain";
  imagePosition?: string;
  softenFace?: boolean;
  price?: string;
  status: StoreProductStatus;
  event?: string;
  soldOut: boolean;
  description?: string;
  featured?: boolean;
};

export const storeArchiveProducts: StoreProduct[] = [
  {
    id: "product-01",
    name: "Reworked High Flip T-Shirt",
    image: "/drive-assets/store/archive/IMG_0298-web.jpg",
    imageFit: "contain",
    imagePosition: "50% 50%",
    softenFace: true,
    status: "sold_out",
    soldOut: true,
    description: "IMG_0298.PNG"
  },
  {
    id: "product-02",
    name: "Denim PushTakim Durag",
    image: "/drive-assets/store/archive/IMG_7837-web.jpg",
    imageFit: "contain",
    imagePosition: "50% 50%",
    status: "sold_out",
    soldOut: true,
    description: "IMG_7837.JPG",
    featured: true
  },
  {
    id: "product-03",
    name: "Denim Key Chain & PushTakim Logo Clipper Holder",
    image: "/drive-assets/store/archive/IMG_7841-web.jpg",
    imageFit: "contain",
    imagePosition: "50% 50%",
    status: "sold_out",
    soldOut: true,
    description: "IMG_7841.JPG"
  },
  {
    id: "product-04",
    name: "Horns Hat 🧢",
    image: "/drive-assets/store/archive/IMG_7852-web.jpg",
    imageFit: "contain",
    imagePosition: "50% 50%",
    status: "sold_out",
    soldOut: true,
    description: "IMG_7852.JPG"
  },
  {
    id: "product-05",
    name: "Black Classic Pushtakim T-Shirt",
    image: "/drive-assets/store/archive/IMG_7857-web.jpg",
    imageFit: "contain",
    imagePosition: "50% 50%",
    status: "sold_out",
    soldOut: true,
    description: "IMG_7857.JPG"
  },
  {
    id: "product-06",
    name: "Denim PushTakim Durag",
    image: "/drive-assets/store/archive/aliram-pushtakim-cap-web.jpg",
    imageFit: "contain",
    imagePosition: "50% 50%",
    status: "sold_out",
    soldOut: true,
    description: "Photo 1.jpg"
  },
  {
    id: "product-07",
    name: "Horn Beanie",
    image: "/drive-assets/store/archive/aliram-horn-beanie-web.jpg",
    imageFit: "contain",
    imagePosition: "50% 50%",
    status: "sold_out",
    soldOut: true,
    description: "Photo 2.jpg"
  }
];
