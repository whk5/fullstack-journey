const info = {
  runtime: "Node.js",
  version: process.version,
  platform: `${process.platform}/${process.arch}`,
  cwd: process.cwd(),
};

console.log("Hello, Node + TypeScript!");
console.table(info);
