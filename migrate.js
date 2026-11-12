import { sequelize } from "./models/db.js";
import "./models/userModel.js";
import "./models/hrModels.js";

const quoteIdentifier = (value) =>
  "`" + String(value).replace(/`/g, "``") + "`";

async function columnExists(tableName, columnName) {
  const table = typeof tableName === "string" ? tableName : tableName.tableName;
  const [rows] = await sequelize.query(
    `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND LOWER(TABLE_NAME) = LOWER(:tableName)
        AND LOWER(COLUMN_NAME) = LOWER(:columnName)
      LIMIT 1`,
    { replacements: { tableName: table, columnName } }
  );
  return rows.length > 0;
}

try {
  await sequelize.authenticate();
  console.log("Connected to MySQL database.");

  // Create missing tables only. Avoid alter:true because this project has
  // legacy columns and Sequelize's alter sync previously caused duplicates.
  await sequelize.sync();

  const queryInterface = sequelize.getQueryInterface();

  for (const model of Object.values(sequelize.models)) {
    const tableName = model.getTableName();
    const table = typeof tableName === "string" ? tableName : tableName.tableName;
    const attributes = model.getAttributes();

    for (const [attributeName, attribute] of Object.entries(attributes)) {
      const columnName = attribute.field || attributeName;

      if (await columnExists(table, columnName)) {
        console.log(`OK ${table}.${columnName} already exists.`);
        continue;
      }

      const definition = {
        type: attribute.type,
        allowNull: true
      };

      if (attribute.defaultValue !== undefined) {
        definition.defaultValue = attribute.defaultValue;
      }

      try {
        await queryInterface.addColumn(tableName, columnName, definition);
        console.log(`Added ${table}.${columnName}.`);
      } catch (error) {
        // Protect against a column being added between the check and ALTER,
        // or MySQL treating differently-cased column names as identical.
        if (
          error.original?.code === "ER_DUP_FIELDNAME" ||
          error.parent?.code === "ER_DUP_FIELDNAME"
        ) {
          console.log(`OK ${table}.${columnName} already exists (MySQL duplicate check).`);
          continue;
        }
        throw error;
      }
    }
  }

  console.log("Migration completed successfully.");
} catch (error) {
  console.error("Migration failed:", error.original?.sqlMessage || error.message);
  console.error(error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
