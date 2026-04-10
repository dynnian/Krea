// lib/normalizePaginated.ts

/**
 * Convierte una respuesta paginada del backend (con $values) en un objeto plano.
 * Si la respuesta ya es un array, la devuelve tal cual.
 */
export function normalizePaginatedResponse<T>(data: any): T[] {
  // Si es un array directo, lo devolvemos
  if (Array.isArray(data)) return data;

  // Si tiene la estructura { items: { $values: [...] } }
  if (data?.items?.$values && Array.isArray(data.items.$values)) {
    return data.items.$values;
  }

  // Si tiene la estructura { flat: { items: { $values: [...] } } } (para replies)
  if (data?.flat?.items?.$values && Array.isArray(data.flat.items.$values)) {
    return data.flat.items.$values;
  }

  // Si tiene la estructura { items: [...] } (sin $values)
  if (data?.items && Array.isArray(data.items)) {
    return data.items;
  }

  // Fallback: array vacío
  console.warn("Unexpected paginated response format:", data);
  return [];
}
