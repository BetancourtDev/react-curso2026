import Item from "./Item";
import styles from "./ItemList.module.css";

const ItemList = ({ productos, onRequestDelete }) => {
  // Informa cuando no hay productos que coincidan con la búsqueda o los filtros.
  if (!productos || productos.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>No encontramos productos para tu búsqueda. Probá con otras palabras o revisá todas las categorías.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {/* Usa el identificador de cada producto como clave estable de React. */}
      {productos.map((producto) => (
        <Item
          key={producto.id}
          {...producto}
          onRequestDelete={onRequestDelete}
        />
      ))}
    </div>
  );
};

export default ItemList;