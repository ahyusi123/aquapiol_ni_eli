HR MIGRATION FIX - CASE-INSENSITIVE DUPLICATE COLUMN CHECK

The previous migration checked describeTable() keys using exact casing.
In this database, MySQL reported firstName as a duplicate even though that
exact-key check did not find it. This version checks INFORMATION_SCHEMA.COLUMNS
using LOWER() for both table and column names, matching MySQL's case-insensitive
column-name behavior. It also safely handles ER_DUP_FIELDNAME race/duplicate
responses.

The application startup uses sequelize.sync() without alter:true, so it will
not attempt to alter existing tables on every launch.

Run inside the behssyko folder:
  npm install
  npm run migrate
  npm run xian

Do not drop the database or use force:true. Existing data is preserved.
