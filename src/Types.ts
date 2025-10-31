export interface Message {
  Index: number;
  Phone: string;
  Date: string;
  Content: string;
}

export interface ConfigFile {
  enable_whitelist: boolean;
  whitelist: string[];
  admin_list: string[];
}
