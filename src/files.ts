import fs from 'fs';

export { File, Directory };

class File {
  name: string;
  data: string;
  metadata: any = {};
  location: string;

  constructor(name: string, data: string, options?: { location?: string }) {
    this.name = name;
    this.data = data;
    this.location = options?.location ?? '';
  }

  write(location = this.location) {
    location = location.replaceAll('\\\\', '\\');
    const path =
      (location.length > 0
        ? location.endsWith('\\')
          ? location
          : location + '\\'
        : '') + this.name;
    fs.writeFileSync(path, this.data, {
      encoding: getEncoding(this.getExtension()),
    });
  }

  static read(path: string): File | null {
    if (!fs.existsSync(path)) {
      console.warn(`[WARNING] Could not read file ${path}`);
      return null;
    }
    const { name, location, extension } = splitPath(path);
    const data = fs.readFileSync(path, { encoding: getEncoding(extension) });
    return new File(name, data, { location });
  }

  getExtension() {
    return splitPath(this.name).extension;
  }

  getNameWithoutExtension() {
    const extension = '.' + this.getExtension();
    return this.name.substring(0, this.name.length - extension.length);
  }

  toString() {
    return `${this.name}`;
  }
}

class Directory {
  name: string;
  location: string;
  files: File[];
  directories: Directory[];

  constructor(name: string, location = '') {
    this.name = name;
    this.location = location;
    this.files = [];
    this.directories = [];
  }

  /**
   * Overwrites existing folder.
   * @param {string} location
   */
  write(location: string = this.location) {
    const path = ((location ? location + '\\' : '') + this.name).replaceAll(
      '\\\\',
      '\\'
    );
    fs.rmSync(path, { recursive: true, force: true });
    fs.mkdirSync(path);
    this.files.forEach((file) => {
      file.write(path);
    });
    this.directories.forEach((directory) => {
      directory.write(path);
    });
  }

  writeContents(location = this.location) {
    this.files.forEach((file) => {
      file.write(location);
    });
    this.directories.forEach((directory) => {
      directory.write(location);
    });
  }

  static read(
    path: string,
    exclude: (RegExp | string)[] = []
  ): Directory | null {
    if (!fs.existsSync(path)) {
      console.warn(`[WARNING] Could not read directory ${path}`);
      return null;
    }
    const { name, location } = splitPath(path);
    const directory = new Directory(name, location);
    const files = fs.readdirSync(path);
    files.forEach((filename) => {
      if (exclude.some((name) => filename.match(name))) return;
      const subPath = path + '\\' + filename;
      if (isDirectoryPath(subPath)) {
        const subDirectory = Directory.read(subPath, exclude);
        if (!subDirectory) return;
        directory.directories.push(subDirectory);
      } else {
        const file = File.read(subPath);
        if (!file) return;
        file.name = filename;
        directory.files.push(file);
      }
    });
    return directory;
  }

  getDirectories(name: string) {
    return this.directories.filter((dir) => dir.name.match(name));
  }

  getDirectory(name: string) {
    const files = this.getDirectories(name);
    return files.length ? files[0] : null;
  }

  getFiles(name: RegExp | string) {
    return this.files.filter((file) => file.name.match(name));
  }

  getFile(name: RegExp | string) {
    const files = this.getFiles(name);
    return files.length ? files[0] : null;
  }

  removeFile(file: File) {
    const index = this.files.indexOf(file);
    if (index > -1) {
      this.files.splice(index, 1);
    }
  }

  apply(func: (f: File) => void) {
    this.files.forEach((file) => {
      func(file);
    });
    this.directories.forEach((directory) => {
      directory.apply(func);
    });
  }

  toString() {
    let result = `${this.name} {`;
    this.files.forEach((file) => {
      result += `\n${file.toString()}`;
    });
    this.directories.forEach((directory) => {
      result += `\n${directory.toString()}`;
    });
    result = result.replaceAll('\n', '\n\t');
    return `${result}\n}`;
  }
}

function splitPath(path: string) {
  const split = path.split('\\').filter((e) => e.length > 0);
  if (split.length == 0) {
    throw new Error('Cannot split empty path!');
  }
  let name = split.pop()!;
  const location = split.join('\\') + '\\';
  const extension = name.includes('.')
    ? name.substring(name.lastIndexOf('.') + 1).toLowerCase()
    : '';
  return { name, location, extension };
}

function isDirectoryPath(path: string) {
  const { name } = splitPath(path);
  return path.endsWith('//') || !name.includes('.');
}

function getEncoding(extension: string) {
  switch (extension) {
    case 'png':
      return 'binary';
    case 'jpg':
      return 'binary';
    case 'jpeg':
      return 'binary';
    case 'ico':
      return 'binary';
    case 'pdf':
      return 'binary';
    default:
      return 'utf-8';
  }
}
