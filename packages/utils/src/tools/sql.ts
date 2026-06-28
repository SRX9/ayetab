import { format as formatSql } from "sql-formatter";
import type { ToolResult } from "../types";

export function formatSqlQuery(input: string, dialect = "sql"): ToolResult {
  try {
    const output = formatSql(input, {
      language: dialect as "sql" | "postgresql" | "mysql" | "mariadb" | "sqlite",
      tabWidth: 2,
      keywordCase: "upper",
    });
    return { output, language: "sql" };
  } catch (e) {
    return { output: "", error: `SQL format failed: ${(e as Error).message}` };
  }
}
