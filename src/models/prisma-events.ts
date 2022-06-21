export interface LogEvent {
  timestamp: Date;
  message: string;
  target: string;
}

export interface QueryEvent {
  timestamp: Date;
  query: string; // Query sent to the database
  params: string; // Query parameters
  duration: number; // Time elapsed (in milliseconds) between client issuing query and database responding - not only time taken to run query
  target: string;
}
