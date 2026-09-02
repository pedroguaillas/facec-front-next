# Módulo Productos

Documentación funcional del formulario de creación/edición de productos.
Ubicación del código: `app/(route)/products/`.

## Entidad `Product`

Definida en `types/product.d.ts`.

| Campo        | Tipo               | Notas                                                     |
|--------------|---------------------|------------------------------------------------------------|
| `id`         | `string`            | `nanoid()` en creación; en edición se castea el id numérico del backend a string |
| `code`       | `string`            | Requerido, máx. 25 caracteres                              |
| `aux_cod`    | `string?`           | Código de categoría SRI seleccionada (`SriCategory.code`)  |
| `type_product` | `number`          | `1` = Producto, `2` = Servicio (ver `useProductForm.optionType`) |
| `name`       | `string`            | Requerido, mín. 3 / máx. 300 caracteres                    |
| `unity_id`   | `number?`           | No se usa actualmente en el formulario                     |
| `iva`        | `number`            | Código de tarifa IVA (catálogo `ivaTaxes`); `5` = tarifa "IVA 5%" |
| `ice`        | `string?`           | Código ICE, solo si `iceCataloges` trae opciones            |
| `stock`      | `number?`           |                                                              |
| `price1`     | `string \| number`  | Precio sin impuestos                                        |

## Carga inicial del formulario

`ProductFormContext.tsx` obtiene, vía `getCreateProduct` / `getEditProduct`
(`services/productServices.ts`), un `ProductCreateResponse`:

```ts
interface ProductCreateResponse {
  ivaTaxes: [];
  iceCataloges: [];
  sriCategories: SriCategory[];
  transport: boolean;
}
```

- `ivaTaxes`: catálogo de tarifas IVA para el select "Imp. al IVA".
- `iceCataloges`: catálogo ICE; el select "Imp. al ICE" solo se renderiza si
  `iceCataloges.length > 0`.
- `sriCategories`: catálogo de categorías SRI (`{ code, type, description }`),
  ya viene filtrado/habilitado desde el backend según configuración de la
  empresa.
- `transport`: flag booleano de la empresa que indica si tiene habilitado el
  servicio de transporte (no depende del producto puntual, es una
  configuración global recibida del backend).

## Lógica de categorías SRI (`aux_cod`)

Componentes involucrados: `ProductForm.tsx` (visibilidad del selector),
`SelectSriCategory.tsx` (botón + input de búsqueda) y
`SelectModalSriCategory.tsx` (modal con filtro y listado).

**Regla de negocio (fuente de verdad, confirmada con negocio 2026-09-01):**

| `type_product` | Condición adicional      | Categoría SRI permitida | ¿Obligatoria? |
|-----------------|---------------------------|---------------------------|----------------|
| `1` (Producto)  | `iva === 5`                | `type === 'ferreteria'`   | Sí             |
| `2` (Servicio)  | `transport === true` (flag global empresa) | `type === 'transporte'` | No             |
| cualquier otro caso | —                      | (no se muestra selector)  | —              |

`ferreteria` y `transporte` son mutuamente excluyentes: dependen de
`type_product`, que es un valor único por producto, así que un mismo
registro nunca debe ofrecer ambos tipos a la vez. Servicio **nunca** puede
tener `iva === 5` (ver sección "Exclusión de IVA 5% para Servicio" más
abajo), por lo que la fila 1 de la tabla en la práctica solo aplica a
Producto.

### 1. Visibilidad del selector (`ProductForm.tsx`)

```ts
{(
    (product.type_product === 1 && product.iva === 5 && sriCategories.some(sc => sc.type === 'ferreteria')) ||
    (product.type_product === 2 && transport && sriCategories.some(sc => sc.type === 'transporte'))
) && (
    <SelectSriCategory ... />
)}
```

El bloque `SelectSriCategory` solo se muestra si además de cumplirse la
condición de negocio, el catálogo `sriCategories` trae al menos una
categoría del tipo correspondiente.

### 2. Filtro dentro del modal (`SelectModalSriCategory.tsx`)

Sobre `sriCategories`, se filtra por texto de búsqueda (código o descripción)
y por tipo, con esta lógica combinada (`matchesType`):

```ts
const matchesType =
  (product.type_product === 1 && product.iva === 5 && sriCategory.type === 'ferreteria') ||
  (product.type_product === 2 && transport && sriCategory.type === 'transporte');
```

> **Bug corregido (2026-09-01):** antes existía una rama suelta
> `transport && sriCategory.type === 'transporte'` sin exigir
> `type_product === 2`. Efecto: un producto tipo **Producto (1)** con la
> empresa configurada con `transport: true` podía mostrar y dejar
> seleccionar categorías `transporte`, que son exclusivas de Servicio.
> Se corrigió exigiendo `type_product === 2` en la misma rama que revisa
> `transport`, y se agregó `type_product === 1` explícito a la rama de
> `ferreteria` por simetría/defensividad.

