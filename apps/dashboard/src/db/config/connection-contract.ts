/*
 * Connection contract — the async database primitives every real backend
 * implements. Separate from the sync, UI-facing PersistenceAdapter: a backend
 * adapter bridges the two (async DB → cached sync snapshot). Declarations only.
 */

export interface QueryResult<Row = Record<string, unknown>> {
  rows: Row[];
  rowCount: number;
}

export interface PreparedStatement {
  execute<Row = Record<string, unknown>>(params?: unknown[]): Promise<QueryResult<Row>>;
}

export interface DatabaseTransaction {
  query<Row = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<Row>>;
  execute(sql: string, params?: unknown[]): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

export interface DatabaseHealth {
  ok: boolean;
  provider: string;
  latencyMs: number;
  checkedAt: string;
}

export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  health(): Promise<DatabaseHealth>;

  query<Row = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<Row>>;
  execute(sql: string, params?: unknown[]): Promise<void>;
  prepare(sql: string): Promise<PreparedStatement>;

  begin(): Promise<DatabaseTransaction>;
  transaction<R>(work: (tx: DatabaseTransaction) => Promise<R>): Promise<R>;
}
