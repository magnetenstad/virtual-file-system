# virtual-file-system

npm package for virtual file systems (directories, files)

```sh
npm i virtual-file-system
```

Exports classes `File` and `Directory`

```ts
export { File, Directory };
declare class File {
  name: string;
  data: string;
  metadata: any;
  location: string;
  constructor(
    name: string,
    data: string,
    options?: {
      location?: string;
    }
  );
  write(location?: string): void;
  static read(path: string): File | null;
  getExtension(): string;
  getNameWithoutExtension(): string;
  toString(): string;
}
declare class Directory {
  name: string;
  location: string;
  files: File[];
  directories: Directory[];
  constructor(name: string, location?: string);
  /**
   * Overwrites existing folder.
   * @param {string} location
   */
  write(location?: string): void;
  writeContents(location?: string): void;
  static read(path: string, exclude?: string[]): Directory | null;
  getDirectories(name: string): Directory[];
  getDirectory(name: string): Directory | null;
  getFiles(name: RegExp | string): File[];
  getFile(name: RegExp | string): File | null;
  removeFile(file: File): void;
  apply(func: (f: File) => void): void;
  toString(): string;
}
```
