import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


// Configuración de la aplicación registrada en Firebase.
const firebaseConfig = {
  apiKey: 'AIzaSyCKscIyC2UzIPnoU8G7g0eu62Yjb1K3Y2w',
  authDomain: 'tienda-online-7e77f.firebaseapp.com',
  projectId: 'tienda-online-7e77f',
  storageBucket: 'tienda-online-7e77f.firebasestorage.app',
  messagingSenderId: '874698166580',
  appId: '1:874698166580:web:f089c7f5611d864ec85561',
};

// Inicializa Firebase con la configuración del proyecto.
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
