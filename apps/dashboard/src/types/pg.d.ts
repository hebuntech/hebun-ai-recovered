declare module "pg" {
  export interface QueryResult<Row = Record<string, unknown>> {
    rows: Row[];
    rowCount: number;
  }

  export interface PoolClient {
    query<Row = Record<string, unknown>>(
      sql: string,
      params?: readonly unknown[],
    ): Promise<QueryResult<Row>>;
    release(): void;
  }

  export interface PoolConfig {
    connectionString?: string;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
    application_name?: string;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    connect(): Promise<PoolClient>;
    end(): Promise<void>;
  }

  export class Client {
    constructor(config?: { connectionString?: string });
    connect(): Promise<void>;
    end(): Promise<void>;
    query<Row = Record<string, unknown>>(
      sql: string,
      params?: readonly unknown[],
    ): Promise<QueryResult<Row>>;
  }
}
