import { writeFile, mkdir } from "node:fs/promises";
import { foundationDatabase } from "./database.mjs";

const database = await foundationDatabase();
try {
  const { rows } = await database.query(`
    select c.relname as table_name, a.attname as column_name, t.typname as type_name,
      a.attnotnull as required, (a.atthasdef) as has_default
    from pg_catalog.pg_attribute a
    join pg_catalog.pg_class c on c.oid = a.attrelid
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    join pg_catalog.pg_type t on t.oid = a.atttypid
    where n.nspname = 'public' and c.relkind = 'r' and a.attnum > 0 and not a.attisdropped
    order by c.relname, a.attnum
  `);
  const { rows: relations } = await database.query(`
    select c.conname as name, child.relname as child_table, parent.relname as parent_table,
      array(select a.attname from unnest(c.conkey) with ordinality k(num, ord)
        join pg_catalog.pg_attribute a on a.attrelid = c.conrelid and a.attnum = k.num order by k.ord) as columns,
      array(select a.attname from unnest(c.confkey) with ordinality k(num, ord)
        join pg_catalog.pg_attribute a on a.attrelid = c.confrelid and a.attnum = k.num order by k.ord) as referenced_columns
    from pg_catalog.pg_constraint c
    join pg_catalog.pg_class child on child.oid = c.conrelid
    join pg_catalog.pg_class parent on parent.oid = c.confrelid
    join pg_catalog.pg_namespace n on n.oid = child.relnamespace
    join pg_catalog.pg_namespace pn on pn.oid = parent.relnamespace
    where c.contype = 'f' and n.nspname = 'public' and pn.nspname = 'public'
    order by c.conname
  `);
  const typeMap = { uuid: "string", text: "string", timestamptz: "string", int2: "number", int4: "number", bool: "boolean" };
  let output = '// Generated from migrations by npm run db:types. Do not edit by hand.\nexport type Database = {\n  public: {\n    Tables: {\n';
  for (const table of [...new Set(rows.map((row) => row.table_name))]) {
    output += `      ${table}: {\n`;
    const columns = rows.filter((row) => row.table_name === table);
    for (const shape of ["Row", "Insert", "Update"]) {
      output += `        ${shape}: {\n`;
      for (const column of columns) {
        const mapped = typeMap[column.type_name];
        if (!mapped) throw new Error(`Unmapped SQL type ${column.type_name}; update type generation before committing.`);
        const optional = shape === "Update" || (shape === "Insert" && (!column.required || column.has_default));
        output += `          ${column.column_name}${optional ? "?" : ""}: ${mapped}${column.required ? "" : " | null"};\n`;
      }
      output += '        };\n';
    }
    output += '        Relationships: [\n';
    for (const relation of relations.filter((row) => row.child_table === table)) {
      output += `          { foreignKeyName: ${JSON.stringify(relation.name)}; columns: ${JSON.stringify(relation.columns)}; isOneToOne: false; referencedRelation: ${JSON.stringify(relation.parent_table)}; referencedColumns: ${JSON.stringify(relation.referenced_columns)} },\n`;
    }
    output += '        ];\n      };\n';
  }
  output += '    };\n    Views: { [_ in never]: never };\n    Functions: { [_ in never]: never };\n    Enums: { [_ in never]: never };\n    CompositeTypes: { [_ in never]: never };\n  };\n};\n';
  await mkdir(new URL('../src/types/', import.meta.url), { recursive: true });
  await writeFile(new URL('../src/types/database.ts', import.meta.url), output);
  console.log('Generated database types from migrated isolated PostgreSQL.');
} finally { await database.close(); }
