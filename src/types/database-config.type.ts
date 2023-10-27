export type DatabaseConfigType = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  client: "mysql" | "postgres";
};
