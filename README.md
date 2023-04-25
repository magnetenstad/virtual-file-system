# virtual-file-system

npm package for virtual file directories. Wraps the [Node.js fs API](https://nodejs.org/api/fs.html). Meant to simplify reading of entire directories and manipulation of file contents.

```sh
npm i virtual-file-system
```

## Example use case

```ts
const dir = Directory.read('example/') // read dir into memory
dir.filter((file) => file.name.getExtension() == 'md') // manipulate
dir.apply((file) => file.content += '\n Author: Me')
dir.write('dist') // write back to disk
```

See `test/files.test.ts` for more examples.

## API

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
  getPath(): string;
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
  static read(path: string, exclude?: (RegExp | string)[]): Directory | null;
  getDirectories(name: string): Directory[];
  getDirectory(name: string): Directory | null;
  getFiles(name: RegExp | string): File[];
  getFile(name: RegExp | string): File | null;
  removeFile(file: File): void;
  apply(func: (f: File) => void): void;
  filter(func: (f: File) => boolean): void;
  toString(): string;
}
```