### 3. Selección

`SelectSriCategory` abre el modal, al hacer click en una fila llama
`selectSriCategory(sriCategory)` que hace `setProduct({ ...prev, aux_cod: sriCategory.code })`
y muestra la descripción en el input de búsqueda como label.

### 4. Validación de envío (`schemas/product.schema.ts`)

```ts
.refine(
  (data) => !(data.type_product === 1 && data.iva === 5) || (data.aux_cod && data.aux_cod.trim() !== ""),
  { path: ['aux_cod'], message: 'Código auxiliar requerido si el producto tiene IVA 5%' }
);
```

`aux_cod` (categoría SRI) es **obligatorio únicamente** para Producto (1)
con IVA 5%. Servicio (2) nunca lo exige, tenga o no `transport` activo ni
categoría seleccionada.

> **Bug corregido (2026-09-01):** la condición anterior era
> `data.iva !== 5 || (aux_cod...)`, sin revisar `type_product`. Con datos
> heredados/editados donde un registro `type_product === 2` conservaba
> `iva === 5` (estado que la UI ya no permite generar desde cero, pero que
> podía existir en un registro previamente guardado como Producto y luego
> editado a Servicio sin pasar por `handleSelect`), el formulario bloqueaba
> el guardado de un Servicio exigiendo una categoría SRI que ni siquiera se
> mostraba en pantalla (por la regla de visibilidad de la sección 1). Se
> corrigió acotando el `refine` a `type_product === 1 && iva === 5`.

## Tipo de producto (`type_product`)

Definido en `useProductForm.ts`:

```ts
const optionType = [
  { value: 1, label: 'Producto' },
  { value: 2, label: 'Servicio' },
];
```

### Exclusión de IVA 5% para Servicio

Regla de negocio: la categoría SRI `ferreteria` (asociada a IVA 5%) es
exclusiva de `type_product === 1` (Producto); un Servicio nunca debe poder
seleccionar tarifa IVA 5%. Implementado en `ProductForm.tsx`:

```ts
const ivaTaxOptions = product.type_product === 2
    ? ivaTaxes.filter((tax: { value: number | string }) => Number(tax.value) !== 5)
    : ivaTaxes;
```

`ivaTaxOptions` reemplaza a `ivaTaxes` como `options` del select "Imp. al
IVA". Adicionalmente, `useProductForm.handleSelect` resetea `iva` a `4`
(15%) si el usuario cambia `type_product` a Servicio mientras `iva === 5`
está seleccionado, para evitar que quede un valor inválido/oculto en el
select.

## Precio y desglose de IVA

- Checkbox "¿Necesitas desglosar el IVA?" (`breakdown`, estado local en
  `useProductForm`) alterna un input adicional "Total" (precio con IVA
  incluido).
- `handleTotal` calcula el precio base a partir del total ingresado:
  `price1 = total / 1.15` (redondeado a 6 decimales), asumiendo IVA del 15%
  fijo para este cálculo — no usa el catálogo `ivaTaxes` seleccionado.
- `price1` siempre es el campo que se envía al backend; `total` es solo un
  input auxiliar de UI, no se persiste en `Product`.

## Envío del formulario (`ButtonSubmit.tsx`)

1. Clona `product` a `form`.
2. Valida con `productSchema.safeParse(form)`; si falla, mapea errores a
   `errorProduct` vía `parseZodErrors` y corta.
3. Si `params.id` existe → `updateProduct`, si no → `storeProduct`.
4. Éxito → redirige a `/products`. Error de validación backend (422) →
   `setErrorProduct(errors)`.

## Catálogos condicionales

- **ICE**: el select solo aparece si `iceCataloges.length > 0` (viene del
  backend ya filtrado según si el producto/empresa aplica ICE).
- **SRI Categoría**: ver sección anterior.

## Resumen de reglas de negocio confirmadas

1. `type_product === 1` (Producto) + `iva === 5` → mostrar, filtrar y
   **exigir** categoría SRI `ferreteria`.
2. `type_product === 2` (Servicio) + `transport === true` (flag global de la
   empresa) → mostrar y filtrar categoría SRI `transporte`; **nunca
   obligatoria**.
3. `ferreteria` y `transporte` no deben mostrarse combinadas para un mismo
   producto: son mutuamente excluyentes según `type_product` (1 = Producto
   → ferreteria, 2 = Servicio → transporte). El flag global `transport` de
   la empresa **solo** habilita `transporte` si además `type_product === 2`;
   no aplica por sí solo a un Producto.
4. Servicio no admite `iva === 5` — se filtra del select y `handleSelect`
   la resetea a `4` si se cambia `type_product` a Servicio con `iva === 5`
   seleccionado (`useProductForm.ts`).
