import {
  Gamepad2,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Camera,
  Drone,
  Cpu,
} from "lucide-react";

// Categorías principales de la tienda (se usan en el menú, el home y el footer).
// El nombre debe coincidir con el campo "categoria" de los productos en Firestore.
export const MAIN_CATEGORIES = [
  { name: "Gaming", icon: Gamepad2, tagline: "Consolas y accesorios" },
  { name: "Audio", icon: Headphones, tagline: "Auriculares y parlantes" },
  { name: "Periféricos", icon: Keyboard, tagline: "Teclados y mouses" },
  { name: "Computación", icon: Laptop, tagline: "Notebooks y PCs" },
  { name: "Monitores", icon: Monitor, tagline: "Alta frecuencia" },
  { name: "Tecnología", icon: Cpu, tagline: "Gadgets y smart" },
  { name: "Fotografía", icon: Camera, tagline: "Cámaras y lentes" },
  { name: "Drones", icon: Drone, tagline: "Vuelo y filmación" },
];

export const categoryUrl = (name) =>
  `/productos?categoria=${encodeURIComponent(name)}`;

// Condiciones comerciales compartidas por todo el sitio.
export const ENVIO_GRATIS_DESDE = 50000;
export const CUOTAS_SIN_INTERES = 12;
export const DESCUENTO_TRANSFERENCIA = 0.15;
