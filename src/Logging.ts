export const serverLog = (text: string) => {
  console.log(`\x1b[36m[${new Date().toISOString()}]\x1b[0m ${text}`);
};
