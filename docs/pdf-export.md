# PDF Export

## Что реализовано

- `GET /api/admin/exports/customers?batch=<code>`
  - PDF по покупателям внутри поставки
  - включает buyer, состав заказа, комментарий и итог по каждому заказу

- `GET /api/admin/exports/products?batch=<code>`
  - PDF по сводке товаров внутри поставки
  - включает количество, единицы, число покупателей, число заказов и итоговую сумму

## Web entry point

- `/admin/exports`
  - выбор поставки
  - кнопка `PDF по покупателям`
  - кнопка `PDF по товарам`

## Проверка локально

1. Запустить API:
   - `npm run dev:api`
2. Запустить web:
   - `npm run dev:web`
3. Открыть:
   - `http://localhost:3000/admin/exports`
4. Выбрать поставку и скачать оба PDF

## Примечания

- PDF генерируются на backend через `pdfmake`
- шрифт поддерживает кириллицу
- export actions дополнительно пишутся в `AdminAuditLog`, если текущий admin разрешается в локального пользователя
