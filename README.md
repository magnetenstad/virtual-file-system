# virtual-file-system

npm package for virtual file systems (directories, files)

```sh
npm i virtual-file-system
```

Exports classes `File` and `Directory`

```ts
class File {
  constructor(name, data, location='')
  write(location=this.location)
  static read(path): File
  toString(): string
}

class Directory {
  constructor(name, location='')
  write(location=this.location)
  writeContents(location=this.location)
  static read(path, exclude=[]): Directory
  getDirectories(name): Array<Directory>
  getDirectory(name): Directory
  getFiles(name): Array<File>
  getFile(name): File
  removeFile(file)
  toString(): string
}
```
